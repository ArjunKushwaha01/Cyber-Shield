# 🛡️ Cyber-AI Security Platform (Professional Edition)

![Dashboard Preview](screen%20shots/dashboard.png)

## 🚀 Overview
**Cyber-AI Security Platform** is a next-generation Vulnerability Scanner and Security Orchestration tool. It combines traditional web security scanning with **Artificial Intelligence** and **3D Visualization** to provide a futuristic "War Room" experience for security professionals.

Built with **React (Vite)**, **Three.js**, and **FastAPI**, this platform offers real-time threat monitoring, predictive analytics, and interactive forensic tools.

## ✨ Key Features

### 🧠 AI & Intelligence
- **AI Security Copilot**: A context-aware chatbot that explains vulnerabilities and suggests fixes.
- **Predictive Risk Analytics**: Uses linear regression to forecast future security trends based on historical data.
- **Smart Remediation**: Automated suggestions for fixing headers, SSL issues, and open ports.

### 🧊 3D Immersion (The "War Room")
- **Holographic Core**: A rotating 3D glass cube on the dashboard representing system health.
- **Global Threat Map**: A fully interactive **3D WebGL Globe** visualizing live attack vectors and geo-located threats.

### 🔍 Advanced Forensics
- **Data Auditor**: Upload CSV/SQL dumps to auto-detect PII (Personally Identifiable Information) and sensitive secrets. Includes an AI Chat interfaces to "talk" to your data.
- **Server Log Forensics**: Parse Apache/Nginx logs to detect SQL Injection, XSS, and traffic anomalies visually.

### 📊 Professional Reporting
- **PDF Export**: Generate executive-grade security reports.
- **Dark Web Monitor**: Check if your domain has been exposed in known breaches.
- **Gamification**: Earn achievements for securing your infrastructure.

## 🛠️ Tech Stack

**Frontend**
- **Framework**: React 18 + Vite
- **UI Library**: TailwindCSS + Framer Motion
- **3D Engine**: Three.js + React Three Fiber
- **Charts**: Recharts

**Backend**
- **API**: FastAPI (Python 3.10+)
- **Database**: SQLite (SQLAlchemy)
- **AI/ML**: Scikit-Learn (for predictions)

## 📦 Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/cyber-ai-platform.git
cd cyber-ai-platform
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*Backend runs on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

## 📸 Screenshots

| Dashboard | Threat Map |
|-----------|------------|
| ![Dashboard](screen%20shots/dashboard.png) | ![Map](screen%20shots/attack%20map.png) |

| Data Auditor | Log Forensics |
|--------------|---------------|
| ![Auditor](screen%20shots/data%20auditor.png) | ![Logs](screen%20shots/log%20forensics.png) |

## 🤝 Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
[MIT](https://choosealicense.com/licenses/mit/)
