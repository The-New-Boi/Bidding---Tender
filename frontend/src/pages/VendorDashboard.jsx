import React, { useState } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  BadgeCheck, 
  Download, 
  Eye, 
  ChevronRight, 
  Building2, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const VendorDashboard = ({ user, setCurrentTab, onSelectTender }) => {
  const [selectedApp, setSelectedApp] = useState(null);

  const applications = [
    {
      id: 'BID-2026-CPCL-9921',
      tenderId: 1,
      tenderCode: 'TENDER-2026-CPCL-001',
      title: 'Procurement of Refinery Instrumentation Valves & Flow Controllers',
      dept: 'CPCL Refinery Instrumentation Division',
      submittedDate: '28 Aug 2026',
      bidAmount: '₹52,40,000 (L1 Bidder)',
      status: 'Technical Evaluation Passed',
      statusStep: 3, // 1: Submitted, 2: Doc Screening, 3: Technical Passed, 4: Financial Unsealed, 5: Awarded
      docsVerified: ['GSTN Active', 'MCA21 Valid', 'MSME Udyam Exempt', 'EPFO Clear'],
      score: '96/100 (Technical Rank #1)'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-900/60 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
            <FileText className="w-4 h-4" />
            <span>Vendor Bid Tracking Dashboard</span>
          </div>
          <h1 className="text-3xl font-black text-white">My Tender Applications</h1>
          <p className="text-amber-200/80 text-sm mt-1">Track real-time evaluation status, download sealed bid receipts, and check compliance scorecards.</p>
        </div>

        <button
          onClick={() => setCurrentTab('Marketplace')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs shadow-lg shadow-amber-500/20 transition-all shrink-0 flex items-center space-x-2"
        >
          <span>Browse More Tenders</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        <h3 className="text-lg font-black text-slate-900">Active Submitted Bids ({applications.length})</h3>

        {applications.map((app) => (
          <div key={app.id} className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 hover:border-amber-400 transition-all">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span className="bg-slate-900 text-amber-400 text-xs font-mono font-bold px-3 py-1 rounded-lg">
                    {app.id}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{app.tenderCode}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900">{app.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{app.dept}</p>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => onSelectTender(app.tenderId)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5"
                >
                  <Eye className="w-4 h-4 text-slate-600" />
                  <span>View Tender Notice</span>
                </button>
              </div>
            </div>

            {/* Stepper Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 mb-2">
                <span>Evaluation Lifecycle Status:</span>
                <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-black">
                  🟢 {app.status} ({app.score})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                {[
                  { step: 1, title: 'Bid Submitted', date: app.submittedDate },
                  { step: 2, title: 'Doc Screening', date: 'Passed (AI)' },
                  { step: 3, title: 'Technical Eval', date: 'Passed (Rank #1)' },
                  { step: 4, title: 'Financial Opening', date: 'Pending Unseal' },
                  { step: 5, title: 'Award PO', date: 'Scheduled' }
                ].map((s) => (
                  <div
                    key={s.step}
                    className={`p-3 rounded-2xl border text-xs space-y-1 ${
                      app.statusStep >= s.step
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span>Step {s.step}</span>
                      {app.statusStep >= s.step ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-slate-300" />
                      )}
                    </div>
                    <div className="font-extrabold truncate">{s.title}</div>
                    <div className="text-[10px] opacity-75 font-mono">{s.date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Compliance Verified Badges */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-slate-700">Verified API Compliance Checklist:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {app.docsVerified.map(doc => (
                  <span key={doc} className="bg-white border border-emerald-300 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{doc}</span>
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default VendorDashboard;
