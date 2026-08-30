import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  FileText, 
  Award, 
  ExternalLink, 
  RefreshCw, 
  Upload, 
  BadgeCheck,
  AlertCircle,
  FileCheck
} from 'lucide-react';

const VendorProfile = () => {
  const [verifying, setVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState('Just now');

  const companyData = {
    name: 'Southern Industrial Valves & Controls Pvt Ltd',
    type: 'Private Limited (MSME Micro Enterprise)',
    cin: 'L11101TN1965GOI005389',
    pan: 'AAACB1234F',
    gstin: '33AAAAA0000A1Z5',
    udyam: 'UDYAM-TN-02-0012345',
    epfo: 'TN/MAS/0012345/000',
    esic: '31000123450000101',
    address: 'Plot 42, Industrial Estate, Guindy, Chennai - 600032',
    solvencyBank: 'Indian Bank, Main Branch Chennai',
    solvencyAmount: '₹1.50 Crores',
    solvencyValidTill: '31 Dec 2026'
  };

  const handleReverify = () => {
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setLastVerified('Just now');
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border border-amber-900/60 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-widest mb-2">
            <Building2 className="w-4 h-4" />
            <span>Supplier Identity & Compliance Vault</span>
          </div>
          <h1 className="text-3xl font-black text-white">{companyData.name}</h1>
          <p className="text-amber-200/80 text-sm mt-1">{companyData.type} • CPCL Registered Vendor ID: <span className="font-mono text-white font-bold">VEND-CPCL-9921</span></p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={handleReverify}
            disabled={verifying}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Re-verifying APIs...' : 'Re-verify API Status'}</span>
          </button>

          <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-black px-4 py-2.5 rounded-xl flex items-center space-x-1.5">
            <BadgeCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Verified Vendor</span>
          </span>
        </div>
      </div>

      {/* Live Government API Verification Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <span>Government Portal Live API Status</span>
          </h3>
          <span className="text-xs text-slate-500">Last Synced: {lastVerified}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* GSTN */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">GSTN Portal</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>ACTIVE</span>
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500">GSTIN Number</div>
              <div className="font-mono font-black text-slate-900 text-sm mt-0.5">{companyData.gstin}</div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>3B Return Filing:</span>
              <span className="font-bold text-emerald-700">Up to Date ✅</span>
            </div>
          </div>

          {/* MCA21 */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">MCA21 Registry</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>COMPLIANT</span>
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500">CIN Number</div>
              <div className="font-mono font-black text-slate-900 text-xs mt-0.5 truncate">{companyData.cin}</div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Company Status:</span>
              <span className="font-bold text-emerald-700">Active / No Charges</span>
            </div>
          </div>

          {/* MSME Udyam */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">MSME Udyam</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                <BadgeCheck className="w-3 h-3 text-amber-600" />
                <span>MICRO CERTIFIED</span>
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500">Udyam Registration</div>
              <div className="font-mono font-black text-slate-900 text-xs mt-0.5">{companyData.udyam}</div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>EMD Exemption:</span>
              <span className="font-bold text-amber-700">Eligible (100% Waiver)</span>
            </div>
          </div>

          {/* EPFO & ESIC */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-amber-400 transition-all space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">EPFO / ESIC</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>VERIFIED</span>
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-500">EPFO Code</div>
              <div className="font-mono font-black text-slate-900 text-xs mt-0.5">{companyData.epfo}</div>
            </div>
            <div className="text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
              <span>Labor Compliance:</span>
              <span className="font-bold text-emerald-700">Zero Defaults</span>
            </div>
          </div>

        </div>
      </div>

      {/* Financial Solvency & Document Vault */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Solvency Details */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
              <FileCheck className="w-5 h-5 text-amber-600" />
              <span>Bank Solvency Certificate</span>
            </h3>
            <span className="text-xs bg-slate-100 font-bold text-slate-600 px-3 py-1 rounded-full">
              Valid Document
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Issuing Bank:</span>
              <span className="font-extrabold text-slate-900">{companyData.solvencyBank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Certified Solvency Value:</span>
              <span className="font-extrabold text-amber-600 text-sm">{companyData.solvencyAmount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Validity Period:</span>
              <span className="font-bold text-slate-800">{companyData.solvencyValidTill}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-slate-500">Document File: <code className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono">IndianBank_Solvency_2026.pdf</code></span>
            <button className="text-amber-600 hover:text-amber-700 font-bold flex items-center space-x-1">
              <Upload className="w-3.5 h-3.5" />
              <span>Update Certificate</span>
            </button>
          </div>
        </div>

        {/* Company Registered Address & Contact */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-black text-slate-900 text-base flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-amber-600" />
            <span>Registered Address & Contact</span>
          </h3>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Official Address:</span>
              <span className="font-bold text-slate-900 leading-relaxed">{companyData.address}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500">Authorized Signatory:</span>
              <span className="font-extrabold text-slate-900">R. Rajesh (Managing Director)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Official Email:</span>
              <span className="font-bold text-slate-800">vendor@company.com</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default VendorProfile;
