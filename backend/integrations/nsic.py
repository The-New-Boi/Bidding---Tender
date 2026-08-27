from typing import Dict, Any
from .base import BaseIntegration

class NSICIntegration(BaseIntegration):
    """Integration for NSIC registry verification."""
    
    def verify(self, nsic_number: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('nsic_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "validity": None,
            "message": "NSIC number not found in registry."
        }
        
        if not nsic_number:
            result["message"] = "NSIC number not provided."
            return result
            
        record = self._find_record(db, 'nsic_number', nsic_number)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["validity"] = record.get("valid_until") or record.get("validity")
            
            if str(result["status"]).lower() == "valid" or str(result["status"]).lower() == "active":
                result["verified"] = True
                result["message"] = "NSIC certificate is Valid."
            else:
                result["message"] = f"NSIC certificate status is {result['status']}."
                
        return result
