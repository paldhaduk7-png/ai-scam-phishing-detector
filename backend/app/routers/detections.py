"""
Detection History & Dashboard Router.
Provides authenticated endpoints for retrieving and managing the current user's scan history and statistics.
All queries are strictly isolated to `Detection.user_id == current_user.id`.
"""

from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Detection, User
from app.schemas import (
    DashboardStatsResponse,
    DetectionHistoryItem,
    DetectionHistoryResponse,
)
from app.services.auth_service import get_current_user

logger = logging.getLogger("scamshield.detections_router")

router = APIRouter(prefix="/api/v1", tags=["Detection History & Dashboard"])


def _format_detection(d: Detection) -> DetectionHistoryItem:
    return DetectionHistoryItem(
        id=d.id,
        input_type=d.input_type,
        input_text=d.input_text,
        classification=d.classification,
        risk_percentage=d.risk_percentage,
        is_phishing=d.is_phishing,
        is_spam=d.is_spam,
        model_used=d.model_used,
        created_at=d.created_at.isoformat() if d.created_at else "",
    )


@router.get(
    "/detections/history",
    response_model=DetectionHistoryResponse,
    summary="Get paginated detection history for current user",
)
@router.get(
    "/history",
    response_model=DetectionHistoryResponse,
    include_in_schema=False,
)
def get_user_detection_history(
    type: Optional[str] = Query(None, description="Filter by channel: email, sms, or url"),
    result: Optional[str] = Query(None, description="Filter by result: safe or phishing"),
    search: Optional[str] = Query(None, description="Search term in input text"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DetectionHistoryResponse:
    """
    Returns only detection records belonging to the authenticated user.
    """
    query = db.query(Detection).filter(Detection.user_id == current_user.id)

    if type and type != "all":
        query = query.filter(Detection.input_type == type.lower())

    if result and result != "all":
        if result == "phishing" or result == "threat":
            query = query.filter(Detection.is_phishing == True)
        elif result == "safe":
            query = query.filter(Detection.is_phishing == False)

    if search:
        query = query.filter(Detection.input_text.ilike(f"%{search}%"))

    total = query.count()
    offset = (page - 1) * limit
    items = query.order_by(desc(Detection.created_at)).offset(offset).limit(limit).all()

    total_pages = max(1, (total + limit - 1) // limit)

    return DetectionHistoryResponse(
        items=[_format_detection(d) for d in items],
        total=total,
        page=page,
        totalPages=total_pages,
    )


@router.delete(
    "/detections/history/{detection_id}",
    summary="Delete a detection record belonging to current user",
)
@router.delete(
    "/history/{detection_id}",
    include_in_schema=False,
)
def delete_user_detection(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, str]:
    """
    Deletes a detection record. Strictly validates that the record belongs to current_user.
    """
    record = (
        db.query(Detection)
        .filter(Detection.id == detection_id, Detection.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Detection record not found or unauthorized.",
        )

    db.delete(record)
    db.commit()
    return {"message": "Record deleted successfully."}


@router.get(
    "/dashboard/stats",
    response_model=DashboardStatsResponse,
    summary="Get user dashboard statistics",
)
def get_user_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DashboardStatsResponse:
    """
    Calculates summary scan metrics strictly for the authenticated user.
    """
    user_detections = db.query(Detection).filter(Detection.user_id == current_user.id).all()

    total = len(user_detections)
    phishing = sum(1 for d in user_detections if d.is_phishing)
    safe = sum(1 for d in user_detections if not d.is_phishing and d.risk_percentage < 40.0)
    suspicious = total - phishing - safe

    return DashboardStatsResponse(
        totalScans=total,
        safeResults=safe,
        suspicious=suspicious,
        phishing=phishing,
    )


@router.get(
    "/dashboard/recent",
    response_model=List[DetectionHistoryItem],
    summary="Get recent scans for current user",
)
def get_user_recent_scans(
    limit: int = Query(5, ge=1, le=10),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[DetectionHistoryItem]:
    """
    Fetches the latest scans for the authenticated user.
    """
    items = (
        db.query(Detection)
        .filter(Detection.user_id == current_user.id)
        .order_by(desc(Detection.created_at))
        .limit(limit)
        .all()
    )
    return [_format_detection(d) for d in items]
