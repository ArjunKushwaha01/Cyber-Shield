import requests
from urllib.parse import urlparse

def check_security_headers(url: str) -> list:
    results = []
    try:
        response = requests.get(url, timeout=5)
        headers = response.headers
        
        security_headers = [
            "Content-Security-Policy",
            "X-Frame-Options",
            "X-Content-Type-Options",
            "Strict-Transport-Security",
            "Referrer-Policy"
        ]
        
        for header in security_headers:
            if header not in headers:
                results.append({
                    "check": "Security Headers",
                    "vulnerability": f"Missing {header}",
                    "severity": "Low" if header == "Referrer-Policy" else "Medium",
                    "description": f"The {header} header is missing, which reduces security against specific attacks."
                })
            else:
                 results.append({
                    "check": "Security Headers",
                    "vulnerability": f"Present {header}",
                    "severity": "Info",
                    "description": f"The {header} header is present."
                })
                
    except Exception as e:
        results.append({
            "check": "Security Headers",
            "vulnerability": "Scan Failed",
            "severity": "Error",
            "description": str(e)
        })
    
    return results

def check_ssl_tls(url: str) -> list:
    results = []
    if not url.startswith("https"):
        results.append({
            "check": "SSL/TLS",
            "vulnerability": "Not using HTTPS",
            "severity": "High",
            "description": "Communication is not encrypted."
        })
    else:
        results.append({
            "check": "SSL/TLS",
            "vulnerability": "Using HTTPS",
            "severity": "Info",
            "description": "Communication is encrypted."
        })
    # Real SSL certificate checks would involve 'ssl' module here
    return results

def check_open_directories(url: str) -> list:
    # Placeholder for checking common open directories like .git/, various backups etc.
    # For now returns empty list to be safe / not aggressive without permission context.
    return []

import socket

def check_common_ports(url: str) -> list:
    results = []
    # Extract hostname
    try:
        parsed = urlparse(url)
        hostname = parsed.netloc.split(":")[0] # Remove port if present
    except:
        return []

    # Common ports to check (Non-aggressive list)
    ports = {
        21: "FTP",
        22: "SSH",
        80: "HTTP",
        443: "HTTPS",
        3306: "MySQL",
        8080: "HTTP-Proxy"
    }

    for port, service in ports.items():
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(1) # Short timeout
            result = sock.connect_ex((hostname, port))
            if result == 0:
                severity = "Medium" if port in [21, 22, 3306] else "Info"
                results.append({
                    "check": "Port Scan",
                    "vulnerability": f"Open Port {port} ({service})",
                    "severity": severity,
                    "description": f"Port {port} is open. Ensure strictly necessary services are exposed."
                })
            sock.close()
        except:
            pass
    
    return results
