from typing import Dict, Any, List

class ComplianceEngine:
    """
    Computes compliance scores and risk levels based on verification results.
    """
    def __init__(self):
        self.weights = {
            "gst": 15,
            "pan": 15,
            "blacklist": 15,
            "udyam": 10,
            "epfo": 10,
            "esic": 10,
            "mca21": 10,
            "mii": 5, # Make in India (placeholder for logic)
            "startup_nsic": 5,
            "digilocker": 5
        }

    def compute_score(self, verification_results: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes weighted score, risk level, and discrepancies.
        """
        total_score = 0
        max_possible_score = sum(self.weights.values())
        discrepancies = []
        critical_flags = False
        category_scores = {}

        # 1. GST Status & Filing (15%)
        gst_res = verification_results.get("gst", {})
        if gst_res.get("verified"):
            cat_score = self.weights["gst"]
            category_scores["gst"] = {"score": 100, "status": "pass"}
            total_score += cat_score
        else:
            discrepancies.append(f"GST Check Failed: {gst_res.get('message', 'Not verified')}")
            category_scores["gst"] = {"score": 0, "status": "fail"}
            critical_flags = True

        # 2. PAN & IT Compliance (15%)
        pan_res = verification_results.get("pan", {})
        if pan_res.get("verified"):
            cat_score = self.weights["pan"]
            if pan_res.get("name_match"):
                category_scores["pan"] = {"score": 100, "status": "pass"}
                total_score += cat_score
            else:
                category_scores["pan"] = {"score": 50, "status": "warning"}
                total_score += cat_score / 2
                discrepancies.append(f"PAN Warning: {pan_res.get('message', 'Name mismatch')}")
        else:
            category_scores["pan"] = {"score": 0, "status": "fail"}
            discrepancies.append(f"PAN Check Failed: {pan_res.get('message', 'Not verified')}")
            critical_flags = True

        # 3. Blacklist Check (15% - Critical)
        blacklist_res = verification_results.get("blacklist", {})
        if blacklist_res.get("is_blacklisted"):
            category_scores["blacklist"] = {"score": 0, "status": "fail"}
            discrepancies.append(f"CRITICAL: Entity is blacklisted. {blacklist_res.get('message')}")
            critical_flags = True
        else:
            category_scores["blacklist"] = {"score": 100, "status": "pass"}
            total_score += self.weights["blacklist"]

        # 4. Udyam (10%)
        udyam_res = verification_results.get("udyam", {})
        if udyam_res.get("verified"):
            category_scores["udyam"] = {"score": 100, "status": "pass"}
            total_score += self.weights["udyam"]
        else:
            category_scores["udyam"] = {"score": 0, "status": "warning"}
            discrepancies.append(f"Udyam Verification: {udyam_res.get('message', 'Not verified')}")

        # 5. EPFO (10%)
        epfo_res = verification_results.get("epfo", {})
        if epfo_res.get("verified"):
            category_scores["epfo"] = {"score": 100, "status": "pass"}
            total_score += self.weights["epfo"]
        else:
            category_scores["epfo"] = {"score": 0, "status": "warning"}
            discrepancies.append(f"EPFO Verification: {epfo_res.get('message', 'Not verified')}")

        # 6. ESIC (10%)
        esic_res = verification_results.get("esic", {})
        if esic_res.get("verified"):
            category_scores["esic"] = {"score": 100, "status": "pass"}
            total_score += self.weights["esic"]
        else:
            category_scores["esic"] = {"score": 0, "status": "warning"}
            discrepancies.append(f"ESIC Verification: {esic_res.get('message', 'Not verified')}")

        # 7. MCA21 (10%)
        mca_res = verification_results.get("mca21", {})
        if mca_res.get("verified"):
            category_scores["mca21"] = {"score": 100, "status": "pass"}
            total_score += self.weights["mca21"]
        else:
            category_scores["mca21"] = {"score": 0, "status": "warning"}
            discrepancies.append(f"MCA21 Verification: {mca_res.get('message', 'Not verified')}")

        # 8. Startup/NSIC (5%)
        startup_res = verification_results.get("startup_india", {})
        nsic_res = verification_results.get("nsic", {})
        if startup_res.get("verified") or nsic_res.get("verified"):
            category_scores["startup_nsic"] = {"score": 100, "status": "pass"}
            total_score += self.weights["startup_nsic"]
        else:
            category_scores["startup_nsic"] = {"score": 0, "status": "warning"}
            discrepancies.append("No Startup/NSIC valid registration found.")

        # 9. DigiLocker (5%)
        digi_res = verification_results.get("digilocker", {})
        if digi_res.get("verified"):
            category_scores["digilocker"] = {"score": 100, "status": "pass"}
            total_score += self.weights["digilocker"]
        else:
            category_scores["digilocker"] = {"score": 0, "status": "warning"}
            
        # 10. Make in India (5% placeholder)
        category_scores["mii"] = {"score": 100, "status": "pass"}
        total_score += self.weights["mii"]

        # Calculate final normalized score
        final_score = (total_score / max_possible_score) * 100

        # Determine Risk Level
        if blacklist_res.get("is_blacklisted") or final_score < 40:
            risk_level = "Critical"
        elif critical_flags or final_score < 60:
            risk_level = "High"
        elif final_score < 80:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "score": round(final_score, 2),
            "risk_level": risk_level,
            "category_scores": category_scores,
            "discrepancies": discrepancies,
            "critical_flags": critical_flags
        }
