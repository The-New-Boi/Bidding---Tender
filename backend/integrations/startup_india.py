from typing import Dict, Any
from .base import BaseIntegration

class StartupIndiaIntegration(BaseIntegration):
    """Integration for Startup India registry verification."""
    
    def verify(self, dpiit_number: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('startup_india_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "validity_date": None,
            "message": "DPIIT number not found in registry."
        }
        
        if not dpiit_number:
            result["message"] = "DPIIT number not provided."
            return result
            
        record = self._find_record(db, 'dpiit_number', dpiit_number)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["validity_date"] = record.get("valid_until") or record.get("validity_date")
            
            if str(result["status"]).lower() == "active":
                result["verified"] = True
                result["message"] = "Startup recognition is Active."
            else:
                result["message"] = f"Startup recognition status is {result['status']}."
                
        return result
