from typing import Dict, Any
from .base import BaseIntegration

class ESICIntegration(BaseIntegration):
    """Integration for ESIC registry verification."""
    
    def verify(self, esic_number: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('esic_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "contribution_status": "Unknown",
            "message": "ESIC number not found in registry."
        }
        
        if not esic_number:
            result["message"] = "ESIC number not provided."
            return result
            
        record = self._find_record(db, 'registration_number', esic_number)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["contribution_status"] = record.get("contribution_status", "Unknown")
            
            if str(result["contribution_status"]).lower() == "regular":
                result["verified"] = True
                result["message"] = "ESIC contribution is regular."
            else:
                result["message"] = f"ESIC status is {result['status']}."
                
        return result
