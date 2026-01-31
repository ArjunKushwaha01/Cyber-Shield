from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from scanner.engine import ScannerEngine
from ai.model import RiskAssessor, ChatAssistant
from database import engine, SessionLocal, Base
from models import ScanResult
import models

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI-Assisted Web Security Assessment")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class ScanRequest(BaseModel):
    url: str
    consent: bool

@app.get("/")
def read_root():
    return {"message": "Security Assessment API is running"}


# --- Scheduling Endpoints ---

from models import ScanSchedule
from datetime import timedelta, datetime

@app.post("/schedules")
def create_schedule(schedule: dict, db: Session = Depends(get_db)):
    # Calculate initial next_run
    now = datetime.utcnow()
    if schedule['frequency'] == 'daily':
        next_run = now + timedelta(days=1)
    elif schedule['frequency'] == 'weekly':
        next_run = now + timedelta(weeks=1)
    else:
        next_run = now + timedelta(days=30) # Monthly roughly

    new_schedule = ScanSchedule(
        target_url=schedule['target_url'],
        frequency=schedule['frequency'],
        next_run=next_run,
        active=True
    )
    db.add(new_schedule)
    db.commit()
    db.refresh(new_schedule)
    return new_schedule

@app.get("/schedules")
def get_schedules(db: Session = Depends(get_db)):
    return db.query(ScanSchedule).all()

