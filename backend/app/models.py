from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    input_type: Mapped[str] = mapped_column(String, nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    predicted_label: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    classification: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    score_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    risk_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    is_phishing: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_spam: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    model_used: Mapped[str] = mapped_column(String, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
