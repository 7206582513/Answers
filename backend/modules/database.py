from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import uuid
import os

# Database setup
MONGO_URL = os.getenv('MONGO_URL', 'sqlite:///./insightforge.db')
engine = create_engine(MONGO_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Database Models
class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    task_type = Column(String, nullable=False)
    target_column = Column(String, nullable=False)
    dataset_info = Column(Text)  # JSON string
    results = Column(Text)  # JSON string


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    message = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    context_type = Column(String, default="general")


# Create tables
Base.metadata.create_all(bind=engine)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
