from typing import Dict, Any
from .base import BaseIntegration

class MCA21Integration(BaseIntegration):
    """Integration for MCA21 registry verification."""
    
    def verify(self, cin: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('mca21_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "directors": [],
            "message": "CIN not found in registry."
        }
        
        if not cin:
            result["message"] = "CIN not provided."
            return result
            
        record = self._find_record(db, 'cin', cin)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["directors"] = record.get("directors", [])
            
            if str(result["status"]).lower() == "active":
                result["verified"] = True
                result["message"] = "Company is Active."
            else:
                result["message"] = f"Company status is {result['status']}."
                
        return result
