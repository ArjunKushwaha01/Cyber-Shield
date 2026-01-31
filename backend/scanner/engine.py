import logging
from .checks import check_security_headers, check_ssl_tls, check_open_directories, check_common_ports

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ScannerEngine:
    def __init__(self, target_url: str):
        self.target_url = target_url
        self.results = []

    def run_checks(self):
        """
        Runs all configured security checks against the target URL.
        """
        logger.info(f"Starting scan for {self.target_url}")
        
        # Header Checks
        header_results = check_security_headers(self.target_url)
        self.results.extend(header_results)
        
        # SSL Checks
        ssl_results = check_ssl_tls(self.target_url)
        self.results.extend(ssl_results)
        
        # Open Directory Checks
        dir_results = check_open_directories(self.target_url)
        self.results.extend(dir_results)

        # Port Checks
        port_results = check_common_ports(self.target_url)
        self.results.extend(port_results)
        
        return self.results
