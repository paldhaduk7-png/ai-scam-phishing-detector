from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    profile_photo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    profile_photo_public_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    # Role-based access control: ADMIN or USER
    role: Mapped[str] = mapped_column(String(50), default="USER", server_default="USER", nullable=False, index=True)
    
    # Soft deletion & account status: ACTIVE or SOFT_DELETED
    account_status: Mapped[str] = mapped_column(String(50), default="ACTIVE", server_default="ACTIVE", nullable=False, index=True)
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_login_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    
    # Gmail access request lifecycle status: NOT_REQUESTED, PENDING, APPROVED, REJECTED, REVOKED
    gmail_access_status: Mapped[str] = mapped_column(
        String(50), default="NOT_REQUESTED", server_default="NOT_REQUESTED", nullable=False, index=True
    )
    # Approved Gmail address(es) stored as JSON string or comma-separated list
    approved_gmail_emails: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    detections: Mapped[List["Detection"]] = relationship("Detection", back_populates="user")
    password_reset_otps: Mapped[List["PasswordResetOTP"]] = relationship(
        "PasswordResetOTP",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    gmail_requests: Mapped[List["GmailAccessRequest"]] = relationship(
        "GmailAccessRequest",
        foreign_keys="GmailAccessRequest.user_id",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    gmail_history: Mapped[List["GmailAccessHistory"]] = relationship(
        "GmailAccessHistory",
        back_populates="user",
        cascade="all, delete-orphan",
    )


class PasswordResetOTP(Base):
    __tablename__ = "password_reset_otps"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    otp_hash: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_used: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="password_reset_otps")


class GmailAccessRequest(Base):
    __tablename__ = "gmail_access_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Stored as JSON string or comma-separated list of requested Gmail addresses
    requested_emails: Mapped[str] = mapped_column(Text, nullable=False)
    # Status: PENDING, APPROVED, REJECTED, REVOKED
    status: Mapped[str] = mapped_column(String(50), default="PENDING", server_default="PENDING", nullable=False, index=True)
    requested_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    reviewed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reviewed_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    rejection_reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="gmail_requests")
    reviewer: Mapped[Optional["User"]] = relationship("User", foreign_keys=[reviewed_by])


class GmailAccessHistory(Base):
    __tablename__ = "gmail_access_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Action: REQUESTED, APPROVED, REJECTED, REVOKED, REQUESTED_AGAIN
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    previous_status: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    new_status: Mapped[str] = mapped_column(String(50), nullable=False)
    gmail_addresses: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    performed_by: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    performed_by_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    admin_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped["User"] = relationship("User", back_populates="gmail_history")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    # Actions: USER_SOFT_DELETED, USER_RESTORED, USER_PERMANENTLY_DELETED,
    # GMAIL_ACCESS_REQUESTED, GMAIL_ACCESS_APPROVED, GMAIL_ACCESS_REJECTED, GMAIL_ACCESS_REVOKED, ROLE_CHANGED
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    target_user_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    target_user_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    admin_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    admin_email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    details: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )


class Detection(Base):
    __tablename__ = "detections"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    input_type: Mapped[str] = mapped_column(String, nullable=False)
    input_text: Mapped[str] = mapped_column(Text, nullable=False)
    predicted_label: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    classification: Mapped[str] = mapped_column(String, nullable=False)
    score: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    score_type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    risk_percentage: Mapped[float] = mapped_column(Float, nullable=False)
    is_phishing: Mapped[bool] = mapped_column(Boolean, nullable=False)
    is_spam: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    is_starred: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    model_used: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String(50), default="manual", server_default="manual", nullable=False)
    sender: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    subject: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    user: Mapped[Optional["User"]] = relationship("User", back_populates="detections")

