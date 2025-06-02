import os
import sqlite3
import uuid
import json
import asyncio
from datetime import datetime
from typing import List, Optional, Dict, Any
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import cv2
import requests
from sqlalchemy import create_engine, Column, String, DateTime, Text, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import tensorflow as tf
from tensorflow import keras
from sklearn.preprocessing import LabelEncoder
import pytesseract
from pdf2image import convert_from_bytes
from langdetect import detect
import pickle
from dotenv import load_dotenv

# Import our enhanced modules
try:
    from modules.enhanced_vision import CNNChartClassifier, EnhancedImageProcessor
    from modules.enhanced_eda import AutoEDAPipeline
    from modules.enhanced_ml import EnhancedMLPipeline
    from modules.enhanced_chat import IntelligentChatEngine
    from modules.database import DatabaseManager
except ImportError:
    print("Warning: Some modules not found, using mock implementations")


    class CNNChartClassifier:
        def classify_chart(self, image):
            return "bar_chart", 0.85


    class EnhancedImageProcessor:
        def extract_chart_data(self, image, chart_type):
            return {"sample": "data"}

        def extract_chart_regions(self, image):
            return [image]


    class AutoEDAPipeline:
        async def run_analysis(self, df, task_type, target_column):
            return df, {"basic_stats": df.describe().to_dict()}


    class EnhancedMLPipeline:
        async def train_and_evaluate(self, df, task_type, target_column):
            return {"accuracy": 0.85, "model_type": "mock"}


    class IntelligentChatEngine:
        def __init__(self, api_key, api_url, model):
            self.api_key = api_key
            self.api_url = api_url
            self.model = model

        async def generate_response(self, message, context, context_type):
            return f"Mock response to: {message}"

        async def generate_chart_insights(self, chart_type, data, dataset=None):
            return [f"This appears to be a {chart_type} chart"]

        async def generate_summary_insights(self, chart_data, dataset):
            return "Summary of chart analysis"


    class DatabaseManager:
        def __init__(self, engine):
            self.engine = engine

load_dotenv()

# Configuration
UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
OUTPUT_FOLDER = os.getenv('OUTPUT_FOLDER', 'outputs')
GROQ_API_KEY = os.getenv('GROQ_API_KEY')
GROQ_API_URL = os.getenv('GROQ_API_URL')
GROQ_MODEL = os.getenv('GROQ_MODEL')
DATABASE_URL = os.getenv('MONGO_URL', 'sqlite:///./insightforge.db')

# Create directories
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
os.makedirs('static/charts', exist_ok=True)

# Database setup
Base = declarative_base()


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime, default=datetime.utcnow)
    task_type = Column(String)
    target_column = Column(String)
    dataset_info = Column(Text)
    results = Column(Text)
    chat_history = Column(Text)


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String)
    message = Column(Text)
    response = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
    context_type = Column(String)


engine = create_engine(DATABASE_URL)
Base.metadata.create_all(bind=engine)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize FastAPI app
app = FastAPI(title="InsightForge AI", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize enhanced modules
chart_classifier = CNNChartClassifier()
image_processor = EnhancedImageProcessor()
eda_pipeline = AutoEDAPipeline()
ml_pipeline = EnhancedMLPipeline()
chat_engine = IntelligentChatEngine(GROQ_API_KEY, GROQ_API_URL, GROQ_MODEL)
try:
    db_manager = DatabaseManager(engine)
except:
    db_manager = None


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Pydantic models
class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    context_type: Optional[str] = "general"


class AnalysisRequest(BaseModel):
    task_type: str
    target_column: str
    session_id: Optional[str] = None


class ChartAnalysisResponse(BaseModel):
    chart_type: str
    confidence: float
    extracted_data: Dict[str, Any]
    insights: List[str]


# WebSocket manager for real-time chat
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)


manager = ConnectionManager()


# API Routes
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "InsightForge AI", "version": "2.0.0"}


