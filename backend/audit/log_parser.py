import re
from collections import Counter
from datetime import datetime

class LogParser:
    def __init__(self):
        # Common Log Format (CLF) Regex
        # 127.0.0.1 - - [10/Oct/2000:13:55:36 -0700] "GET /apache_pb.gif HTTP/1.0" 200 2326
        self.log_pattern = re.compile(
            r'(?P<ip>[\d\.]+) - - \[(?P<timestamp>.*?)\] "(?P<method>\w+) (?P<path>.*?) HTTP/1.[01]" (?P<status>\d{3}) (?P<size>\d+|-)'
        )
    
    def parse_logs(self, content: bytes) -> dict:
        """
        Parses a log file and returns statistics and anomalies.
        """
        try:
            lines = content.decode('utf-8', errors='ignore').splitlines()
        except:
            return {"error": "Could not decode file"}

        parsed_data = []
        errors = 0
        
        for line in lines:
            match = self.log_pattern.match(line)
            if match:
                parsed_data.append(match.groupdict())
            else:
                errors += 1

        if not parsed_data:
             return {"valid": False, "error": "No valid log lines found. Ensure format is Apache/Nginx CLF."}

        # Analysis
        analysis = self._analyze_data(parsed_data)
        
        return {
            "valid": True,
            "total_lines": len(lines),
            "parsed_lines": len(parsed_data),
            "analysis": analysis
        }

    def _analyze_data(self, data: list) -> dict:
        ips = [d['ip'] for d in data]
        paths = [d['path'] for d in data]
        statuses = [d['status'] for d in data]
        
        # 1. Traffic Analysis
        top_ips = Counter(ips).most_common(5)
        status_counts = Counter(statuses)
        
        # 2. Threat Detection
        threats = []
        
        # SQL Injection Patterns
        sqli_patterns = [r"UNION", r"SELECT", r"OR 1=1", r"--", r"Waitfor delay"]
        
        # XSS Patterns
        xss_patterns = [r"<script>", r"javascript:", r"onload=", r"alert\("]
        
        # Path Traversal
        traversal_patterns = [r"\.\./", r"etc/passwd", r"boot.ini"]

        for entry in data:
            path_decoded = entry['path'] # URL decoding usually happens deeper, but basic check is fine
            
            # SQLi Check
            if any(p in path_decoded.upper() for p in sqli_patterns):
                threats.append({
                    "ip": entry['ip'],
                    "type": "SQL Injection Attempt",
                    "payload": entry['path'],
                    "timestamp": entry['timestamp']
                })
                continue # Count once per request
            
            # XSS Check
            if any(p in path_decoded.lower() for p in xss_patterns):
                threats.append({
                    "ip": entry['ip'],
                    "type": "XSS Attempt",
                    "payload": entry['path'],
                    "timestamp": entry['timestamp']
                })
                continue

            # Traversal Check
            if any(p in path_decoded for p in traversal_patterns):
                threats.append({
                    "ip": entry['ip'],
                    "type": "Directory Traversal",
                    "payload": entry['path'],
                    "timestamp": entry['timestamp']
                })

        return {
            "top_ips": [{"ip": ip, "count": count} for ip, count in top_ips],
            "status_codes": dict(status_counts),
            "threats": threats,
            "threat_count": len(threats)
        }
