from sqlalchemy import Column, Integer, String, Float, DateTime, Text, JSON, Boolean
from database import Base
from datetime import datetime

class ScanResult(Base):
    __tablename__ = "scan_results"

    id = Column(Integer, primary_key=True, index=True)
    url = Column(String, index=True)
    scan_date = Column(DateTime, default=datetime.utcnow)
    risk_score = Column(Float)
    
    # Storing complex data as JSON
    scan_details = Column(JSON) 
    ai_analysis = Column(JSON)

    def to_dict(self):
        return {
            "id": self.id,
            "url": self.url,
            "scan_date": self.scan_date.isoformat(),
            "risk_score": self.risk_score,
            "scan_details": self.scan_details,
            "ai_analysis": self.ai_analysis
        }

class ScanSchedule(Base):
    __tablename__ = "scan_schedules"

    id = Column(Integer, primary_key=True, index=True)
    target_url = Column(String, index=True)
    frequency = Column(String)  # "daily", "weekly", "monthly"
    next_run = Column(DateTime)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
