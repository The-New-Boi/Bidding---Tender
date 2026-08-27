from typing import Dict, Any
from .base import BaseIntegration

class EPFOIntegration(BaseIntegration):
    """Integration for EPFO registry verification."""
    
    def verify(self, epfo_number: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('epfo_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "compliance_status": "Unknown",
            "message": "EPFO number not found in registry."
        }
        
        if not epfo_number:
            result["message"] = "EPFO number not provided."
            return result
            
        record = self._find_record(db, 'establishment_code', epfo_number)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["compliance_status"] = record.get("compliance_status", "Unknown")
            
            if str(result["compliance_status"]).lower() == "compliant":
                result["verified"] = True
                result["message"] = "EPFO compliant."
            else:
                result["message"] = f"EPFO compliance is {result['compliance_status']}."
                
        return result
