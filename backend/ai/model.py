class RiskAssessor:
    def __init__(self):
        # In a real implementation, load a trained model here
        pass

    def analyze_risk(self, scan_results: list) -> dict:
        """
        Analyzes scan results and provides an AI-driven risk assessment.
        Now includes 'Industry Standard' metrics like CWE and CVSS (Simulated).
        """
        if not scan_results:
             return {
                "risk_score": 100,
                "summary": "No vulnerabilities detected. Good job!",
                "recommendations": ["Maintain current security practices."],
                "enriched_results": []
            }

        # Calculate base score
        severity_weights = {"High": 10, "Medium": 5, "Low": 2, "Info": 0}
        total_weight = sum(severity_weights.get(r["severity"], 0) for r in scan_results)
        
        # Normalize score (0 to 100, where 100 is SAFE)
        # Max reasonable weight could be around 50 (e.g., 5 high vulns)
        risk_score = max(0, 100 - (total_weight * 2))

        # Enrich results with "CWE", "CVSS", and "Risk Type"
        # In a real app, this would come from a vulnerability database.
        enriched_results = []
        for r in scan_results:
            # Default values
            cwe = "CWE-200" # Information Exposure
            risk_type = "Security Misconfiguration"
            vuln_name = r["vulnerability"].lower()

            # Classification Logic
            if "xss" in vuln_name: 
                cwe = "CWE-79"
                risk_type = "Cross-Site Scripting (XSS)"
            elif "sql" in vuln_name: 
                cwe = "CWE-89"
                risk_type = "SQL Injection (SQLi)"
            elif "ssl" in vuln_name or "tls" in vuln_name or "transport" in vuln_name: 
                cwe = "CWE-319"
                risk_type = "Cryptographic Issue"
            elif "port" in vuln_name: 
                cwe = "CWE-284"
                risk_type = "Network Exposure / Brute Force Risk"
            elif "directory" in vuln_name:
                cwe = "CWE-548"
                risk_type = "Sensitivie Data Exposure"
            elif "header" in vuln_name:
                risk_type = "Security Misconfiguration"
            
            r["cwe_id"] = cwe
            r["risk_type"] = risk_type
            r["cvss_score"] = 7.5 if r["severity"] == "High" else 5.0 if r["severity"] == "Medium" else 2.5
            enriched_results.append(r)

        summary = self._generate_summary(risk_score, len(scan_results))
        recommendations = self._generate_recommendations(scan_results)
        
        return {
            "risk_score": int(risk_score),
            "summary": summary,
            "recommendations": recommendations,
            "enriched_results": enriched_results # Pass back enriched data for the UI
        }

    def _generate_summary(self, risk_score: int, num_vulnerabilities: int) -> str:
        """Helper to generate a summary based on risk score and vulnerability count."""
        if risk_score >= 80:
            return f"Excellent security posture with a score of {risk_score}. Found {num_vulnerabilities} issues."
        elif risk_score >= 50:
            return f"Good security posture with a score of {risk_score}. Found {num_vulnerabilities} issues. Some improvements recommended."
        else:
            return f"Critical security concerns with a score of {risk_score}. Found {num_vulnerabilities} issues. Immediate action required."

    def _generate_recommendations(self, scan_results: list) -> list:
        """Helper to generate recommendations based on scan results."""
        recommendations = []
        high_severity_count = sum(1 for r in scan_results if r.get("severity") == "High")
        medium_severity_count = sum(1 for r in scan_results if r.get("severity") == "Medium")

        if high_severity_count > 0:
            recommendations.append(f"Address {high_severity_count} high-severity vulnerabilities immediately.")
        if medium_severity_count > 0:
            recommendations.append(f"Prioritize fixing {medium_severity_count} medium-severity vulnerabilities.")
        
        for result in scan_results:
            if result.get("severity") in ["High", "Medium"]:
                recommendations.append(f"Fix {result.get('vulnerability')} (CWE: {result.get('cwe_id')}) to improve score.")
        
        if not recommendations:
            recommendations.append("Good job! Keep maintaining your security posture.")
            
        return recommendations

class ChatAssistant:
    def __init__(self):
        self.system_prompt = "You are a cybersecurity expert assistant for the CyberShield platform."

    def get_response(self, message: str, context: dict) -> dict:
        """
        Generates a response to the user's message, considering the security context.
        """
        msg_lower = message.lower()
        response_text = ""
        actions = []

        # Heuristic-based logic (Simulating an LLM for now)
        if "risk" in msg_lower or "score" in msg_lower:
            score = context.get("risk_score", 0)
            if score > 80:
                response_text = f"Your current risk score is **{score}/100**, which is excellent! Your system is quite secure."
            elif score > 50:
                 response_text = f"Your risk score is **{score}/100**. There is room for improvement. I recommend addressing the medium-severity issues."
            else:
                 response_text = f"Your risk score is **{score}/100**, which is critical. You have major vulnerabilities that need immediate attention."
            actions = ["Show Recommendations", "Start New Scan"]

        elif "vulnerability" in msg_lower or "issue" in msg_lower:
            count = len(context.get("scan_details", []))
            response_text = f"I found **{count} vulnerabilities** in the latest scan. Would you like me to list the high-priority ones?"
            actions = ["List High Risks", "Export PDF"]

        elif "export" in msg_lower or "report" in msg_lower:
             response_text = "You can download a detailed PDF report or export the raw data as JSON/CSV from the History page."
             actions = ["Download PDF", "Go to History"]
        
        elif "help" in msg_lower:
            response_text = "I can help you analyze your scan results, explain specific vulnerabilities, or guide you through remediation steps. What do you need?"
            actions = ["Analyze Risk", "Explain SQL Injection", "How to fix CORS"]

        else:
            response_text = "I'm here to help with your security assessment. You can ask me about your risk score, specific findings, or how to fix vulnerabilities."
            actions = ["What is my risk score?", "How many issues found?"]

        return {
            "response": response_text,
            "quick_actions": actions
        }
