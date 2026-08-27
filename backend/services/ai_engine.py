import os
from typing import Dict, Any, List

class AIEngine:
    """
    Generates plain-language gap analysis and recommendations.
    Uses google.generativeai if API key is present, else falls back to rule-based engine.
    """
    def __init__(self):
        self.api_key = os.environ.get("GEMINI_API_KEY")
        self.use_ai = bool(self.api_key)
        if self.use_ai:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-pro')
            except ImportError:
                self.use_ai = False

    def generate_recommendations(self, bidder_data: Dict[str, Any], results: Dict[str, Any], discrepancies: List[str]) -> Dict[str, Any]:
        if self.use_ai:
            return self._generate_with_gemini(bidder_data, results, discrepancies)
        else:
            return self._generate_with_rules(bidder_data, results, discrepancies)

    def _generate_with_rules(self, bidder_data: Dict[str, Any], results: Dict[str, Any], discrepancies: List[str]) -> Dict[str, Any]:
        """Fallback rule-based generation."""
        gap_analysis = discrepancies if discrepancies else ["No significant compliance gaps found."]
        
        recommendation = "Proceed with caution. Officer discretion advised."
        score = results.get("score", 0)
        risk = results.get("risk_level", "Unknown")
        
        if risk == "Critical":
            recommendation = "Strongly advise rejecting this bid due to critical compliance failures or blacklist status."
            explanation = "Major anomalies detected such as blacklisted entity or invalid primary identifiers."
        elif risk == "High":
            recommendation = "Require additional manual verification before proceeding."
            explanation = "Significant discrepancies detected in compliance checks."
        elif risk == "Medium":
            recommendation = "Bid is moderately compliant. Request clarification on minor discrepancies."
            explanation = "Some registries returned warnings or missing data."
        else:
            recommendation = "Bid appears compliant. Safe to proceed with standard process."
            explanation = "No major anomalies found across available registries."

        return {
            "gap_analysis": gap_analysis,
            "recommendation": recommendation,
            "explanation": explanation
        }

    def _generate_with_gemini(self, bidder_data: Dict[str, Any], results: Dict[str, Any], discrepancies: List[str]) -> Dict[str, Any]:
        """AI-powered generation using Gemini."""
        prompt = f"""
        Analyze the following bidder compliance data and generate:
        1. A plain-language gap analysis (bullet points).
        2. Actionable AI Recommendation for the Procurement Officer (advisory only).
        3. Fraud/anomaly flag explanation.

        Data:
        Risk Level: {results.get('risk_level')}
        Score: {results.get('score')}
        Discrepancies: {discrepancies}
        
        Respond in JSON format with keys: gap_analysis (list of strings), recommendation (string), explanation (string).
        """
        try:
            response = self.model.generate_content(prompt)
            # Extremely basic parsing, in a real app use structured output or robust parsing
            import json
            text = response.text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            
            parsed = json.loads(text.strip())
            return {
                "gap_analysis": parsed.get("gap_analysis", discrepancies),
                "recommendation": parsed.get("recommendation", "Review manually."),
                "explanation": parsed.get("explanation", "AI analyzed the data.")
            }
        except Exception as e:
            # Fallback on error
            return self._generate_with_rules(bidder_data, results, discrepancies)