@app.delete("/schedules/{schedule_id}")
def delete_schedule(schedule_id: int, db: Session = Depends(get_db)):
    schedule = db.query(ScanSchedule).filter(ScanSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    db.delete(schedule)
    db.commit()
    return {"message": "Schedule deleted"}

# --- End Scheduling ---



@app.post("/scan")
def start_scan(request: ScanRequest, db: Session = Depends(get_db)):
    if not request.consent:
        return {"error": "User consent is required for scanning."}
    
    # 1. Run Security Checks
    scanner = ScannerEngine(request.url)
    scan_results = scanner.run_checks()
    
    # 2. Run AI Analysis
    ai = RiskAssessor()
    ai_analysis = ai.analyze_risk(scan_results)
    
    # 3. Save to Database
    db_scan = ScanResult(
        url=request.url,
        risk_score=ai_analysis.get("risk_score", 0),
        scan_details=scan_results,
        ai_analysis=ai_analysis
    )
    db.add(db_scan)
    db.commit()
    db.refresh(db_scan)
    
    return {
        "url": request.url,
        "scan_details": scan_results,
        "ai_analysis": ai_analysis,
        "scan_id": db_scan.id
    }

class ChatRequest(BaseModel):
    message: str
    context: dict = {}

@app.post("/ai/chat")
def chat_with_ai(request: ChatRequest):
    assistant = ChatAssistant()
    response = assistant.get_response(request.message, request.context)
    return response

@app.get("/history")
def get_history(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    scans = db.query(ScanResult).order_by(ScanResult.scan_date.desc()).offset(skip).limit(limit).all()
    return [scan.to_dict() for scan in scans]

@app.get("/scans/{scan_id}")
def get_scan(scan_id: int, db: Session = Depends(get_db)):
    scan = db.query(ScanResult).filter(ScanResult.id == scan_id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan.to_dict()

@app.get("/analytics")
def get_analytics(db: Session = Depends(get_db)):
    """
    Returns aggregated security trends and stats from the DB.
    """
    # Fetch all scans (in a real app, optimize this with SQL aggregation)
    scans = db.query(ScanResult).order_by(ScanResult.scan_date.asc()).all()
    
    if not scans:
        # Return empty structure if no data
        return {
            "trends": [],
            "vulnerability_distribution": {
                "High": 0, "Medium": 0, "Low": 0, "Info": 0
            }
        }

    # Process Trends (Last 5 scans for simplicity, or by date)
    trends = []
    for scan in scans[-10:]: # Last 10 scans
        trends.append({
            "date": scan.scan_date.strftime("%Y-%m-%d %H:%M"),
            "risk_score": scan.risk_score
        })
        
    # Process Vulnerability Distribution
    dist = {"High": 0, "Medium": 0, "Low": 0, "Info": 0}
    for scan in scans:
        details = scan.scan_details
        if isinstance(details, list):
            for check in details:
                severity = check.get("severity", "Info")
                if severity in dist:
                    dist[severity] += 1
                else:
                    dist["Info"] += 1 # Fallback
                    
    return {
        "trends": trends,
        "vulnerability_distribution": dist
    }

class DeleteRequest(BaseModel):
    scan_ids: List[int]

@app.delete("/history/batch")
def delete_scans(request: DeleteRequest, db: Session = Depends(get_db)):
    """
    Batch delete scans by ID.
    """
    try:
        db.query(ScanResult).filter(ScanResult.id.in_(request.scan_ids)).delete(synchronize_session=False)
        db.commit()
        return {"message": f"Successfully deleted {len(request.scan_ids)} scans"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
# --- Webhook & Notification System ---
import requests

# Simple in-memory storage for webhook URL (resets on restart)
# In production, use database.
WEBHOOK_CONFIG = {
    "url": None
}

class WebhookRequest(BaseModel):
    url: str

@app.post("/settings/webhook")
def save_webhook(request: WebhookRequest):
    WEBHOOK_CONFIG["url"] = request.url
    return {"status": "success", "message": "Webhook URL saved"}

@app.get("/settings/webhook")
def get_webhook():
    return {"url": WEBHOOK_CONFIG["url"]}

def send_webhook_notification(scan_result: ScanResult):
    """
    Sends a notification to the configured webhook (Discord/Slack).
    """
    webhook_url = WEBHOOK_CONFIG["url"]
    if not webhook_url:
        return

    # Determine color based on risk
    color = 0x3b82f6 # Blue
    if scan_result.risk_score > 70:
        color = 0xef4444 # Red
    elif scan_result.risk_score > 40:
        color = 0xf59e0b # Orange

    # Discord-compatible payload
    payload = {
        "username": "CyberShield AI",
        "embeds": [{
            "title": f"New Security Scan Completed: {scan_result.url}",
            "description": f"**Risk Score**: {scan_result.risk_score}/100\n**Summary**: {scan_result.ai_analysis.get('summary', 'No summary available.')}",
            "color": color,
            "fields": [
                {
                    "name": "Vulnerabilities Found",
                    "value": str(len(scan_result.scan_details)),
                    "inline": True
                },
                {
                    "name": "Status",
                    "value": "High Risk" if scan_result.risk_score > 70 else "Secure",
                    "inline": True
                }
            ],
            "footer": {
                "text": "CyberShield Professional"
            }
        }]
    }

    try:
        requests.post(webhook_url, json=payload, timeout=5)
    except Exception as e:
        print(f"Failed to send webhook: {e}")

@app.post("/settings/webhook/test")
def test_webhook():
    if not WEBHOOK_CONFIG["url"]:
        raise HTTPException(status_code=400, detail="No webhook configured")
    
    dummy_result = ScanResult(
        url="http://test.com",
        risk_score=85,
        scan_details=[{}, {}, {}],
        ai_analysis={"summary": "This is a test notification from CyberShield."}
    )
    send_webhook_notification(dummy_result)
    return {"status": "success", "message": "Test notification sent"}

from audit.inspector import DatabaseInspector

@app.post("/audit/upload")
async def audit_database(file: UploadFile = File(...)):
    """
    Analyzes an uploaded database file for security and structure.
    """
    content = await file.read()
    inspector = DatabaseInspector()
    
    # 1. Detect Type
    file_type = inspector.detect_file_type(file.filename, content)
    
    # 2. Scan for Vulnerabilities (Text scan)
    vulnerabilities = inspector.scan_for_vulnerabilities(content, file_type)
    
    # 3. Analyze Structure (DB/CSV structure)
    structure = inspector.analyze_structure(content, file_type)
    
    # 4. Calculate Score
    # Start at 100, deduct for issues
    security_score = 100
    deductions = {
        "Critical": 25,
        "High": 15,
        "Medium": 10,
        "Low": 5
    }
    for v in vulnerabilities:
        security_score -= deductions.get(v['severity'], 5)
    
    if not structure.get("valid", False) and file_type != 'Unknown Binary/Text':
         security_score -= 10
         
    return {
        "filename": file.filename,
        "file_type": file_type,
        "size_bytes": len(content),
        "security_score": max(0, security_score),
        "vulnerabilities": vulnerabilities,
        "structure": structure
    }

from ai.analyst import DataAnalyst

class DataChatRequest(BaseModel):
    query: str
    context: dict

@app.post("/ai/data-chat")
def chat_with_data(request: DataChatRequest):
    analyst = DataAnalyst()
    response = analyst.analyze_query(request.query, request.context)
    return {"response": response}

from audit.log_parser import LogParser

@app.post("/audit/logs")
async def audit_logs(file: UploadFile = File(...)):
    """
    Analyzes uploaded server logs (Apache/Nginx) for threats.
    """
    content = await file.read()
    parser = LogParser()
    report = parser.parse_logs(content)
    return report
