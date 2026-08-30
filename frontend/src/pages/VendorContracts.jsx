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
      tenderCode: 'PAST-2025-CPCL-089',
      title: 'Supply of High-Pressure Safety Relief Valves',
      department: 'CPCL Chennai Refinery Unit 2',
      value: '₹42.3 Lakhs',
      awardedDate: '15 March 2025',
      deliveryDeadline: '30 November 2025',
      status: 'In Progress (80% Delivered)',
      milestones: [
        { title: 'Technical Specification Approval', done: true },
        { title: 'Factory Acceptance Test (FAT)', done: true },
        { title: 'Batch 1 Shipment & Inspection', done: true },
        { title: 'Final Installation & Commissioning', done: false }
      ]
    },
    {
      id: 'PO-2024-CPCL-7712',
      tenderCode: 'PAST-2024-CPCL-058',
      title: 'Annual Maintenance Contract for Instrumentation Systems',
      department: 'CPCL Manali Complex',
      value: '₹28.7 Lakhs',
      awardedDate: '20 August 2024',
      deliveryDeadline: '19 August 2025',
      status: 'Successfully Completed',
      milestones: [
        { title: 'Contract Execution & Security Deposit', done: true },
        { title: 'Q1 Maintenance Service Audit', done: true },
        { title: 'Q2 Maintenance Service Audit', done: true },
        { title: 'Final Contract Closure & Release', done: true }
      ]
    }
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
