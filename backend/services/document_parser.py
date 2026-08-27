import re
from typing import Dict, Any, Optional
import io

class DocumentParser:
    """
    Parses PDF/Text bid documents to extract key entities.
    Uses pdfplumber if available, else falls back to text parsing.
    """
    def __init__(self):
        try:
            import pdfplumber
            self.has_pdfplumber = True
        except ImportError:
            self.has_pdfplumber = False

    def parse_document(self, file_content: bytes, filename: str) -> Dict[str, Any]:
        """
        Extracts entities from file content.
        """
        text = ""
        if filename.lower().endswith(".pdf") and self.has_pdfplumber:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(file_content)) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        else:
            # Fallback to string decode for text files
            try:
                text = file_content.decode('utf-8')
            except UnicodeDecodeError:
                text = ""

        return self.extract_entities(text)

    def extract_entities(self, text: str) -> Dict[str, Any]:
        """
        Extracts PAN, GSTIN, Udyam, etc using Regex.
        """
        entities = {
            "pan": None,
            "gstin": None,
            "udyam_number": None,
        }
        
        # Regex Patterns
        pan_pattern = r'[A-Z]{5}[0-9]{4}[A-Z]{1}'
        gstin_pattern = r'[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}'
        udyam_pattern = r'UDYAM-[A-Z]{2}-\d{2}-\d{7}'

        pan_match = re.search(pan_pattern, text)
        if pan_match:
            entities["pan"] = pan_match.group()

        gstin_match = re.search(gstin_pattern, text)
        if gstin_match:
            entities["gstin"] = gstin_match.group()

        udyam_match = re.search(udyam_pattern, text)
        if udyam_match:
            entities["udyam_number"] = udyam_match.group()

        return entities
