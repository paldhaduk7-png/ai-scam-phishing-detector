import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from pathlib import Path

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
if ENV_PATH.exists():
    load_dotenv(dotenv_path=ENV_PATH)
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from sqlalchemy import text
from app import models

Base.metadata.create_all(bind=engine)

# Safely ensure detections has user_id and is_starred columns
with engine.connect() as _conn:
    try:
        _conn.execute(text("ALTER TABLE detections ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id) ON DELETE SET NULL;"))
        _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_detections_user_id ON detections(user_id);"))
        _conn.execute(text("ALTER TABLE detections ADD COLUMN IF NOT EXISTS is_starred BOOLEAN DEFAULT FALSE;"))
        _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_detections_is_starred ON detections(is_starred);"))
        _conn.execute(text("ALTER TABLE detections ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'manual';"))
        _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_detections_source ON detections(source);"))
        _conn.execute(text("ALTER TABLE detections ADD COLUMN IF NOT EXISTS sender VARCHAR(255);"))
        _conn.execute(text("ALTER TABLE detections ADD COLUMN IF NOT EXISTS subject VARCHAR(500);"))

        # Users table enhancements: role, account_status, deleted_at, deleted_by, last_login_at, gmail_access_status, approved_gmail_emails
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'USER';"))
        _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_role ON users(role);"))
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS account_status VARCHAR(50) DEFAULT 'ACTIVE';"))
        _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_account_status ON users(account_status);"))
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;"))
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_by INTEGER;"))
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;"))
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS gmail_access_status VARCHAR(50) DEFAULT 'NOT_REQUESTED';"))
        _conn.execute(text("CREATE INDEX IF NOT EXISTS ix_users_gmail_access_status ON users(gmail_access_status);"))
        _conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS approved_gmail_emails TEXT;"))

        # Enforce ADMIN role and full APPROVED access for designated admin emails and any ADMIN roles
        _conn.execute(text("UPDATE users SET role = 'ADMIN' WHERE LOWER(email) IN ('paldhadu7@gmail.com', 'paldhaduk7@gmail.com');"))
        _conn.execute(text("UPDATE users SET gmail_access_status = 'APPROVED' WHERE role = 'ADMIN' OR LOWER(email) IN ('paldhadu7@gmail.com', 'paldhaduk7@gmail.com');"))
        _conn.commit()
    except Exception:
        _conn.rollback()