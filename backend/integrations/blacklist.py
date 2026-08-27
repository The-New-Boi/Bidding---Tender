from typing import Dict, Any
from .base import BaseIntegration

class BlacklistIntegration(BaseIntegration):
    """Integration for Debarment/Blacklist registry verification."""
    
    def verify(self, pan_number: str = None, gstin: str = None, name: str = None, **kwargs) -> Dict[str, Any]:
        db = self._read_mock_db('blacklist_registry.json')
        result = {
            "is_blacklisted": False,
            "details": None,
            "message": "Entity not found in blacklist registry."
        }
        
        # Support list or dict mock DB structure
        records = db if isinstance(db, list) else db.values()
        
        for data in records:
            if not isinstance(data, dict):
                continue
            match = False
            if pan_number and str(data.get("pan", "")).strip().lower() == str(pan_number).strip().lower():
                match = True
            elif gstin and str(data.get("gstin", "")).strip().lower() == str(gstin).strip().lower():
                match = True
            elif name and str(name).strip().lower() in str(data.get("company_name", data.get("name", ""))).strip().lower():
                match = True
                
            if match:
                result["is_blacklisted"] = True
                result["details"] = data
                reason = data.get("reason", "Statutory debarment order")
                result["message"] = f"ENTITY IS BLACKLISTED! Reason: {reason}"
                break
                
        return result
