"""
Detection History & Dashboard Router.
Provides authenticated endpoints for retrieving and managing the current user's scan history and statistics.
All queries are strictly isolated to `Detection.user_id == current_user.id`.
"""

from datetime import datetime, timezone, timedelta
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import Date, cast, desc, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Detection, User
from app.schemas import (
    ChartDayStats,
    DashboardStatsResponse,
    DetectionHistoryItem,
    DetectionHistoryResponse,
)
from app.services.auth_service import get_current_user

logger = logging.getLogger("scamshield.detections_router")

router = APIRouter(prefix="/api/v1", tags=["Detection History & Dashboard"])


def _format_detection(d: Detection) -> DetectionHistoryItem:
    # Determine user-friendly result verdict
    if d.is_phishing:
        result_verdict = "Phishing"
    elif d.risk_percentage >= 40.0:
        result_verdict = "Suspicious"
    else:
        result_verdict = "Safe"

    # Formatted display string e.g. "Sep 16, 2026, 01:43 PM"
    formatted_date = d.created_at.strftime("%b %d, %Y, %I:%M %p") if d.created_at else ""
    iso_date = d.created_at.isoformat() if d.created_at else ""

    # Preview string for table display
    clean_text = d.input_text or ""
    preview_text = clean_text[:80] + "..." if len(clean_text) > 80 else clean_text

    return DetectionHistoryItem(
        id=d.id,
        input_type=d.input_type,
        type=d.input_type,
        input_text=d.input_text,
        preview=preview_text,
        input=d.input_text,
        classification=d.classification,
        result=result_verdict,
        risk_percentage=round(d.risk_percentage, 2),
        confidence=round(d.risk_percentage, 2),
        is_phishing=d.is_phishing,
        is_spam=d.is_spam,
        is_starred=bool(getattr(d, "is_starred", False)),
        model_used=d.model_used,
        source=getattr(d, "source", None) or "manual",
        sender=getattr(d, "sender", None),
        subject=getattr(d, "subject", None),
        created_at=iso_date,
        date_time=formatted_date,
        timestamp=formatted_date,
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
    source: Optional[str] = Query(None, description="Filter by source: manual or gmail"),
    result: Optional[str] = Query(None, description="Filter by result: safe, suspicious, or phishing"),
    search: Optional[str] = Query(None, description="Search term in input text"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)"),
    starred: Optional[bool] = Query(None, description="Filter by starred status"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=50, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> DetectionHistoryResponse:
    """
    Returns only detection records belonging to the authenticated user.
    """
    query = db.query(Detection).filter(Detection.user_id == current_user.id)

    if starred is True:
        query = query.filter(Detection.is_starred == True)
    elif starred is False:
        query = query.filter(or_(Detection.is_starred == False, Detection.is_starred == None))

    if type and type != "all":
        t = type.lower()
        if t in ("message", "sms"):
            query = query.filter(Detection.input_type == "sms")
        else:
            query = query.filter(Detection.input_type == t)

    if result and result != "all":
        r = result.lower()
        if r in ("phishing", "threat"):
            query = query.filter(Detection.is_phishing == True)
        elif r == "safe":
            query = query.filter(Detection.is_phishing == False, Detection.risk_percentage < 40.0)
        elif r == "suspicious":
            query = query.filter(Detection.is_phishing == False, Detection.risk_percentage >= 40.0)

    if date:
        try:
            target_date = datetime.strptime(date.strip(), "%Y-%m-%d").date()
            query = query.filter(cast(Detection.created_at, Date) == target_date)
        except Exception:
            pass

    if source and source != "all":
        query = query.filter(Detection.source == source.lower())

    if search:
        s = search.strip()
        if s:
            pattern = f"%{s}%"
            query = query.filter(
                or_(
                    Detection.input_text.ilike(pattern),
                    Detection.subject.ilike(pattern),
                    Detection.sender.ilike(pattern),
                )
            )

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
    "/detections/history",
    summary="Delete all detection records belonging to current user",
)
@router.delete(
    "/history",
    include_in_schema=False,
)
def clear_user_detection_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Deletes all detection records belonging to the authenticated user.
    """
    deleted_count = (
        db.query(Detection)
        .filter(Detection.user_id == current_user.id)
        .delete(synchronize_session=False)
    )
    db.commit()
    return {
        "message": f"All detection history cleared successfully ({deleted_count} records removed).",
        "deleted_count": deleted_count,
    }


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


@router.patch(
    "/detections/history/{detection_id}/star",
    summary="Toggle star status on a detection record",
)
@router.patch(
    "/history/{detection_id}/star",
    include_in_schema=False,
)
def toggle_star_detection(
    detection_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Dict[str, Any]:
    """
    Toggles the is_starred status of a detection record belonging to current_user.
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

    current_star = bool(getattr(record, "is_starred", False))
    record.is_starred = not current_star
    db.commit()
    return {
        "id": record.id,
        "is_starred": record.is_starred,
        "message": "Detection starred." if record.is_starred else "Detection unstarred.",
    }


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


@router.get(
    "/dashboard/chart",
    response_model=List[ChartDayStats],
    summary="Get 7-day scan activity overview for current user",
)
def get_user_dashboard_chart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> List[ChartDayStats]:
    """
    Calculates 7-day scan activity breakdown (safe, suspicious, phishing) for the user.
    """
    user_detections = db.query(Detection).filter(Detection.user_id == current_user.id).all()

    # Generate past 7 days (including today) in chronological order
    today = datetime.now(timezone.utc).date()
    days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    stats_by_date = {d: {"safe": 0, "suspicious": 0, "phishing": 0, "total": 0} for d in days}

    for d in user_detections:
        if d.created_at:
            rec_date = d.created_at.date()
            if rec_date in stats_by_date:
                stats_by_date[rec_date]["total"] += 1
                if d.is_phishing:
                    stats_by_date[rec_date]["phishing"] += 1
                elif d.risk_percentage < 40.0:
                    stats_by_date[rec_date]["safe"] += 1
                else:
                    stats_by_date[rec_date]["suspicious"] += 1

    chart_points = []
    for day_date in days:
        counts = stats_by_date[day_date]
        chart_points.append(
            ChartDayStats(
                date=day_date.isoformat(),
                day=day_date.strftime("%a"),
                safe=counts["safe"],
                suspicious=counts["suspicious"],
                phishing=counts["phishing"],
                total=counts["total"],
            )
        )
    return chart_points

