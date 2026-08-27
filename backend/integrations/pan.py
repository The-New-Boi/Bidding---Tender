from typing import Dict, Any
from .base import BaseIntegration

class PANIntegration(BaseIntegration):
    """Integration for PAN registry verification."""
    
    def verify(self, pan_number: str = None, bidder_name: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('pan_registry.json')
        result = {
            "verified": False,
            "status": "Not Found",
            "name_match": False,
            "category": None,
            "message": "PAN not found in registry."
        }
        
        if not pan_number:
            result["message"] = "PAN not provided."
            return result
            
        record = self._find_record(db, 'pan', pan_number)
        if record:
            result["status"] = record.get("status", "Unknown")
            result["category"] = record.get("category", "Unknown")
            
            if str(result["status"]).lower() == "valid":
                result["verified"] = True
                result["message"] = "PAN is valid."
            else:
                result["message"] = f"PAN is {result['status']}."
                
            legal_name = record.get("name", "")
            if bidder_name and bidder_name.lower() in legal_name.lower():
                result["name_match"] = True
            elif bidder_name:
                result["message"] += f" Name mismatch (Expected ~{bidder_name}, found {legal_name})."
                
        return result
