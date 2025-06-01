import sqlite3
import json
from typing import Dict, Any, List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import create_engine


class DatabaseManager:
    """Enhanced database manager for session and chat management"""

    def __init__(self, engine):
        self.engine = engine

    def save_analysis_session(self, db: Session, session_data: Dict[str, Any]) -> str:
        """Save analysis session to database"""
        try:
            from server import AnalysisSession

            session = AnalysisSession(
                task_type=session_data.get('task_type'),
                target_column=session_data.get('target_column'),
                dataset_info=json.dumps(session_data.get('dataset_info', {})),
                results=json.dumps(session_data.get('results', {}))
            )

            db.add(session)
            db.commit()
            db.refresh(session)

            return session.id

        except Exception as e:
            db.rollback()
            raise e

    def get_analysis_session(self, db: Session, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve analysis session from database"""
        try:
            from server import AnalysisSession

            session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()

            if session:
                return {
                    "id": session.id,
                    "created_at": session.created_at,
                    "task_type": session.task_type,
                    "target_column": session.target_column,
                    "dataset_info": json.loads(session.dataset_info) if session.dataset_info else {},
                    "results": json.loads(session.results) if session.results else {}
                }

            return None

        except Exception as e:
            print(f"Error retrieving session: {e}")
            return None

    def save_chat_message(self, db: Session, session_id: str, message: str, response: str,
                          context_type: str = "general") -> bool:
        """Save chat message to database"""
        try:
            from server import ChatMessage

            chat_msg = ChatMessage(
                session_id=session_id,
                message=message,
                response=response,
                context_type=context_type
            )

            db.add(chat_msg)
            db.commit()

            return True

        except Exception as e:
            db.rollback()
            print(f"Error saving chat message: {e}")
            return False

    def get_chat_history(self, db: Session, session_id: str) -> List[Dict[str, Any]]:
        """Get chat history for a session"""
        try:
            from server import ChatMessage

            messages = db.query(ChatMessage).filter(
                ChatMessage.session_id == session_id
            ).order_by(ChatMessage.timestamp).all()

            return [
                {
                    "id": msg.id,
                    "message": msg.message,
                    "response": msg.response,
                    "timestamp": msg.timestamp,
                    "context_type": msg.context_type
                }
                for msg in messages
            ]

        except Exception as e:
            print(f"Error retrieving chat history: {e}")
            return []

    def update_session_results(self, db: Session, session_id: str, results: Dict[str, Any]) -> bool:
        """Update session results"""
        try:
            from server import AnalysisSession

            session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()

            if session:
                session.results = json.dumps(results)
                db.commit()
                return True

            return False

        except Exception as e:
            db.rollback()
            print(f"Error updating session: {e}")
            return False

    def get_all_sessions(self, db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        """Get all analysis sessions"""
        try:
            from server import AnalysisSession

            sessions = db.query(AnalysisSession).order_by(
                AnalysisSession.created_at.desc()
            ).limit(limit).all()

            return [
                {
                    "id": session.id,
                    "created_at": session.created_at,
                    "task_type": session.task_type,
                    "target_column": session.target_column,
                    "dataset_info": json.loads(session.dataset_info) if session.dataset_info else {}
                }
                for session in sessions
            ]

        except Exception as e:
            print(f"Error retrieving sessions: {e}")
            return []

    def delete_session(self, db: Session, session_id: str) -> bool:
        """Delete analysis session and related chat messages"""
        try:
            from server import AnalysisSession, ChatMessage

            # Delete chat messages first
            db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()

            # Delete session
            session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()
            if session:
                db.delete(session)
                db.commit()
                return True

            return False

        except Exception as e:
            db.rollback()
            print(f"Error deleting session: {e}")
            return False
