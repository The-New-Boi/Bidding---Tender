from typing import Dict, Any
from .base import BaseIntegration

class GSTIntegration(BaseIntegration):
    """Integration for GST registry verification."""
    
    def verify(self, gstin: str = None, pan_number: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('gst_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "pan_match": False,
            "last_return_filed": None,
            "message": "GSTIN not found in registry."
        }
        
        if not gstin:
            result["message"] = "GSTIN not provided."
            return result
            
        record = self._find_record(db, 'gstin', gstin)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["last_return_filed"] = record.get("last_return_filed")
            
            if str(result["status"]).lower() == "active":
                result["verified"] = True
                result["message"] = "GSTIN is active."
            else:
                result["message"] = f"GSTIN is {result['status']}."
                
            embedded_pan = gstin[2:12] if len(gstin) >= 12 else None
            if pan_number and embedded_pan == pan_number:
                result["pan_match"] = True
            elif pan_number:
                result["message"] += " Embedded PAN mismatch."
                
        return result
