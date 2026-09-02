import React from 'react';
import { 
  Award, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Truck, 
  DollarSign, 
  BadgeCheck,
  Building2,
  ChevronRight
} from 'lucide-react';

const VendorContracts = () => {
  const contracts = [
    {
      id: 'PO-2025-CPCL-8821',
      tenderCode: 'TENDER-2025-CPCL-089',
      title: 'Supply of High-Pressure Safety Relief Valves – CDU Section',
      department: 'CPCL Chennai Refinery Unit 2 – Safety',
      value: '₹42.0 Lakhs',
      awardedDate: '15 March 2025',
      deliveryDeadline: '30 September 2025',
      status: 'In Progress (75% Delivered)',
      milestones: [
        { title: 'Technical Drawing & IBR Approval', done: true },
        { title: 'Factory Acceptance Test (FAT) – Batch 1', done: true },
        { title: 'Delivery & Incoming Inspection – Batch 1 (24 units)', done: true },
        { title: 'Delivery & Incoming Inspection – Batch 2 (24 units)', done: false },
        { title: 'Final Installation & Hydrotest Commissioning', done: false },
      ]
    },
    {
      id: 'PO-2024-CPCL-7712',
      tenderCode: 'TENDER-2024-CPCL-058',
      title: 'Annual Maintenance Contract – Instrumentation Systems 2024-25',
      department: 'CPCL Manali Complex – Instrumentation',
      value: '₹26.0 Lakhs',
      awardedDate: '20 August 2024',
      deliveryDeadline: '19 August 2025',
      status: 'Successfully Completed',
      milestones: [
        { title: 'Contract Execution & Security Deposit', done: true },
        { title: 'Q1 Preventive Maintenance & Calibration', done: true },
        { title: 'Q2 Preventive Maintenance & SIS Testing', done: true },
        { title: 'Annual IBR & Safety Instrument Audit', done: true },
        { title: 'Final Closeout & Performance Certificate', done: true },
      ]
    },
    {
      id: 'PO-2025-CPCL-9934',
      tenderCode: 'TENDER-2025-CPCL-071',
      title: 'Procurement of Heat Exchangers & Cooling Systems – VDU Section',
      department: 'CPCL Chennai Refinery Unit 1 – Process',
      value: '₹1.08 Crores',
      awardedDate: '10 November 2024',
      deliveryDeadline: '31 March 2025',
      status: 'Successfully Completed',
      milestones: [
        { title: 'Engineering & Detailed Design Approval (ASME VIII)', done: true },
        { title: 'Material Procurement & Third-Party Inspection', done: true },
        { title: 'Shell & Tube Fabrication – Stage 1 (4 units)', done: true },
        { title: 'Air Cooled HX Fabrication & FAT (4 units)', done: true },
        { title: 'Delivery, Site Erection & Pre-commissioning', done: true },
      ]
    },
    {
      id: 'PO-2025-CPCL-0452',
      tenderCode: 'TENDER-2025-CPCL-101',
      title: 'Procurement & Commissioning of Fired Heater – Crude Preheat Train',
      department: 'CPCL Fired Equipment & Furnace Division',
      value: '₹4.80 Crores',
      awardedDate: '05 January 2025',
      deliveryDeadline: '15 December 2025',
      status: 'In Progress (55% Complete)',
      milestones: [
        { title: 'Engineering & Licensing – API 560 Compliance', done: true },
        { title: 'Refractory & Structural Steel Fabrication', done: true },
        { title: 'Coil Fabrication & Pressure Testing', done: true },
        { title: 'Shop Erection & Acceptance Test', done: false },
        { title: 'Site Delivery, Erection & Commissioning', done: false },
        { title: 'Performance Test & Handover', done: false },
      ]
    },
    {
      id: 'PO-2025-CPCL-6631',
      tenderCode: 'TENDER-2025-CPCL-115',
      title: 'Water Treatment Chemical Supply – Cooling Tower & Boiler Feed',
      department: 'CPCL Utilities & Water Management Division',
      value: '₹28.5 Lakhs',
      awardedDate: '01 June 2025',
      deliveryDeadline: '31 May 2026',
      status: 'Active Rate Contract (Annual)',
      milestones: [
        { title: 'Contract Signing & First Delivery (3-Month Stock)', done: true },
        { title: 'Q1 Consumption Review & Replenishment', done: true },
        { title: 'Q2 Water Quality Audit & Chemical Dosing Review', done: false },
        { title: 'Q3 Annual Consumption Report', done: false },
      ]
    },
    {
      id: 'PO-2024-CPCL-3388',
      tenderCode: 'TENDER-2024-CPCL-137',
      title: 'Civil & Structural Works – New Crude Storage Tank Foundation',
      department: 'CPCL Civil Engineering & Infrastructure Division',
      value: '₹3.55 Crores',
      awardedDate: '15 December 2024',
      deliveryDeadline: '30 June 2026',
      status: 'In Progress (30% Complete)',
      milestones: [
        { title: 'Soil Investigation & Design Finalisation', done: true },
        { title: 'Piling Work – Zone A (Tank 1 Foundation)', done: true },
        { title: 'Piling Work – Zone B (Tank 2 Foundation)', done: false },
        { title: 'RCC Raft & Annular Ring Construction', done: false },
        { title: 'Dyke Wall Construction & Waterproofing', done: false },
        { title: 'API 650 Foundation Acceptance Test & Handover', done: false },
      ]
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-900/60 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
            <Award className="w-4 h-4" />
            <span>Awarded Procurement Orders</span>
          </div>
          <h1 className="text-3xl font-black text-white">Awarded Contracts & Purchase Orders</h1>
          <p className="text-amber-200/80 text-sm mt-1">Track contract execution, delivery milestones, and payment disbursements.</p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-white/10 border border-white/15 px-4 py-3 rounded-2xl text-right">
            <span className="text-slate-400 text-[11px] block font-medium">Total Contracted Value:</span>
            <span className="text-amber-400 font-black text-xl">₹71.0 Lakhs</span>
          </div>
        </div>
      </div>

      {/* Contract Cards */}
      <div className="space-y-6">
        {contracts.map((contract) => (
          <div key={contract.id} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 hover:border-amber-400 transition-all">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-slate-900 text-amber-400 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                    {contract.id}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Tender: {contract.tenderCode}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">{contract.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{contract.department}</p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <span className="text-slate-400 text-xs block">Order Value</span>
                  <span className="text-amber-600 font-black text-lg">{contract.value}</span>
                </div>
                <span className={`text-xs font-black px-3.5 py-1.5 rounded-full border ${
                  contract.status.includes('Completed')
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border-amber-300'
                }`}>
                  {contract.status}
                </span>
              </div>
            </div>

            {/* Milestones Tracker */}
            <div>
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Delivery & Execution Milestones</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {contract.milestones.map((m, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl border text-xs space-y-1.5 ${
                      m.done
                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <span>Step {idx + 1}</span>
                      {m.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                    <p className="font-semibold leading-tight">{m.title}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default VendorContracts;
