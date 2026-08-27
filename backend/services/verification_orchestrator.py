from typing import Dict, Any

from backend.integrations import (
    UdyamIntegration, GSTIntegration, PANIntegration,
    EPFOIntegration, ESICIntegration, MCA21Integration,
    StartupIndiaIntegration, NSICIntegration, DigiLockerIntegration, BlacklistIntegration
)
from .compliance_engine import ComplianceEngine
from .ai_engine import AIEngine

class VerificationOrchestrator:
    """
    Orchestrates the entire verification flow: 
    Integrations -> Compliance Scoring -> AI Recommendations
    """
    def __init__(self):
        # Initialize Integrations
        self.udyam = UdyamIntegration()
        self.gst = GSTIntegration()
        self.pan = PANIntegration()
        self.epfo = EPFOIntegration()
        self.esic = ESICIntegration()
        self.mca21 = MCA21Integration()
        self.startup = StartupIndiaIntegration()
        self.nsic = NSICIntegration()
        self.digilocker = DigiLockerIntegration()
        self.blacklist = BlacklistIntegration()
        
        # Initialize Services
        self.compliance_engine = ComplianceEngine()
        self.ai_engine = AIEngine()

    def run_verification(self, bidder_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs all verifications and returns a comprehensive report.
        """
        verification_results = {}
        
        # Run checks
        verification_results["pan"] = self.pan.verify(
            pan_number=bidder_data.get("pan"), 
            bidder_name=bidder_data.get("name")
        )
        
        verification_results["gst"] = self.gst.verify(
            gstin=bidder_data.get("gstin"),
            pan_number=bidder_data.get("pan")
        )
        
        verification_results["udyam"] = self.udyam.verify(
            udyam_number=bidder_data.get("udyam_number"),
            pan_number=bidder_data.get("pan")
        )
        
        verification_results["epfo"] = self.epfo.verify(
            epfo_number=bidder_data.get("epfo_number")
        )
        
        verification_results["esic"] = self.esic.verify(
            esic_number=bidder_data.get("esic_number")
        )
        
        verification_results["mca21"] = self.mca21.verify(
            cin=bidder_data.get("cin")
        )
        
        verification_results["startup_india"] = self.startup.verify(
            dpiit_number=bidder_data.get("dpiit_number")
        )
        
        verification_results["nsic"] = self.nsic.verify(
            nsic_number=bidder_data.get("nsic_number")
        )
        
        verification_results["digilocker"] = self.digilocker.verify(
            document_hash=bidder_data.get("document_hash")
        )
        
        verification_results["blacklist"] = self.blacklist.verify(
            pan_number=bidder_data.get("pan"),
            gstin=bidder_data.get("gstin"),
            name=bidder_data.get("name")
        )

        # Compute Score
        compliance_summary = self.compliance_engine.compute_score(verification_results)
        
        # Generate AI Recommendations
        ai_insights = self.ai_engine.generate_recommendations(
            bidder_data, 
            compliance_summary, 
            compliance_summary.get("discrepancies", [])
        )
        
        # In a real app, this is where we'd save the VerificationRun to the DB
        
        return {
            "bidder": bidder_data,
            "verification_details": verification_results,
            "compliance_summary": compliance_summary,
            "ai_insights": ai_insights
        }
