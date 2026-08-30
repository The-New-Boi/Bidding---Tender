import React, { useState } from 'react';
import { 
  Wallet, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Download, 
  FileText, 
  Plus, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';

const VendorEmd = () => {
  const [activeTab, setActiveTab] = useState('exemption');

  const emdRecords = [
    {
      id: 'EMD-REF-9921',
      tenderCode: 'TENDER-2026-CPCL-001',
      tenderTitle: 'Procurement of Refinery Instrumentation Valves',
      requiredEmd: '₹1,10,000',
      status: 'EMD Exempted (MSME)',
      waivedAmount: '₹1,10,000',
      proofDoc: 'MSME_Udyam_Exemption_Claim.pdf',
      date: '28 Aug 2026'
    },
    {
      id: 'EMD-REF-8841',
      tenderCode: 'TENDER-2025-CPCL-089',
      tenderTitle: 'Supply of High-Pressure Safety Relief Valves',
      requiredEmd: '₹85,000',
      status: 'BG Deposited & Released',
      waivedAmount: '₹85,000',
      proofDoc: 'SBI_BankGuarantee_Released.pdf',
      date: '14 Mar 2025'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950 to-slate-900 border border-amber-900/60 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
            <Wallet className="w-4 h-4" />
            <span>Financial Guarantees & EMD Management</span>
          </div>
          <h1 className="text-3xl font-black text-white">EMD & Solvency Vault</h1>
          <p className="text-slate-400 text-sm mt-1">Manage Earnest Money Deposits (EMD), MSME Fee Waivers & Bank Guarantee Releases.</p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="bg-white/10 border border-white/15 px-4 py-3 rounded-2xl text-right">
            <span className="text-slate-400 text-[11px] block font-medium">Total EMD Savings / Waived:</span>
            <span className="text-amber-400 font-black text-xl">₹1,95,000</span>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab('exemption')}
            className={`pb-4 text-sm font-extrabold transition-all relative ${
              activeTab === 'exemption' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            MSME EMD Exemption Records
          </button>
          <button
            onClick={() => setActiveTab('bg')}
            className={`pb-4 text-sm font-extrabold transition-all relative ${
              activeTab === 'bg' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Bank Guarantee Vault
          </button>
        </div>

        {/* EMD Exemption Ledger */}
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-900 text-xs flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-950">Micro & Small Enterprise (MSME) EMD Waiver active</p>
              <p className="text-amber-800 mt-0.5">Under Public Procurement Policy for MSEs Order 2012, your MSME Udyam registration (<code className="font-mono bg-amber-100 text-amber-900 px-1 py-0.5 rounded">UDYAM-TN-02-0012345</code>) grants 100% EMD fee exemption across all CPCL tenders.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                  <th className="p-3.5">Ref ID</th>
                  <th className="p-3.5">Tender Code & Title</th>
                  <th className="p-3.5">Standard EMD</th>
                  <th className="p-3.5">Waiver Status</th>
                  <th className="p-3.5">Proof Document</th>
                  <th className="p-3.5 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {emdRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{rec.id}</td>
                    <td className="p-3.5">
                      <div className="font-bold text-slate-900">{rec.tenderTitle}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{rec.tenderCode}</div>
                    </td>
                    <td className="p-3.5 font-extrabold text-slate-700">{rec.requiredEmd}</td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center space-x-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>{rec.status}</span>
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-amber-700 font-semibold">{rec.proofDoc}</td>
                    <td className="p-3.5 text-right font-medium text-slate-500">{rec.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VendorEmd;
