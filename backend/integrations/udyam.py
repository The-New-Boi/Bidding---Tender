from typing import Dict, Any
from .base import BaseIntegration

class UdyamIntegration(BaseIntegration):
    """Integration for Udyam (MSME) registry verification."""
    
    def verify(self, udyam_number: str = None, pan_number: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('udyam_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "category": None,
            "pan_match": False,
            "message": "Udyam number not found in registry."
        }
        
        if not udyam_number:
            result["message"] = "Udyam number not provided."
            return result
            
        record = self._find_record(db, 'udyam_number', udyam_number)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["category"] = record.get("category", "Unknown")
            
            if str(result["status"]).lower() == "active":
                result["verified"] = True
                result["message"] = "Udyam registration is active."
            else:
                result["message"] = f"Udyam registration is {result['status']}."
                
            if pan_number and record.get("pan") == pan_number:
                result["pan_match"] = True
            elif pan_number:
                result["message"] += " PAN mismatch detected."
                
        return result
