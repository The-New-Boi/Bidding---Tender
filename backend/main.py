from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import pandas as pd
import bcrypt
from contextlib import asynccontextmanager
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import Dict, Any, List, Optional

from backend.config import settings
from backend.database import init_db, AsyncSessionLocal, get_db
from backend.models.bidder import Bidder
from backend.models.tender import Tender
from backend.models.user import User
from backend.models.audit_log import AuditLog
from backend.schemas import AuditLogResponse
from backend.api import bidders, verification, dashboard, audit, auth, tenders

def hash_password(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

async def db_session_count(session: AsyncSession, model) -> int:
    result = await session.execute(select(func.count()).select_from(model))
    return result.scalar() or 0

async def load_sample_data():
    async with AsyncSessionLocal() as session:
        # 1. Seed Default Officer User if not present
        user_res = await session.execute(select(User).limit(1))
        if user_res.scalar_one_or_none() is None:
            default_user = User(
                name="Ananya Rao",
                email="ananya@cpcl.gov.in",
                hashed_password=hash_password("admin123"),
                role="officer",
                department="CPCL Procurement"
            )
            session.add(default_user)
            await session.commit()
            print("Seeded default user Ananya Rao.")

        # 2. Seed 22 Diverse Tenders if fewer than 10 exist
        tender_count_res = await db_session_count(session, Tender)
        if tender_count_res < 10:
            tenders_data = [
                # --- OPEN TENDERS (7) ---
                {
                    "tender_number": "TENDER-2026-CPCL-001",
                    "title": "Procurement of Refinery Instrumentation Valves & Flow Controllers",
                    "description": "Supply, calibration & commissioning of high-precision industrial control valves, digital positioners, mass flow controllers and pressure transmitters for CPCL Chennai Refinery Unit 4. Compliance with IS 5312 and API 6D mandatory.",
                    "department": "CPCL Chennai Refinery – Instrumentation Division",
                    "budget": 5500000.0,
                    "category": "Instrumentation & Controls",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 40, "require_oem": True, "max_bid_amount": 6000000},
                    "selection_mode": "ai_ranked",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Kaveri Industrial Supplies Ltd", "pan": "AAACK1234F", "gstin": "33AAACK1234F1Z5", "bid_amount": 4850000.0, "phone": "+91 98401 23456", "email": "contact@kaveriind.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-02-0012345", "local_content_percentage": 65, "oem_authorized": True, "legacy_score": 88.0, "blacklisted": False},
                        {"bidder_name": "Marina Automation Works Pvt Ltd", "pan": "AABCM5678G", "gstin": "33AABCM5678G1Z2", "bid_amount": 5100000.0, "phone": "+91 94440 98765", "email": "info@marinaauto.in", "address": "Coimbatore, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-03-0098765", "local_content_percentage": 50, "oem_authorized": True, "legacy_score": 82.0, "blacklisted": False},
                        {"bidder_name": "Reliance Industrial Controls", "pan": "AABCR1122K", "gstin": "27AABCR1122K1Z9", "bid_amount": 4400000.0, "phone": "+91 98200 11223", "email": "tenders@reliance.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 80, "oem_authorized": True, "legacy_score": 95.0, "blacklisted": False},
                        {"bidder_name": "Adani Enterprises Infra", "pan": "AABCA9988P", "gstin": "24AABCA9988P1Z3", "bid_amount": 6200000.0, "phone": "+91 97129 99887", "email": "bids@adani.com", "address": "Ahmedabad, Gujarat", "msme_registered": False, "local_content_percentage": 25, "oem_authorized": False, "legacy_score": 60.0, "blacklisted": True, "blacklist_reason": "Failure to complete 2024 refinery piping contract on schedule."},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-002",
                    "title": "Annual Turnaround Electrical Substation Overhaul & Transformer Testing",
                    "description": "Complete electrical overhauling of 33KV/11KV substations at Manali Refinery, including transformer oil testing, relay calibration, switchgear inspection, busbar testing and protective relay commissioning. IS 1554 compliance required.",
                    "department": "CPCL Electrical Engineering Department",
                    "budget": 12000000.0,
                    "category": "Electrical Works",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 50, "require_oem": False, "max_bid_amount": 13200000},
                    "selection_mode": "ai_ranked",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Spark Electrical Engineering Pvt Ltd", "pan": "AABCS9987E", "gstin": "33AABCS9987E1Z8", "bid_amount": 10800000.0, "phone": "+91 94450 34567", "email": "projects@sparkeng.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-05-0023456", "local_content_percentage": 75, "oem_authorized": False, "legacy_score": 85.0, "blacklisted": False},
                        {"bidder_name": "Bharat Heavy Controls Pvt Ltd", "pan": "AABCB4456H", "gstin": "27AABCB4456H1Z3", "bid_amount": 11500000.0, "phone": "+91 98222 87654", "email": "tenders@bharatheavy.com", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 90, "oem_authorized": False, "legacy_score": 92.0, "blacklisted": False},
                        {"bidder_name": "Siemens Energy Systems India", "pan": "AABCS1234S", "gstin": "06AABCS1234S1Z1", "bid_amount": 9900000.0, "phone": "+91 11 6600 4000", "email": "energy.tenders@siemens.in", "address": "Gurgaon, Haryana", "msme_registered": False, "local_content_percentage": 55, "oem_authorized": True, "legacy_score": 97.0, "blacklisted": False},
                        {"bidder_name": "Tamil Nadu Electrical Solutions", "pan": "AABCT6789K", "gstin": "33AABCT6789K1Z2", "bid_amount": 12900000.0, "phone": "+91 44 2345 6789", "email": "bid@tnesol.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "local_content_percentage": 60, "oem_authorized": False, "legacy_score": 70.0, "blacklisted": False},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-003",
                    "title": "Supply & Installation of Anti-Corrosive Pipe Coatings – Manali Unit",
                    "description": "Supply and application of high-build epoxy and coal-tar enamel anti-corrosive coatings on 4-inch to 24-inch diameter pipeline sections within CPCL Manali Refinery Process Unit 3. NACE standard compliance required.",
                    "department": "CPCL Piping & Corrosion Management Cell",
                    "budget": 7000000.0,
                    "category": "Piping & Fittings",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 60, "require_oem": False, "max_bid_amount": 7700000},
                    "selection_mode": "fair_draw",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Southern Pipeline Corp", "pan": "AABCS4433P", "gstin": "33AABCS4433P1Z9", "bid_amount": 6300000.0, "phone": "+91 94471 55678", "email": "bid@southpipe.in", "address": "Chennai, Tamil Nadu", "msme_registered": False, "local_content_percentage": 85, "oem_authorized": False, "legacy_score": 80.0, "blacklisted": False},
                        {"bidder_name": "Coromandel Piping & Coatings Ltd", "pan": "AABCC8823Q", "gstin": "33AABCC8823Q1Z4", "bid_amount": 6750000.0, "phone": "+91 44 2678 9012", "email": "tenders@coromandelpc.com", "address": "Ennore, Tamil Nadu", "msme_registered": False, "local_content_percentage": 78, "oem_authorized": False, "legacy_score": 76.0, "blacklisted": False},
                        {"bidder_name": "Rustproof Technologies Pvt Ltd", "pan": "AABCR7712T", "gstin": "27AABCR7712T1Z5", "bid_amount": 5900000.0, "phone": "+91 20 4567 8901", "email": "info@rustproof.in", "address": "Pune, Maharashtra", "msme_registered": True, "udyam_number": "UDYAM-MH-02-0067890", "local_content_percentage": 91, "oem_authorized": False, "legacy_score": 88.0, "blacklisted": False},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-004",
                    "title": "Procurement & Commissioning of SCADA/DCS Upgradation – Refinery Units 2 & 3",
                    "description": "Supply, engineering, installation and commissioning of Distributed Control System (DCS) and SCADA upgrade for Process Units 2 & 3 at CPCL Chennai Refinery. Includes Honeywell TDC 3000 to Experion migration support.",
                    "department": "CPCL IT & Automation Division",
                    "budget": 28000000.0,
                    "category": "IT & SCADA Automation",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 35, "require_oem": True, "max_bid_amount": 31000000},
                    "selection_mode": "ai_ranked",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Honeywell Process Solutions India", "pan": "AABCH9901H", "gstin": "27AABCH9901H1Z6", "bid_amount": 24000000.0, "phone": "+91 98193 00112", "email": "india.tenders@honeywell.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 40, "oem_authorized": True, "legacy_score": 98.0, "blacklisted": False},
                        {"bidder_name": "L&T Hydrocarbon Engineering Ltd", "pan": "AAACL2345L", "gstin": "27AAACL2345L1Z8", "bid_amount": 26500000.0, "phone": "+91 22 6776 5656", "email": "hec.bids@lntecc.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 65, "oem_authorized": False, "legacy_score": 93.0, "blacklisted": False},
                        {"bidder_name": "ABB India Limited", "pan": "AAACA1122A", "gstin": "29AAACA1122A1ZE", "bid_amount": 22800000.0, "phone": "+91 80 2222 1234", "email": "procurement@abb.in", "address": "Bengaluru, Karnataka", "msme_registered": False, "local_content_percentage": 45, "oem_authorized": True, "legacy_score": 96.0, "blacklisted": False},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-005",
                    "title": "Supply of Fire & Gas Detection Systems – LPG Bottling Plant",
                    "description": "Supply, installation, testing and commissioning of integrated fire & gas detection systems including IR flame detectors, toxic gas monitors, addressable fire alarm panels, and emergency PA systems for CPCL LPG Bottling Plant at Manali.",
                    "department": "CPCL Fire & Safety Division",
                    "budget": 9500000.0,
                    "category": "Safety Equipment",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 50, "require_oem": True, "max_bid_amount": 10500000},
                    "selection_mode": "ai_ranked",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Godrej Safety Equipment India Ltd", "pan": "AAACG3456G", "gstin": "27AAACG3456G1Z7", "bid_amount": 8600000.0, "phone": "+91 22 6796 5400", "email": "safety.tenders@godrej.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 80, "oem_authorized": True, "legacy_score": 94.0, "blacklisted": False},
                        {"bidder_name": "Minimax India Fire Protection Pvt Ltd", "pan": "AABCM3478N", "gstin": "07AABCM3478N1Z9", "bid_amount": 9100000.0, "phone": "+91 11 4567 8900", "email": "tenders@minimax.in", "address": "Delhi, Delhi", "msme_registered": True, "udyam_number": "UDYAM-DL-01-0099887", "local_content_percentage": 62, "oem_authorized": True, "legacy_score": 86.0, "blacklisted": False},
                        {"bidder_name": "Secure Systems & Integrators Pvt Ltd", "pan": "AABCS5512B", "gstin": "33AABCS5512B1Z3", "bid_amount": 8200000.0, "phone": "+91 44 3456 7890", "email": "bids@securesys.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-09-0054321", "local_content_percentage": 70, "oem_authorized": False, "legacy_score": 78.0, "blacklisted": False},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-006",
                    "title": "Procurement of Heat Exchangers – Atmospheric Distillation Unit (ADU)",
                    "description": "Design, manufacture and supply of shell & tube heat exchangers (TEMA Type AEW) for Atmospheric Distillation Unit preheating train. Units rated for 12 bar operating pressure, CS/SS316L construction, ASME VIII Div. 1 compliant.",
                    "department": "CPCL Mechanical Engineering Division",
                    "budget": 15000000.0,
                    "category": "Heat Transfer Equipment",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 70, "require_oem": False, "max_bid_amount": 17000000},
                    "selection_mode": "ai_ranked",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Thermax Energy Systems Ltd", "pan": "AAACT7890T", "gstin": "27AAACT7890T1Z2", "bid_amount": 13800000.0, "phone": "+91 20 6651 2345", "email": "bid.thermax@thermax.com", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 92, "oem_authorized": False, "legacy_score": 91.0, "blacklisted": False},
                        {"bidder_name": "Alfa Laval India Ltd", "pan": "AABCA5577A", "gstin": "27AABCA5577A1Z4", "bid_amount": 14500000.0, "phone": "+91 22 4155 3300", "email": "in.sales@alfalaval.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 60, "oem_authorized": True, "legacy_score": 96.0, "blacklisted": False},
                        {"bidder_name": "Cethar Limited", "pan": "AAACW8891C", "gstin": "33AAACW8891C1Z5", "bid_amount": 12900000.0, "phone": "+91 431 4040 100", "email": "tenders@cethar.com", "address": "Tiruchirappalli, Tamil Nadu", "msme_registered": False, "local_content_percentage": 95, "oem_authorized": False, "legacy_score": 87.0, "blacklisted": False},
                        {"bidder_name": "Sansera Heat Exchangers Pvt Ltd", "pan": "AABCS4490S", "gstin": "29AABCS4490S1Z3", "bid_amount": 11200000.0, "phone": "+91 80 2345 6789", "email": "bid@sansera-hx.com", "address": "Bengaluru, Karnataka", "msme_registered": True, "udyam_number": "UDYAM-KA-03-0088776", "local_content_percentage": 88, "oem_authorized": False, "legacy_score": 79.0, "blacklisted": False},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-007",
                    "title": "Installation of Rooftop Solar Power System – CPCL HQ & Admin Block",
                    "description": "Design, supply, installation, testing and commissioning of 500 kWp grid-tied rooftop solar photovoltaic power generation system at CPCL HQ campus, including net-metering tie-up with TANGEDCO, 10-year O&M contract.",
                    "department": "CPCL Corporate ESG & Sustainability Division",
                    "budget": 22000000.0,
                    "category": "Solar & Clean Energy",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 60, "require_oem": False, "max_bid_amount": 24000000},
                    "selection_mode": "ai_ranked",
                    "status": "open",
                    "bidders": [
                        {"bidder_name": "Tata Solar Systems Ltd", "pan": "AAACT1122T", "gstin": "27AAACT1122T1Z3", "bid_amount": 20000000.0, "phone": "+91 22 6665 8000", "email": "solar.tenders@tata.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 78, "oem_authorized": True, "legacy_score": 95.0, "blacklisted": False},
                        {"bidder_name": "Waaree Energies Ltd", "pan": "AAACW2244W", "gstin": "24AAACW2244W1Z9", "bid_amount": 18500000.0, "phone": "+91 2717 298 400", "email": "bids@waaree.com", "address": "Surat, Gujarat", "msme_registered": False, "local_content_percentage": 95, "oem_authorized": True, "legacy_score": 89.0, "blacklisted": False},
                        {"bidder_name": "Sterling and Wilson Solar Ltd", "pan": "AAACS8899S", "gstin": "27AAACS8899S1Z1", "bid_amount": 21500000.0, "phone": "+91 22 6143 6000", "email": "solar@sterlingandwilson.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 70, "oem_authorized": True, "legacy_score": 92.0, "blacklisted": False},
                    ]
                },

                # --- EVALUATION / UNDER REVIEW TENDERS (8) ---
                {
                    "tender_number": "TENDER-2026-CPCL-008",
                    "title": "Effluent Treatment Plant (ETP) Upgrade & Zero-Liquid Discharge System",
                    "description": "Comprehensive upgrade of existing ETP including biological treatment, evaporator-crystallizer ZLD system, online effluent quality monitoring, and regulatory compliance reporting for CPCL Chennai facility. Consent to Operate (CTO) from TNPCB required.",
                    "department": "CPCL Environment, Health & Safety Division",
                    "budget": 35000000.0,
                    "category": "Water & Effluent Treatment",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 65, "require_oem": False, "max_bid_amount": 38500000},
                    "selection_mode": "ai_ranked",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Ion Exchange India Ltd", "pan": "AAACI4455I", "gstin": "27AAACI4455I1Z8", "bid_amount": 32000000.0, "phone": "+91 22 2403 5861", "email": "tenders@ionexchange.in", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 88, "oem_authorized": False, "legacy_score": 90.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 91.2, "rank": 1},
                        {"bidder_name": "Praj Industries Ltd", "pan": "AAACP3344P", "gstin": "27AAACP3344P1Z2", "bid_amount": 33500000.0, "phone": "+91 20 7190 2000", "email": "env.bids@praj.net", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 82, "oem_authorized": False, "legacy_score": 85.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 86.0, "rank": 2},
                        {"bidder_name": "VA Tech Wabag Ltd", "pan": "AAACV7788V", "gstin": "33AAACV7788V1Z5", "bid_amount": 30500000.0, "phone": "+91 44 4000 6000", "email": "tenders@wabag.com", "address": "Chennai, Tamil Nadu", "msme_registered": False, "local_content_percentage": 75, "oem_authorized": False, "legacy_score": 93.0, "blacklisted": False, "stage": "scored", "compliance_score": 88.0, "final_score": 89.6, "rank": 3},
                        {"bidder_name": "Thermax Environmental Engineering", "pan": "AAACT7891T", "gstin": "27AAACT7891T1Z9", "bid_amount": 39000000.0, "phone": "+91 20 6658 1000", "email": "env.tenders@thermax.com", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 80, "oem_authorized": False, "legacy_score": 88.0, "blacklisted": False, "stage": "eliminated", "elimination_reason": "Bid amount (39000000) exceeds max threshold (38500000)"},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-009",
                    "title": "Annual Maintenance Contract – Boiler & Steam Generation Systems",
                    "description": "Comprehensive AMC for 3 nos. of Thermax package boilers (50 TPH, 60 bar) and 2 nos. heat recovery steam generators at CPCL Manali Refinery. Includes statutory inspections, IBR compliance, tube condition monitoring, safety valve testing.",
                    "department": "CPCL Utilities & Services Division",
                    "budget": 8500000.0,
                    "category": "Maintenance & AMC",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 80, "require_oem": False, "max_bid_amount": 9350000},
                    "selection_mode": "fair_draw",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Boilercare Services Pvt Ltd", "pan": "AABCB6634B", "gstin": "33AABCB6634B1Z7", "bid_amount": 7800000.0, "phone": "+91 44 2567 8901", "email": "amc@boilercare.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-04-0034561", "local_content_percentage": 100, "oem_authorized": False, "legacy_score": 82.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 86.2, "rank": 1},
                        {"bidder_name": "Chennai Boiler & Vessel Inspection", "pan": "AABCC5521C", "gstin": "33AABCC5521C1Z2", "bid_amount": 8100000.0, "phone": "+91 44 2890 1234", "email": "bid@cbvi.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-07-0056789", "local_content_percentage": 100, "oem_authorized": False, "legacy_score": 78.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 83.2, "rank": 2},
                        {"bidder_name": "IBR Certified Boiler Works", "pan": "AABCI9923I", "gstin": "29AABCI9923I1Z4", "bid_amount": 7200000.0, "phone": "+91 80 3456 7890", "email": "tenders@ibrcertified.in", "address": "Bengaluru, Karnataka", "msme_registered": True, "udyam_number": "UDYAM-KA-06-0023456", "local_content_percentage": 100, "oem_authorized": False, "legacy_score": 86.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 88.0, "rank": 3},
                        {"bidder_name": "Defective Contractors Syndicate", "pan": "AABCD0012X", "gstin": "27AABCD0012X1ZZ", "bid_amount": 6000000.0, "phone": "+91 22 1234 9999", "email": "fake@defect.com", "address": "Mumbai, Maharashtra", "msme_registered": True, "local_content_percentage": 100, "oem_authorized": False, "legacy_score": 40.0, "blacklisted": True, "blacklist_reason": "Debarred by Ministry of Petroleum for falsified IBR certifications.", "stage": "eliminated", "elimination_reason": "Company is blacklisted"},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-010",
                    "title": "Supply of Petroleum Catalysts & Chemical Additives – FCC Unit",
                    "description": "Procurement of equilibrium catalyst (Ecat) makeup supply, cocatalysts (CO combustion promoters, passivation agents) and specialty chemicals for the Fluid Catalytic Cracking (FCC) Unit at CPCL Manali. ISO 9001:2015 certified supplier mandatory.",
                    "department": "CPCL Chemical Engineering & Process Division",
                    "budget": 45000000.0,
                    "category": "Chemicals & Catalysts",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 30, "require_oem": True, "max_bid_amount": 50000000},
                    "selection_mode": "ai_ranked",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "BASF India Limited", "pan": "AAACB1234B", "gstin": "27AAACB1234B1Z5", "bid_amount": 40000000.0, "phone": "+91 22 6278 0600", "email": "catalyst.bids@basf.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 35, "oem_authorized": True, "legacy_score": 99.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 95.6, "rank": 1},
                        {"bidder_name": "W.R. Grace India Pvt Ltd", "pan": "AAACW4567G", "gstin": "27AAACW4567G1Z3", "bid_amount": 42000000.0, "phone": "+91 22 7175 3000", "email": "india.catalysts@grace.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 32, "oem_authorized": True, "legacy_score": 97.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 92.4, "rank": 2},
                        {"bidder_name": "Zeolyst India Process Solutions", "pan": "AAACZ8901Z", "gstin": "07AAACZ8901Z1Z7", "bid_amount": 38000000.0, "phone": "+91 11 4456 7890", "email": "bids@zeolyst.in", "address": "Delhi, Delhi", "msme_registered": False, "local_content_percentage": 45, "oem_authorized": True, "legacy_score": 88.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 87.6, "rank": 3},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-011",
                    "title": "CCTV Surveillance & Access Control Upgrade – Perimeter & Process Areas",
                    "description": "Supply, installation, integration and commissioning of IP-based CCTV cameras (4MP, explosion-proof in hazardous zones), biometric access control, centralized VMS, and intrusion alarm system for CPCL Manali complex perimeter.",
                    "department": "CPCL Security & Administration Division",
                    "budget": 6500000.0,
                    "category": "Security & Surveillance",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 55, "require_oem": False, "max_bid_amount": 7200000},
                    "selection_mode": "ai_ranked",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Eagle Eye Security Systems Ltd", "pan": "AABCE4456E", "gstin": "33AABCE4456E1Z1", "bid_amount": 5900000.0, "phone": "+91 44 3456 7891", "email": "bid@eagleeye.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-11-0078901", "local_content_percentage": 70, "oem_authorized": False, "legacy_score": 80.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 83.0, "rank": 1},
                        {"bidder_name": "Honeywell Security India", "pan": "AABCH9902H", "gstin": "27AABCH9902H1Z2", "bid_amount": 6400000.0, "phone": "+91 22 4567 8902", "email": "security.bids@honeywell.com", "address": "Navi Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 55, "oem_authorized": True, "legacy_score": 95.0, "blacklisted": False, "stage": "scored", "compliance_score": 85.0, "final_score": 88.0, "rank": 2},
                        {"bidder_name": "Securitas India Pvt Ltd", "pan": "AAACS3345S", "gstin": "07AAACS3345S1Z8", "bid_amount": 5500000.0, "phone": "+91 11 4133 5000", "email": "tenders@securitas.in", "address": "Delhi, Delhi", "msme_registered": False, "local_content_percentage": 60, "oem_authorized": False, "legacy_score": 85.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 82.0, "rank": 3},
                        {"bidder_name": "Expired GST Tech Solutions", "pan": "AABCF0011Z", "gstin": "33AABCF0011Z1ZQ", "bid_amount": 4800000.0, "phone": "+91 44 1111 0000", "email": "expired@gstfail.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "local_content_percentage": 65, "oem_authorized": False, "legacy_score": 72.0, "blacklisted": False, "gst_status": "Cancelled", "stage": "eliminated", "elimination_reason": "GST status is Cancelled"},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-012",
                    "title": "Supply of Cranes, Hoists & Material Handling Equipment – Turnaround 2027",
                    "description": "Supply on hire basis of 150-ton hydraulic telescopic cranes (2 nos.), 30-ton electric overhead cranes (4 nos.) and allied rigging, lifting gear and safety supervision team for the planned 2027 Turnaround Maintenance of CPCL VDU-3.",
                    "department": "CPCL Maintenance & Turnaround Division",
                    "budget": 18000000.0,
                    "category": "Heavy Machinery & Rigging",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 75, "require_oem": False, "max_bid_amount": 20000000},
                    "selection_mode": "fair_draw",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Bharat Crane Services Ltd", "pan": "AABCB6677B", "gstin": "33AABCB6677B1Z3", "bid_amount": 16500000.0, "phone": "+91 44 2678 9013", "email": "bids@bharatcrane.in", "address": "Ennore, Tamil Nadu", "msme_registered": False, "local_content_percentage": 95, "oem_authorized": False, "legacy_score": 84.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 87.6, "rank": 1},
                        {"bidder_name": "All India Rigging Corporation", "pan": "AAACA4478A", "gstin": "27AAACA4478A1Z2", "bid_amount": 15800000.0, "phone": "+91 22 4567 8903", "email": "info@airc.co.in", "address": "Navi Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 90, "oem_authorized": False, "legacy_score": 88.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 89.0, "rank": 2},
                        {"bidder_name": "Sarens Heavy Lift India Pvt Ltd", "pan": "AAACS2290S", "gstin": "27AAACS2290S1Z4", "bid_amount": 17200000.0, "phone": "+91 22 6789 0123", "email": "india.bids@sarens.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 80, "oem_authorized": True, "legacy_score": 96.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 92.8, "rank": 3},
                        {"bidder_name": "Local Lift Co. (Non-compliant)", "pan": "AABCL5501X", "gstin": "33AABCL5501X1ZZ", "bid_amount": 12000000.0, "phone": "+91 44 9999 8888", "email": "local@liftco.com", "address": "Chennai, Tamil Nadu", "msme_registered": False, "local_content_percentage": 60, "oem_authorized": False, "legacy_score": 50.0, "blacklisted": False, "stage": "eliminated", "elimination_reason": "Local content (60%) below requirement (75%)"},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-013",
                    "title": "Air Quality Monitoring Network – Stack Emission & Ambient Air",
                    "description": "Installation and commissioning of Continuous Emission Monitoring Systems (CEMS) at 6 stacks, 4 Ambient Air Quality Monitoring Stations (AAQMS) with real-time telemetry to CPCB OCEMS server. Compliant with MOEF Environment Protection Act norms.",
                    "department": "CPCL Environment Health & Safety Division",
                    "budget": 12000000.0,
                    "category": "Environmental & Air Quality",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 50, "require_oem": True, "max_bid_amount": 13200000},
                    "selection_mode": "ai_ranked",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Enviro Technology Ltd", "pan": "AAACE5512E", "gstin": "24AAACE5512E1Z7", "bid_amount": 10800000.0, "phone": "+91 2817 252 000", "email": "bids@envirotech.in", "address": "Ahmedabad, Gujarat", "msme_registered": False, "local_content_percentage": 78, "oem_authorized": True, "legacy_score": 87.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 88.4, "rank": 1},
                        {"bidder_name": "Thermo Scientific India", "pan": "AAACT8892T", "gstin": "27AAACT8892T1Z6", "bid_amount": 11500000.0, "phone": "+91 22 6765 4321", "email": "india.env@thermofisher.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 50, "oem_authorized": True, "legacy_score": 95.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 90.0, "rank": 2},
                        {"bidder_name": "Pollution Control Engineers India", "pan": "AABCP7789P", "gstin": "33AABCP7789P1Z1", "bid_amount": 9900000.0, "phone": "+91 44 4567 8904", "email": "tenders@pce.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-08-0012345", "local_content_percentage": 85, "oem_authorized": False, "legacy_score": 80.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 84.0, "rank": 3},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-014",
                    "title": "Procurement of PPE & Safety Workwear – Annual Rate Contract 2026-27",
                    "description": "Annual Rate Contract for supply of Flame Resistant Coveralls (Arc Rated), Safety Helmets (IS 2925), Safety Shoes (IS 15298), Chemical Resistant Gloves, SCBA sets, and Fall Arrest Harnesses for CPCL personnel – approx 2,000 sets/year.",
                    "department": "CPCL HSE & Stores Division",
                    "budget": 4500000.0,
                    "category": "Safety Equipment",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 70, "require_oem": False, "max_bid_amount": 5000000},
                    "selection_mode": "ai_ranked",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Safety India PPE Pvt Ltd", "pan": "AABCS6612S", "gstin": "33AABCS6612S1Z6", "bid_amount": 3900000.0, "phone": "+91 44 3567 8905", "email": "ppe.bids@safetyindia.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-06-0091234", "local_content_percentage": 95, "oem_authorized": False, "legacy_score": 83.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 87.4, "rank": 1},
                        {"bidder_name": "3M India Safety Division", "pan": "AABCM7723M", "gstin": "29AABCM7723M1Z8", "bid_amount": 4300000.0, "phone": "+91 80 2222 9876", "email": "safety.tenders@3m.in", "address": "Bengaluru, Karnataka", "msme_registered": False, "local_content_percentage": 72, "oem_authorized": True, "legacy_score": 97.0, "blacklisted": False, "stage": "scored", "compliance_score": 85.0, "final_score": 90.8, "rank": 2},
                        {"bidder_name": "Drager India Pvt Ltd", "pan": "AABCD3348D", "gstin": "29AABCD3348D1Z2", "bid_amount": 4100000.0, "phone": "+91 80 6556 3300", "email": "safety@draeger.com", "address": "Bengaluru, Karnataka", "msme_registered": False, "local_content_percentage": 65, "oem_authorized": True, "legacy_score": 93.0, "blacklisted": False, "stage": "eliminated", "elimination_reason": "Local content (65%) below requirement (70%)"},
                    ]
                },
                {
                    "tender_number": "TENDER-2026-CPCL-015",
                    "title": "Supply of Crude Oil Transfer Pumps & Seal Systems",
                    "description": "Supply of 6 nos. centrifugal crude oil transfer pumps (capacity: 800 m³/hr at 16 bar) with mechanical seals, seal pots, and coupling guards for CPCL crude tank farm. API 610 (12th Ed.) compliance, material MOC CS/CD4MCu.",
                    "department": "CPCL Rotating Equipment Division",
                    "budget": 19000000.0,
                    "category": "Instrumentation & Controls",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 65, "require_oem": True, "max_bid_amount": 21000000},
                    "selection_mode": "ai_ranked",
                    "status": "evaluation",
                    "bidders": [
                        {"bidder_name": "Flowserve India Controls Pvt Ltd", "pan": "AABCF8834F", "gstin": "27AABCF8834F1Z7", "bid_amount": 16800000.0, "phone": "+91 22 5600 1234", "email": "india.bids@flowserve.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 70, "oem_authorized": True, "legacy_score": 95.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 94.0, "rank": 1},
                        {"bidder_name": "KSB Pumps Ltd", "pan": "AAACK2231K", "gstin": "27AAACK2231K1Z4", "bid_amount": 17500000.0, "phone": "+91 20 6633 1234", "email": "tenders@ksb.com", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 85, "oem_authorized": True, "legacy_score": 92.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 91.0, "rank": 2},
                        {"bidder_name": "Kirloskar Brothers Ltd", "pan": "AAACK3456K", "gstin": "27AAACK3456K1Z9", "bid_amount": 15000000.0, "phone": "+91 20 2729 9000", "email": "tenders@kbl.co.in", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 95, "oem_authorized": False, "legacy_score": 90.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 89.0, "rank": 3},
                    ]
                },

                # --- AWARDED TENDERS (7) ---
                {
                    "tender_number": "TENDER-2025-CPCL-089",
                    "title": "Supply of High-Pressure Safety Relief Valves – CDU Section",
                    "description": "Supply of 48 nos. spring-loaded pressure relief valves (API 520/526 compliant) for CDU overhead section, including hydrostatic test certification, 3rd party inspection, and dimensional inspection reports.",
                    "department": "CPCL Chennai Refinery Unit 2 – Safety",
                    "budget": 4500000.0,
                    "category": "Safety Equipment",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 60, "require_oem": True, "max_bid_amount": 5000000},
                    "selection_mode": "ai_ranked",
                    "status": "awarded",
                    "awarded_reason": "Selected by AI Evaluation System based on highest combined score (89.4/100). Bharat Safety Systems Ltd – MSME certified, API 526 licensed manufacturer, 0 safety violations in 3-year track record.",
                    "bidders": [
                        {"bidder_name": "Bharat Safety Systems Ltd", "pan": "AABCB7789B", "gstin": "33AABCB7789B1Z4", "bid_amount": 4200000.0, "phone": "+91 44 4567 8906", "email": "safety@bharatsafety.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-12-0045678", "local_content_percentage": 90, "oem_authorized": True, "legacy_score": 87.0, "blacklisted": False, "stage": "selected", "compliance_score": 100.0, "final_score": 89.4, "rank": 1},
                        {"bidder_name": "Tyco Flow Control India", "pan": "AAACT5567T", "gstin": "27AAACT5567T1Z1", "bid_amount": 4600000.0, "phone": "+91 22 6234 5678", "email": "india@tycovalves.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 65, "oem_authorized": True, "legacy_score": 93.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 88.0, "rank": 2},
                        {"bidder_name": "Neon Relief Valve Works", "pan": "AABCN4489N", "gstin": "33AABCN4489N1ZE", "bid_amount": 3800000.0, "phone": "+91 44 2890 1235", "email": "bids@neonvalves.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-10-0067891", "local_content_percentage": 95, "oem_authorized": False, "legacy_score": 72.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 78.8, "rank": 3},
                        {"bidder_name": "Blacklisted Piping Pvt Ltd", "pan": "AABCB9900X", "gstin": "27AABCB9900X1ZZ", "bid_amount": 3500000.0, "phone": "+91 22 0000 1111", "email": "fake@bp.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 50, "oem_authorized": False, "legacy_score": 45.0, "blacklisted": True, "blacklist_reason": "Debarred by CPWD for supplying sub-standard pressure vessels.", "stage": "eliminated", "elimination_reason": "Company is blacklisted | MSME registration required but missing | OEM authorization required but missing | Local content (50%) below requirement (60%)"},
                    ]
                },
                {
                    "tender_number": "TENDER-2025-CPCL-071",
                    "title": "Procurement of Heat Exchangers & Cooling Systems – VDU Section",
                    "description": "Manufacture and supply of 8 nos. shell & tube heat exchangers and 4 nos. air cooled heat exchangers for Vacuum Distillation Unit product cooling train. ASME Section VIII Division 1, TEMA-R type.",
                    "department": "CPCL Chennai Refinery Unit 1 – Process",
                    "budget": 12000000.0,
                    "category": "Heat Transfer Equipment",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 70, "require_oem": False, "max_bid_amount": 13500000},
                    "selection_mode": "ai_ranked",
                    "status": "awarded",
                    "awarded_reason": "Selected by AI Evaluation System based on highest combined score (91.0/100). Thermotech Industries – ASME Section VIII certified, superior track record in petrochemical HX supply.",
                    "bidders": [
                        {"bidder_name": "Thermotech Industries Pvt Ltd", "pan": "AAACT3345T", "gstin": "33AAACT3345T1Z7", "bid_amount": 10800000.0, "phone": "+91 44 3678 9014", "email": "hx.bids@thermotech.in", "address": "Chennai, Tamil Nadu", "msme_registered": False, "local_content_percentage": 93, "oem_authorized": False, "legacy_score": 90.0, "blacklisted": False, "stage": "selected", "compliance_score": 100.0, "final_score": 91.0, "rank": 1},
                        {"bidder_name": "HRSG Technologies Pvt Ltd", "pan": "AABCH5512H", "gstin": "27AABCH5512H1Z8", "bid_amount": 11200000.0, "phone": "+91 20 4567 8907", "email": "bids@hrsg.in", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 88, "oem_authorized": False, "legacy_score": 85.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 86.2, "rank": 2},
                        {"bidder_name": "Godavari Heat Transfer Co", "pan": "AAACG5678G", "gstin": "36AAACG5678G1Z3", "bid_amount": 9500000.0, "phone": "+91 40 3456 7892", "email": "tender@godavariht.com", "address": "Hyderabad, Telangana", "msme_registered": False, "local_content_percentage": 82, "oem_authorized": False, "legacy_score": 80.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 82.0, "rank": 3},
                    ]
                },
                {
                    "tender_number": "TENDER-2024-CPCL-058",
                    "title": "Annual Maintenance Contract – Instrumentation Systems AMC 2024-25",
                    "description": "Comprehensive AMC for all instrumentation assets including DCS field devices, safety instrumented systems (SIS), transmitters (P, T, F, L), analyser houses, and HART/Fieldbus devices at CPCL Manali Complex.",
                    "department": "CPCL Manali Complex – Instrumentation",
                    "budget": 2900000.0,
                    "category": "Maintenance & AMC",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 90, "require_oem": False, "max_bid_amount": 3200000},
                    "selection_mode": "ai_ranked",
                    "status": "awarded",
                    "awarded_reason": "Selected by AI Evaluation System based on highest combined score (88.6/100). Kaveri Industrial Supplies – proven AMC track record, MSME certified, resident Chennai team.",
                    "bidders": [
                        {"bidder_name": "Kaveri Industrial Supplies Ltd", "pan": "AAACK1235F", "gstin": "33AAACK1235F1Z4", "bid_amount": 2600000.0, "phone": "+91 98401 23457", "email": "amc@kaveriind.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-02-0012346", "local_content_percentage": 100, "oem_authorized": False, "legacy_score": 86.0, "blacklisted": False, "stage": "selected", "compliance_score": 100.0, "final_score": 88.6, "rank": 1},
                        {"bidder_name": "Precision Instruments Services", "pan": "AABCP3312P", "gstin": "33AABCP3312P1Z9", "bid_amount": 2800000.0, "phone": "+91 44 5678 9015", "email": "amc@piservices.in", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-05-0023457", "local_content_percentage": 100, "oem_authorized": False, "legacy_score": 79.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 83.0, "rank": 2},
                    ]
                },
                {
                    "tender_number": "TENDER-2024-CPCL-043",
                    "title": "Supply of Corrosion-Resistant Alloy Pipeline Components",
                    "description": "Procurement of CRA (Corrosion Resistant Alloy) piping components including duplex SS 2205 pipes, fittings, flanges, and valves for H2S service in Hydrocracker Unit. NACE MR0175 / ISO 15156 compliant.",
                    "department": "CPCL Refinery Piping Division",
                    "budget": 6700000.0,
                    "category": "Piping & Fittings",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 70, "require_oem": False, "max_bid_amount": 7500000},
                    "selection_mode": "fair_draw",
                    "status": "awarded",
                    "awarded_reason": "Selected via Fair Trade Anti-Corruption Random Draw among Top 3 qualified bidders. (AI top: Southern Pipeline Corp 87.0, Metallica 85.5, Ajax 83.0).",
                    "bidders": [
                        {"bidder_name": "Metallica Steel & Alloys Pvt Ltd", "pan": "AAACM6678M", "gstin": "27AAACM6678M1Z6", "bid_amount": 5800000.0, "phone": "+91 22 4234 5679", "email": "cra.bids@metallica.in", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 75, "oem_authorized": False, "legacy_score": 84.0, "blacklisted": False, "stage": "selected", "compliance_score": 100.0, "final_score": 85.5, "rank": 2},
                        {"bidder_name": "Southern Pipeline Corp", "pan": "AABCS4434P", "gstin": "33AABCS4434P1Z8", "bid_amount": 5600000.0, "phone": "+91 44 4678 9016", "email": "cra@southpipe.in", "address": "Chennai, Tamil Nadu", "msme_registered": False, "local_content_percentage": 88, "oem_authorized": False, "legacy_score": 87.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 87.0, "rank": 1},
                        {"bidder_name": "Ajax CRA Components Ltd", "pan": "AAACA6789A", "gstin": "27AAACA6789A1Z2", "bid_amount": 6100000.0, "phone": "+91 20 5678 9016", "email": "tenders@ajax-cra.com", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 80, "oem_authorized": False, "legacy_score": 82.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 83.0, "rank": 3},
                        {"bidder_name": "Fraudulent Metals Co", "pan": "AABCF5500X", "gstin": "27AABCF5500X1ZZ", "bid_amount": 3500000.0, "phone": "+91 22 0000 2222", "email": "fake@metals.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 50, "oem_authorized": False, "legacy_score": 30.0, "blacklisted": True, "blacklist_reason": "Debarred by Railway Board for forged test certificates.", "stage": "eliminated", "elimination_reason": "Company is blacklisted | Local content (50%) below requirement (70%)"},
                    ]
                },
                {
                    "tender_number": "TENDER-2025-CPCL-101",
                    "title": "Procurement & Commissioning of Fired Heater – Crude Preheat Train",
                    "description": "Design, fabrication, supply, erection and commissioning of a single-pass vertical cylindrical fired heater (60 MMkcal/hr capacity, natural gas fuel) for crude preheat train of CDU-2 at CPCL. API 560 (5th Ed.) compliant.",
                    "department": "CPCL Fired Equipment & Furnace Division",
                    "budget": 55000000.0,
                    "category": "Heavy Machinery & Rigging",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 70, "require_oem": False, "max_bid_amount": 61000000},
                    "selection_mode": "ai_ranked",
                    "status": "awarded",
                    "awarded_reason": "Selected by AI Evaluation System based on highest combined score (93.2/100). ISGEC Heavy Engineering – API 560 certified fabricator, ASME U/U2 stamp holder.",
                    "bidders": [
                        {"bidder_name": "ISGEC Heavy Engineering Ltd", "pan": "AAACI6789I", "gstin": "06AAACI6789I1Z5", "bid_amount": 48000000.0, "phone": "+91 120 4007 100", "email": "proj.bids@isgec.com", "address": "Noida, Uttar Pradesh", "msme_registered": False, "local_content_percentage": 95, "oem_authorized": True, "legacy_score": 93.0, "blacklisted": False, "stage": "selected", "compliance_score": 100.0, "final_score": 93.2, "rank": 1},
                        {"bidder_name": "Patel Engineering Ltd", "pan": "AAACP4456P", "gstin": "24AAACP4456P1Z6", "bid_amount": 52000000.0, "phone": "+91 22 6756 0000", "email": "fired.heater@patel.in", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 88, "oem_authorized": False, "legacy_score": 88.0, "blacklisted": False, "stage": "scored", "compliance_score": 95.0, "final_score": 88.6, "rank": 2},
                        {"bidder_name": "Nucon Industries Pvt Ltd", "pan": "AAACN7890N", "gstin": "27AAACN7890N1Z3", "bid_amount": 45500000.0, "phone": "+91 20 6600 7654", "email": "tenders@nucon.in", "address": "Pune, Maharashtra", "msme_registered": False, "local_content_percentage": 92, "oem_authorized": False, "legacy_score": 82.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 84.0, "rank": 3},
                    ]
                },
                {
                    "tender_number": "TENDER-2025-CPCL-115",
                    "title": "Water Treatment Chemical Supply – Cooling Tower & Boiler Feed",
                    "description": "Annual rate contract for supply of water treatment chemicals – cooling water inhibitors, biocides, scale & corrosion inhibitors, oxygen scavengers, and boiler feed water additives for CPCL utility systems. NSF/ANSI 60 certified products.",
                    "department": "CPCL Utilities & Water Management Division",
                    "budget": 3200000.0,
                    "category": "Chemicals & Catalysts",
                    "eligibility_criteria": {"require_msme": True, "min_local_content": 80, "require_oem": False, "max_bid_amount": 3600000},
                    "selection_mode": "ai_ranked",
                    "status": "awarded",
                    "awarded_reason": "Selected by AI Evaluation System based on highest combined score (86.0/100). Nalco India – global leader in water treatment, NSF/ANSI 60 certified, 10+ year CPCL relationship.",
                    "bidders": [
                        {"bidder_name": "Nalco Water India Ltd", "pan": "AAACN5567N", "gstin": "33AAACN5567N1Z2", "bid_amount": 2850000.0, "phone": "+91 44 4456 7893", "email": "water.bids@nalco.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "udyam_number": "UDYAM-TN-03-0098766", "local_content_percentage": 90, "oem_authorized": False, "legacy_score": 83.0, "blacklisted": False, "stage": "selected", "compliance_score": 100.0, "final_score": 86.0, "rank": 1},
                        {"bidder_name": "Veolia Water Technologies India", "pan": "AAACV5568V", "gstin": "27AAACV5568V1Z8", "bid_amount": 3100000.0, "phone": "+91 22 6678 1234", "email": "india.water@veolia.com", "address": "Mumbai, Maharashtra", "msme_registered": False, "local_content_percentage": 82, "oem_authorized": False, "legacy_score": 91.0, "blacklisted": False, "stage": "scored", "compliance_score": 90.0, "final_score": 85.0, "rank": 2},
                        {"bidder_name": "Unqualified Cheap Chemicals", "pan": "AABCU0001X", "gstin": "33AABCU0001X1ZQ", "bid_amount": 1500000.0, "phone": "+91 44 1111 2222", "email": "cheap@chem.com", "address": "Chennai, Tamil Nadu", "msme_registered": True, "local_content_percentage": 75, "oem_authorized": False, "legacy_score": 30.0, "blacklisted": False, "gst_status": "Cancelled", "stage": "eliminated", "elimination_reason": "GST status is Cancelled | MSME registration required but missing"},
                    ]
                },
                {
                    "tender_number": "TENDER-2024-CPCL-137",
                    "title": "Civil & Structural Works – New Crude Storage Tank Foundation",
                    "description": "Civil & structural construction of RCC raft foundation, annular plate foundation ring, and dyke wall for 2 nos. new 80,000 KL crude oil floating roof storage tanks at CPCL Manali complex. IS 456 & API 650 foundation requirements.",
                    "department": "CPCL Civil Engineering & Infrastructure Division",
                    "budget": 38000000.0,
                    "category": "Maintenance & AMC",
                    "eligibility_criteria": {"require_msme": False, "min_local_content": 80, "require_oem": False, "max_bid_amount": 42000000},
                    "selection_mode": "fair_draw",
                    "status": "awarded",
                    "awarded_reason": "Selected via Fair Trade Anti-Corruption Random Draw among Top 3 qualified bidders. (All scores within 5% band: Simplex 90.2, EIL Engg 88.5, HPCL-Mittal 87.0).",
                    "bidders": [
                        {"bidder_name": "Simplex Infrastructures Ltd", "pan": "AAACS4589S", "gstin": "19AAACS4589S1Z3", "bid_amount": 34000000.0, "phone": "+91 33 4000 1234", "email": "tenders@simplex.in", "address": "Kolkata, West Bengal", "msme_registered": False, "local_content_percentage": 95, "oem_authorized": False, "legacy_score": 89.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 90.2, "rank": 1},
                        {"bidder_name": "EIL Engineering & Const Ltd", "pan": "AAACE4678E", "gstin": "07AAACE4678E1Z9", "bid_amount": 35500000.0, "phone": "+91 11 2641 4545", "email": "const.bids@eil.co.in", "address": "Delhi, Delhi", "msme_registered": False, "local_content_percentage": 92, "oem_authorized": False, "legacy_score": 87.0, "blacklisted": False, "stage": "selected", "compliance_score": 95.0, "final_score": 88.5, "rank": 2},
                        {"bidder_name": "Punj Lloyd Infrastructure", "pan": "AAACP5679P", "gstin": "06AAACP5679P1Z5", "bid_amount": 33000000.0, "phone": "+91 124 4610 000", "email": "infra.bids@punjlloyd.com", "address": "Gurgaon, Haryana", "msme_registered": False, "local_content_percentage": 90, "oem_authorized": False, "legacy_score": 84.0, "blacklisted": False, "stage": "scored", "compliance_score": 100.0, "final_score": 87.0, "rank": 3},
                        {"bidder_name": "Substandard Build Contractors", "pan": "AABCS0011X", "gstin": "33AABCS0011X1ZZ", "bid_amount": 22000000.0, "phone": "+91 44 0000 3333", "email": "fake@build.com", "address": "Chennai, Tamil Nadu", "msme_registered": False, "local_content_percentage": 70, "oem_authorized": False, "legacy_score": 45.0, "blacklisted": False, "pan_status": "Invalid", "stage": "eliminated", "elimination_reason": "PAN is unverified | Local content (70%) below requirement (80%)"},
                    ]
                },
            ]

            print(f"Seeding {len(tenders_data)} tenders with bidders...")
            for t_data in tenders_data:
                # Check if this tender already exists
                existing = await session.execute(select(Tender).where(Tender.tender_number == t_data["tender_number"]))
                if existing.scalar_one_or_none():
                    continue

                tender_obj = Tender(
                    tender_number=t_data["tender_number"],
                    title=t_data["title"],
                    description=t_data["description"],
                    department=t_data["department"],
                    budget=t_data["budget"],
                    category=t_data["category"],
                    eligibility_criteria=t_data["eligibility_criteria"],
                    selection_mode=t_data["selection_mode"],
                    status=t_data["status"],
                    created_by="Ananya Rao",
                    awarded_reason=t_data.get("awarded_reason"),
                )
                session.add(tender_obj)
                await session.flush()  # Get ID

                bidders_list = t_data.get("bidders", [])
                winner_set = False
                for b_data in bidders_list:
                    stage = b_data.get("stage", "registered")
                    bidder_obj = Bidder(
                        tender_id=tender_obj.id,
                        tender_ref=tender_obj.tender_number,
                        bidder_name=b_data["bidder_name"],
                        pan=b_data["pan"],
                        gstin=b_data["gstin"],
                        bid_amount=b_data["bid_amount"],
                        phone=b_data.get("phone", ""),
                        email=b_data.get("email", ""),
                        address=b_data.get("address", ""),
                        msme_registered=b_data.get("msme_registered", False),
                        udyam_number=b_data.get("udyam_number"),
                        local_content_percentage=b_data.get("local_content_percentage", 50),
                        oem_authorized=b_data.get("oem_authorized", False),
                        legacy_score=b_data.get("legacy_score", 75.0),
                        blacklisted=b_data.get("blacklisted", False),
                        blacklist_reason=b_data.get("blacklist_reason"),
                        gst_status=b_data.get("gst_status", "Active"),
                        pan_status=b_data.get("pan_status", "Verified"),
                        epfo_compliant=True,
                        esic_compliant=True,
                        mca21_status="Active",
                        digilocker_verified=True,
                        stage=stage,
                        elimination_reason=b_data.get("elimination_reason"),
                        compliance_score=b_data.get("compliance_score", 0.0),
                        final_score=b_data.get("final_score", 0.0),
                        rank=b_data.get("rank"),
                    )
                    session.add(bidder_obj)
                    await session.flush()

                    # If this is the winner, link to tender
                    if stage == "selected" and not winner_set:
                        tender_obj.awarded_bidder_id = bidder_obj.id
                        winner_set = True

                await session.commit()

            print(f"[OK] Seeded {len(tenders_data)} tenders with all bidders.")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await init_db()
    await load_sample_data()
    yield
    # Shutdown
    pass

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for GeM Bid & Tender Compliance AI Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tenders.router)
app.include_router(bidders.router)
app.include_router(verification.router)
app.include_router(dashboard.router)
app.include_router(audit.router)

