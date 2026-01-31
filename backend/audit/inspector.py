import re
import sqlite3
import json
import csv
import io

class DatabaseInspector:
    def detect_file_type(self, filename: str, content: bytes) -> str:
        """
        Detects file type based on extension and magic bytes/content.
        """
        if filename.endswith('.db') or filename.endswith('.sqlite'):
            header = content[:16]
            if b'SQLite format 3' in header:
                return 'SQLite Database'
        elif filename.endswith('.json'):
            try:
                json.loads(content.decode('utf-8'))
                return 'JSON Data'
            except:
                pass
        elif filename.endswith('.csv'):
            return 'CSV Dataset'
        elif filename.endswith('.sql'):
            return 'SQL Dump'
        
        return 'Unknown Binary/Text'

    def scan_for_vulnerabilities(self, content: bytes, file_type: str) -> list:
        """
        Scans text content for PII, Secrets, and Weak Hashing.
        """
        vulnerabilities = []
        
        # Decode safe for regex (ignore binary errors)
        try:
            text_content = content.decode('utf-8', errors='ignore')
        except:
            return []

        # 1. PII Detection (Email)
        email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
        emails = re.findall(email_pattern, text_content)
        if len(emails) > 0:
            vulnerabilities.append({
                "type": "PII Exposure",
                "severity": "High",
                "finding": f"Found {len(emails)} email addresses (Potential User Data Leak).",
                "sample": emails[:3]
            })

        # 2. Secret Detection
        secret_keywords = ['api_key', 'secret', 'password', 'token', 'private_key']
        for keyword in secret_keywords:
            if keyword in text_content.lower():
                # Simple check: is there a value assigned?
                matches = re.findall(f'{keyword}[\"\']?\s*[:=]\s*[\"\']?([a-zA-Z0-9\-_]{{8,}})', text_content, re.IGNORECASE)
                if matches:
                     vulnerabilities.append({
                        "type": "Secret Exposure",
                        "severity": "Critical",
                        "finding": f"Found potential hardcoded {keyword}.",
                        "sample": "REDACTED"
                    })

        # 3. Weak Hashing (MD5/Plaintext identification)
        # Look for "password": "..." patterns
        password_matches = re.findall(r'password[\"\']?\s*[:=]\s*[\"\']?([^\"\'\s,]+)', text_content, re.IGNORECASE)
        for pwd in password_matches:
            if len(pwd) < 32 and re.match(r'^[a-zA-Z0-9]+$', pwd):
                vulnerabilities.append({
                    "type": "Weak Authentication",
                    "severity": "High",
                    "finding": "Detected potential plaintext passwords.",
                    "sample": pwd[:2] + "****"
                })
                break # Report once

        return vulnerabilities

    def analyze_structure(self, file_pointer, file_type: str) -> dict:
        """
        Analyzes the structure of the database (Tables, Rows, Keys) and returns a preview.
        """
        structure = {"valid": False, "tables": [], "preview": {"headers": [], "rows": []}}

        if file_type == 'SQLite Database':
            try:
                # Save to temp file to read with sqlite3
                import tempfile
                with tempfile.NamedTemporaryFile(delete=True) as tmp:
                    tmp.write(file_pointer)
                    tmp.flush()
                    
                    conn = sqlite3.connect(tmp.name)
                    cursor = conn.cursor()
                    
                    # Get Tables
                    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                    tables = cursor.fetchall()
                    
                    structure["valid"] = True
                    for i, table in enumerate(tables):
                        table_name = table[0]
                        cursor.execute(f"PRAGMA table_info({table_name})")
                        columns = cursor.fetchall()
                        has_pk = any(col[5] == 1 for col in columns) # index 5 is pk flag
                        
                        # Count rows
                        try:
                            cursor.execute(f"SELECT COUNT(*) FROM {table_name}")
                            row_count = cursor.fetchone()[0]
                        except:
                            row_count = 0

                        structure["tables"].append({
                            "name": table_name,
                            "columns": len(columns),
                            "has_primary_key": has_pk,
                            "rows": row_count
                        })

                        # Grab preview from the FIRST table only (for simplicity)
                        if i == 0:
                            structure["preview"]["headers"] = [col[1] for col in columns] # Name is index 1
                            cursor.execute(f"SELECT * FROM {table_name} LIMIT 20")
                            structure["preview"]["rows"] = cursor.fetchall()

                    conn.close()
            except Exception as e:
                structure["error"] = str(e)
        
        elif file_type == 'CSV Dataset':
             try:
                text = file_pointer.decode('utf-8').splitlines()
                if len(text) > 0:
                    reader = csv.reader(text[:21]) # Header + 20 rows
                    headers = next(reader)
                    rows = list(reader)
                    
                    structure["valid"] = True
                    structure["tables"].append({
                        "name": "CSV Data",
                        "columns": len(headers),
                        "rows": len(text) - 1
                    })
                    structure["preview"]["headers"] = headers
                    structure["preview"]["rows"] = rows
             except:
                 pass

        return structure