@app.post("/api/upload-dataset")
async def upload_dataset(
        file: UploadFile = File(...),
        task_type: str = Form(...),
        target_column: str = Form(...),
        pdf_file: Optional[UploadFile] = File(None),
        db: Session = Depends(get_db)
):
    try:
        # Create new session
        session_id = str(uuid.uuid4())

        # Save uploaded files
        dataset_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_{file.filename}")
        with open(dataset_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Load and validate dataset
        df = pd.read_csv(dataset_path)
        df.columns = df.columns.str.strip()

        if target_column not in df.columns:
            raise HTTPException(400, f"Target column '{target_column}' not found")

        # Run enhanced EDA pipeline
        cleaned_df, eda_results = await eda_pipeline.run_analysis(df, task_type, target_column)

        # Run enhanced ML pipeline
        model_results = await ml_pipeline.train_and_evaluate(cleaned_df, task_type, target_column)

        # Process PDF if provided
        pdf_insights = None
        if pdf_file:
            pdf_path = os.path.join(UPLOAD_FOLDER, f"{session_id}_{pdf_file.filename}")
            with open(pdf_path, "wb") as buffer:
                pdf_content = await pdf_file.read()
                buffer.write(pdf_content)

            # Enhanced chart analysis
            pdf_insights = await analyze_pdf_charts(pdf_path, cleaned_df)

        # Save session to database
        session_data = AnalysisSession(
            id=session_id,
            task_type=task_type,
            target_column=target_column,
            dataset_info=json.dumps({
                "shape": cleaned_df.shape,
                "columns": list(cleaned_df.columns),
                "filename": file.filename
            }),
            results=json.dumps({
                "eda": eda_results,
                "ml": model_results,
                "pdf_insights": pdf_insights
            })
        )

        db.add(session_data)
        db.commit()

        return {
            "session_id": session_id,
            "eda_results": eda_results,
            "ml_results": model_results,
            "pdf_insights": pdf_insights,
            "dataset_info": {
                "shape": cleaned_df.shape,
                "columns": list(cleaned_df.columns)
            }
        }

    except Exception as e:
        raise HTTPException(500, f"Analysis failed: {str(e)}")


@app.post("/api/analyze-chart")
async def analyze_chart(file: UploadFile = File(...)):
    try:
        # Save uploaded image
        image_path = os.path.join(UPLOAD_FOLDER, f"chart_{uuid.uuid4().hex}_{file.filename}")
        with open(image_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)

        # Load image
        image = cv2.imread(image_path)

        # Enhanced chart classification
        chart_type, confidence = chart_classifier.classify_chart(image)

        # Enhanced data extraction
        extracted_data = image_processor.extract_chart_data(image, chart_type)

        # Generate insights
        insights = await chat_engine.generate_chart_insights(chart_type, extracted_data)

        return ChartAnalysisResponse(
            chart_type=chart_type,
            confidence=confidence,
            extracted_data=extracted_data,
            insights=insights
        )

    except Exception as e:
        raise HTTPException(500, f"Chart analysis failed: {str(e)}")


@app.post("/api/chat")
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    try:
        # Get session context if provided
        context = {}
        if request.session_id:
            session = db.query(AnalysisSession).filter(AnalysisSession.id == request.session_id).first()
            if session:
                context = {
                    "task_type": session.task_type,
                    "target_column": session.target_column,
                    "results": json.loads(session.results) if session.results else {}
                }

        # Generate response using enhanced chat engine
        response = await chat_engine.generate_response(
            request.message,
            context,
            request.context_type
        )

        # Save chat message
        chat_msg = ChatMessage(
            session_id=request.session_id,
            message=request.message,
            response=response,
            context_type=request.context_type
        )
        db.add(chat_msg)
        db.commit()

        return {"response": response, "session_id": request.session_id}

    except Exception as e:
        raise HTTPException(500, f"Chat failed: {str(e)}")


@app.get("/api/sessions/{session_id}")
async def get_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")

    # Get chat history
    chat_history = db.query(ChatMessage).filter(ChatMessage.session_id == session_id).all()

    return {
        "session": {
            "id": session.id,
            "created_at": session.created_at,
            "task_type": session.task_type,
            "target_column": session.target_column,
            "dataset_info": json.loads(session.dataset_info) if session.dataset_info else {},
            "results": json.loads(session.results) if session.results else {}
        },
        "chat_history": [
            {
                "message": msg.message,
                "response": msg.response,
                "timestamp": msg.timestamp,
                "context_type": msg.context_type
            }
            for msg in chat_history
        ]
    }


@app.get("/api/sessions")
async def get_all_sessions(limit: int = 50, db: Session = Depends(get_db)):
    sessions = db.query(AnalysisSession).order_by(AnalysisSession.created_at.desc()).limit(limit).all()
    return {
        "sessions": [
            {
                "id": session.id,
                "created_at": session.created_at,
                "task_type": session.task_type,
                "target_column": session.target_column,
                "dataset_info": json.loads(session.dataset_info) if session.dataset_info else {}
            }
            for session in sessions
        ]
    }


@app.delete("/api/sessions/{session_id}")
async def delete_session(session_id: str, db: Session = Depends(get_db)):
    session = db.query(AnalysisSession).filter(AnalysisSession.id == session_id).first()
    if not session:
        raise HTTPException(404, "Session not found")

    # Delete chat messages
    db.query(ChatMessage).filter(ChatMessage.session_id == session_id).delete()
    db.delete(session)
    db.commit()

    return {"message": "Session deleted successfully"}


@app.get("/api/download/{session_id}/{file_type}")
async def download_file(session_id: str, file_type: str):
    try:
        file_mapping = {
            "cleaned_data": f"{OUTPUT_FOLDER}/cleaned_data_{session_id}.csv",
            "eda_report": f"{OUTPUT_FOLDER}/eda_report_{session_id}.pdf",
            "model": f"{OUTPUT_FOLDER}/model_{session_id}.pkl",
            "chat_history": f"{OUTPUT_FOLDER}/chat_history_{session_id}.txt"
        }

        if file_type not in file_mapping:
            raise HTTPException(400, "Invalid file type")

        file_path = file_mapping[file_type]
        if not os.path.exists(file_path):
            raise HTTPException(404, "File not found")

        return FileResponse(file_path, filename=f"{file_type}_{session_id}")

    except Exception as e:
        raise HTTPException(500, f"Download failed: {str(e)}")


@app.websocket("/api/ws/chat/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)

            # Process message with chat engine
            response = await chat_engine.generate_response(
                message_data["message"],
                {},
                message_data.get("context_type", "general")
            )

            # Send response back
            await manager.send_personal_message(
                json.dumps({"response": response, "timestamp": str(datetime.now())}),
                websocket
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket)


# Helper functions
async def analyze_pdf_charts(pdf_path: str, dataset: pd.DataFrame) -> Dict[str, Any]:
    """Enhanced PDF chart analysis with CNN classification"""
    try:
        # Convert PDF to images
        with open(pdf_path, 'rb') as f:
            images = convert_from_bytes(f.read())

        all_insights = []
        chart_data = []

        for i, page in enumerate(images):
            # Convert to OpenCV format
            np_img = np.array(page)
            img_cv = cv2.cvtColor(np_img, cv2.COLOR_RGB2BGR)

            # Extract chart regions
            chart_regions = image_processor.extract_chart_regions(img_cv)

            for j, chart_img in enumerate(chart_regions):
                # Classify chart type
                chart_type, confidence = chart_classifier.classify_chart(chart_img)

                # Extract data
                extracted_data = image_processor.extract_chart_data(chart_img, chart_type)

                # Generate insights
                insights = await chat_engine.generate_chart_insights(
                    chart_type, extracted_data, dataset
                )

                chart_data.append({
                    "page": i + 1,
                    "chart": j + 1,
                    "type": chart_type,
                    "confidence": confidence,
                    "data": extracted_data,
                    "insights": insights
                })

        return {
            "total_charts": len(chart_data),
            "charts": chart_data,
            "summary_insights": await chat_engine.generate_summary_insights(chart_data, dataset)
        }

    except Exception as e:
        return {"error": f"PDF analysis failed: {str(e)}"}

from backend.api import router as api_router

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)
