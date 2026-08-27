import os
import json
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

class BaseIntegration(ABC):
    """
    Base class for mock government portal verifications.
    """
    def __init__(self):
        self.base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.mock_db_dir = os.path.join(self.base_dir, 'data', 'mock_databases')
        
    def _read_mock_db(self, filename: str):
        """
        Reads a mock JSON database file.
        Returns empty list/dict if file not found.
        """
        filepath = os.path.join(self.mock_db_dir, filename)
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return []

    def _find_record(self, db, key_name: str, key_val: str) -> Optional[Dict[str, Any]]:
        """
        Safely searches for a record in a list of dicts or dict of dicts.
        """
        if not db or not key_val:
            return None
        if isinstance(db, list):
            key_val_lower = str(key_val).strip().lower()
            for item in db:
                if isinstance(item, dict):
                    val = str(item.get(key_name, '')).strip().lower()
                    if val == key_val_lower:
                        return item
            return None
        elif isinstance(db, dict):
            return db.get(key_val)
        return None

    @abstractmethod
    def verify(self, **kwargs) -> Dict[str, Any]:
        """
        Abstract method to be implemented by all integrations.
        Should return a dictionary with verification results.
        """
        pass