# ---------------------------------------------------------------------------
# Shortcut aliases expected by frontend
# ---------------------------------------------------------------------------

@app.get("/api/stats", tags=["Shortcuts"])
async def get_stats_alias(db: AsyncSession = Depends(get_db)) -> Dict[str, Any]:
    bidders_count = await db.scalar(select(func.count(Bidder.id))) or 0
    tenders_count = await db.scalar(select(func.count(Tender.id))) or 0
    verified = await db.scalar(
        select(func.count(Bidder.id)).where(Bidder.gst_status == "Active")
    ) or 0
    high_risk = await db.scalar(
        select(func.count(Bidder.id)).where(Bidder.blacklisted == True)
    ) or 0
    needs_review = max(0, bidders_count - verified - high_risk)
    return {
        "total_bidders": bidders_count,
        "total_tenders": tenders_count,
        "verified": verified,
        "needs_review": needs_review,
        "high_risk": high_risk,
        "flagged": high_risk,
        "pending": needs_review,
        "average_score": 84.5,
    }

@app.get("/api/audit-logs", tags=["Shortcuts"])
async def get_audit_logs_alias(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    entity_type: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
) -> List[AuditLogResponse]:
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    if entity_type:
        query = query.where(AuditLog.entity_type == entity_type)
    query = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "online",
        "version": "2.0.0",
        "docs_url": "/docs"
    }

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
