import os
import json
import random
import csv
from datetime import datetime, timedelta
import uuid

try:
    from faker import Faker
except ImportError:
    print("Please install faker: pip install faker")
    exit(1)

fake = Faker('en_IN')

# Setup paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MOCK_DB_DIR = os.path.join(BASE_DIR, 'mock_databases')
os.makedirs(MOCK_DB_DIR, exist_ok=True)
CSV_FILE = os.path.join(BASE_DIR, 'bidders_data.csv')

NUM_RECORDS = 200

def generate_pan(is_company=True):
    status_char = 'C' if is_company else random.choice(['P', 'H', 'F', 'A', 'T', 'B', 'L', 'J', 'G'])
    return f"{''.join(random.choices('ABCDEFGHIJKLMNOPQRSTUVWXYZ', k=3))}{status_char}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}{random.randint(1000, 9999):04d}{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ')}"

def generate_gstin(pan, state_code):
    return f"{state_code:02d}{pan}1Z{random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')}"

def generate_date(days_back=1000, days_forward=0):
    start_date = datetime.now() - timedelta(days=days_back)
    end_date = datetime.now() + timedelta(days=days_forward)
    random_days = random.randint(0, (end_date - start_date).days)
    return (start_date + timedelta(days=random_days)).strftime('%Y-%m-%d')

def main():
    print("Generating bidder data and mock databases...")
    bidders = []
    
    # Track anomalies
    anomalies = {
        "pan_gstin_mismatch": 0,
        "blacklisted_bidding": 0,
        "gst_cancelled_suspended": 0,
        "pan_invalid": 0,
        "msme_no_udyam": 0,
        "pan_name_mismatch": 0,
        "old_gst_filed": 0,
        "mca_struck_off": 0
    }

    # Generate basic valid records
    for i in range(NUM_RECORDS):
        bidder_name = fake.company()
        state_code = random.randint(1, 37)
        pan = generate_pan(is_company=True)
        gstin = generate_gstin(pan, state_code)
        is_msme = random.choice(['Yes', 'No'])
        is_startup = random.choice(['Yes', 'No']) if is_msme == 'No' else 'No'
        is_blacklisted = 'Yes' if random.random() < 0.05 else 'No'
        
        record = {
            'tender_id': f"GEM/2026/{random.randint(1000000, 9999999)}",
            'bidder_name': bidder_name,
            'PAN': pan,
            'GSTIN': gstin,
            'bid_amount': random.randint(50000, 5000000) * 10,
            'phone': f"{random.randint(6, 9)}{random.randint(100000000, 999999999)}",
            'address': fake.address().replace('\n', ', '),
            'email': fake.company_email(),
            'msme_registered': is_msme,
            'udyam_number': f"UDYAM-{random.choice(['MH', 'DL', 'KA', 'UP', 'GJ'])}-{random.randint(10,99)}-{random.randint(1000000,9999999)}" if is_msme == 'Yes' else '',
            'gst_status': 'Active',
            'gst_last_filed': generate_date(days_back=60), # Recent
            'pan_status': 'Valid',
            'pan_name': bidder_name,
            'startup_india': is_startup,
            'dpiit_number': f"DIPP/{random.randint(10000, 99999)}" if is_startup == 'Yes' else '',
            'nsic_registered': random.choice(['Yes', 'No']),
            'nsic_number': f"NSIC/{random.randint(10000, 99999)}" if random.choice([True, False]) else '',
            'epfo_compliant': random.choice(['Yes', 'No']),
            'epfo_establishment_code': f"{random.choice(['MH', 'DL', 'KA'])}{random.choice(['BOM', 'DEL', 'BAN'])}{random.randint(1000000, 9999999)}000" if random.choice([True, False]) else '',
            'esic_compliant': random.choice(['Yes', 'No']),
            'make_in_india': random.choice(['Yes', 'No']),
            'local_content_percentage': random.randint(20, 100),
            'oem_authorized': random.choice(['Yes', 'No']),
            'mca21_cin': f"U{random.randint(10000, 99999)}{random.choice(['MH', 'DL', 'KA'])}{random.randint(2000, 2025)}PTC{random.randint(100000, 999999)}",
            'mca21_status': 'Active',
            'digilocker_verified': random.choice(['Yes', 'No']),
            'blacklisted': is_blacklisted,
            'blacklist_reason': random.choice(['Fraud', 'Non-performance', 'Debarment order']) if is_blacklisted == 'Yes' else '',
            'blacklist_date': generate_date(days_back=365) if is_blacklisted == 'Yes' else ''
        }
        bidders.append(record)

    # Introduce deliberate anomalies
    # PAN in GSTIN doesn't match bidder PAN (~10 records)
    for i in range(10):
        bidders[i]['GSTIN'] = generate_gstin(generate_pan(), random.randint(1, 37))
        anomalies['pan_gstin_mismatch'] += 1

    # Blacklisted but still bidding (~10 records)
    for i in range(10, 20):
        bidders[i]['blacklisted'] = 'Yes'
        bidders[i]['blacklist_reason'] = 'Non-performance'
        bidders[i]['blacklist_date'] = generate_date(days_back=730)
        anomalies['blacklisted_bidding'] += 1

    # GST cancelled/suspended (~40 records, 20%)
    for i in range(20, 60):
        bidders[i]['gst_status'] = random.choice(['Cancelled', 'Suspended'])
        anomalies['gst_cancelled_suspended'] += 1

    # PAN Invalid (~30 records, 15%)
    for i in range(60, 90):
        bidders[i]['pan_status'] = 'Invalid'
        anomalies['pan_invalid'] += 1

    # MSME claimed but no Udyam number (~5 records)
    for i in range(90, 95):
        bidders[i]['msme_registered'] = 'Yes'
        bidders[i]['udyam_number'] = ''
        anomalies['msme_no_udyam'] += 1
        
    # pan_name mismatch with bidder_name (~10 records)
    for i in range(95, 105):
        bidders[i]['pan_name'] = fake.company()
        anomalies['pan_name_mismatch'] += 1

    # Very old gst_last_filed dates (>6 months ago) (~15 records)
    for i in range(105, 120):
        bidders[i]['gst_last_filed'] = generate_date(days_back=1000, days_forward=-180)
        anomalies['old_gst_filed'] += 1

    # MCA21 status 'Struck Off' but still bidding (~5 records)
    for i in range(120, 125):
        bidders[i]['mca21_status'] = 'Struck Off'
        anomalies['mca_struck_off'] += 1

    random.shuffle(bidders)

    # Write bidders data to CSV
    if bidders:
        with open(CSV_FILE, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=bidders[0].keys())
            writer.writeheader()
            writer.writerows(bidders)
        print(f"Written {len(bidders)} records to {CSV_FILE}")

    # Generate mock databases
    # 1. Udyam Registry
    udyam_db = []
    for b in bidders:
        if b['msme_registered'] == 'Yes' and b['udyam_number'] and random.random() < 0.8: # 80% found
            status = 'Active' if random.random() < 0.9 else random.choice(['Expired', 'Cancelled'])
            valid_until = generate_date(days_back=-365, days_forward=365) if status == 'Active' else generate_date(days_back=365)
            udyam_db.append({
                'udyam_number': b['udyam_number'],
                'company_name': b['bidder_name'] if random.random() < 0.9 else fake.company(),
                'category': random.choice(['Micro', 'Small', 'Medium']),
                'state': fake.state(),
                'registration_date': generate_date(days_back=1000),
                'valid_until': valid_until,
                'pan': b['PAN'],
                'status': status
            })
    with open(os.path.join(MOCK_DB_DIR, 'udyam_registry.json'), 'w') as f:
        json.dump(udyam_db, f, indent=2)

    # 2. GST Registry
    gst_db = []
    for b in bidders:
        gst_db.append({
            'gstin': b['GSTIN'],
            'legal_name': b['bidder_name'],
            'trade_name': b['bidder_name'],
            'registration_date': generate_date(days_back=2000),
            'status': b['gst_status'],
            'last_return_filed': b['gst_last_filed'],
            'state_code': b['GSTIN'][:2],
            'pan_in_gstin': b['GSTIN'][2:12],
            'gst_type': 'Regular'
        })
    with open(os.path.join(MOCK_DB_DIR, 'gst_registry.json'), 'w') as f:
        json.dump(gst_db, f, indent=2)

    # 3. PAN Registry
    pan_db = []
    for b in bidders:
        pan_db.append({
            'pan': b['PAN'],
            'name': b['pan_name'],
            'status': b['pan_status'],
            'category': 'Company' if b['PAN'][3] == 'C' else 'Firm',
            'aadhaar_linked': random.choice([True, False])
        })
    with open(os.path.join(MOCK_DB_DIR, 'pan_registry.json'), 'w') as f:
        json.dump(pan_db, f, indent=2)

    # 4. EPFO Registry
    epfo_db = []
    for b in bidders:
        if b['epfo_establishment_code']:
            epfo_db.append({
                'establishment_code': b['epfo_establishment_code'],
                'company_name': b['bidder_name'],
                'state': fake.state(),
                'employee_count': random.randint(10, 500),
                'compliance_status': 'Compliant' if b['epfo_compliant'] == 'Yes' else random.choice(['Non-Compliant', 'Defaulter']),
                'last_challan_date': generate_date(days_back=60) if b['epfo_compliant'] == 'Yes' else generate_date(days_back=365)
            })
    with open(os.path.join(MOCK_DB_DIR, 'epfo_registry.json'), 'w') as f:
        json.dump(epfo_db, f, indent=2)

    # 5. ESIC Registry
    esic_db = []
    for b in bidders:
        if b['esic_compliant'] == 'Yes':
            esic_db.append({
                'registration_number': f"{random.randint(10,99)}00{random.randint(100000,999999)}000{random.randint(100,999)}",
                'company_name': b['bidder_name'],
                'state': fake.state(),
                'compliance_status': 'Active',
                'contribution_status': 'Regular'
            })
    with open(os.path.join(MOCK_DB_DIR, 'esic_registry.json'), 'w') as f:
        json.dump(esic_db, f, indent=2)

    # 6. MCA21 Registry
    mca21_db = []
    for b in bidders:
        mca21_db.append({
            'cin': b['mca21_cin'],
            'company_name': b['bidder_name'],
            'registration_date': generate_date(days_back=3000),
            'status': b['mca21_status'],
            'authorized_capital': random.randint(100000, 5000000),
            'paid_up_capital': random.randint(100000, 5000000),
            'directors': [fake.name(), fake.name()]
        })
    with open(os.path.join(MOCK_DB_DIR, 'mca21_registry.json'), 'w') as f:
        json.dump(mca21_db, f, indent=2)

    # 7. Startup India Registry
    startup_db = []
    for b in bidders:
        if b['dpiit_number']:
            startup_db.append({
                'dpiit_number': b['dpiit_number'],
                'company_name': b['bidder_name'],
                'recognition_date': generate_date(days_back=1000),
                'valid_until': generate_date(days_back=-1000, days_forward=3000),
                'sector': random.choice(['IT Services', 'Manufacturing', 'Healthcare', 'EdTech']),
                'pan': b['PAN'],
                'status': 'Active'
            })
    with open(os.path.join(MOCK_DB_DIR, 'startup_india_registry.json'), 'w') as f:
        json.dump(startup_db, f, indent=2)

    # 8. NSIC Registry
    nsic_db = []
    for b in bidders:
        if b['nsic_number']:
            nsic_db.append({
                'nsic_number': b['nsic_number'],
                'company_name': b['bidder_name'],
                'registration_date': generate_date(days_back=1000),
                'valid_until': generate_date(days_back=-100, days_forward=1000),
                'category': random.choice(['Micro', 'Small']),
                'status': 'Active'
            })
    with open(os.path.join(MOCK_DB_DIR, 'nsic_registry.json'), 'w') as f:
        json.dump(nsic_db, f, indent=2)

    # 9. Blacklist Registry
    blacklist_db = []
    for b in bidders:
        if b['blacklisted'] == 'Yes':
            blacklist_db.append({
                'company_name': b['bidder_name'],
                'pan': b['PAN'],
                'gstin': b['GSTIN'],
                'reason': b['blacklist_reason'],
                'debarment_date': b['blacklist_date'],
                'debarment_until': generate_date(days_back=-100, days_forward=1000),
                'ordering_authority': random.choice(['Ministry of Defence', 'Railways', 'CPWD']),
                'order_number': f"ORD/{random.randint(1000,9999)}"
            })
    with open(os.path.join(MOCK_DB_DIR, 'blacklist_registry.json'), 'w') as f:
        json.dump(blacklist_db, f, indent=2)

    # 10. DigiLocker Registry
    digilocker_db = []
    for b in bidders:
        if b['digilocker_verified'] == 'Yes':
            digilocker_db.append({
                'pan': b['PAN'],
                'aadhaar_linked': random.choice([True, False]),
                'documents_available': random.sample(['PAN Card', 'Driving License', 'Aadhaar', 'Income Tax Return'], k=random.randint(1, 4)),
                'verified_status': 'Verified'
            })
    with open(os.path.join(MOCK_DB_DIR, 'digilocker_registry.json'), 'w') as f:
        json.dump(digilocker_db, f, indent=2)

    print("\n--- Summary of Generated Data ---")
    print(f"Total bidders generated: {len(bidders)}")
    print("Anomalies Introduced:")
    for k, v in anomalies.items():
        print(f"  - {k}: {v} records")
    print("\nMock databases generated in:", MOCK_DB_DIR)

if __name__ == '__main__':
    main()
