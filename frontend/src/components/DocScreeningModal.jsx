import React, { useState } from 'react';
import { FileText, CheckCircle2, ShieldCheck, X, Cpu, Search, AlertCircle, ExternalLink } from 'lucide-react';

const DocScreeningModal = ({ bidder, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);

  const handleRunOcr = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanned(true);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-6 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center space-x-2">
                <span>AI OCR Document Screening Desk</span>
                <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  CPCL Vision AI
                </span>
              </h3>
              <p className="text-xs text-slate-500">Company: <strong className="text-slate-900">{bidder?.bidder_name}</strong> (PAN: {bidder?.pan})</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* OCR Action Trigger Bar */}
        <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <ShieldCheck className="w-6 h-6 text-purple-700" />
            <div className="text-xs">
              <div className="font-extrabold text-purple-950">Automated Legal & Financial Document Audit</div>
              <div className="text-purple-700 text-[11px]">Validates attached PDFs against Govt GSTN, MCA21, and Udyam Portals</div>
            </div>
          </div>

          <button
            onClick={handleRunOcr}
            disabled={scanning}
            className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow shadow-purple-600/30 transition-all flex items-center space-x-1.5 whitespace-nowrap disabled:opacity-50"
          >
            <Cpu className="w-4 h-4" />
            <span>{scanning ? 'Scanning OCR...' : scanned ? 'Re-Run AI OCR' : '⚡ Execute AI OCR Screening'}</span>
          </button>
        </div>

        {/* SCANNING ANIMATION INDICATOR */}
        {scanning && (
          <div className="p-6 bg-slate-900 text-white rounded-2xl text-center space-y-3 animate-pulse border border-purple-500/40">
            <div className="text-3xl animate-spin">⚙️</div>
            <div className="font-bold text-amber-400 text-sm">AI OCR Neural Vision Engine Active</div>
            <p className="text-xs text-slate-400">Extracting text from 4 attached PDF certificates, cross-verifying GSTIN & turnover...</p>
          </div>
        )}

        {/* ATTACHED DOCUMENTS LIST & VERIFICATION STATUS */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Submitted Tender Documents</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* DOC 1: GST RETURN */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>GST Return 3B Certificate</span>
                </span>
                {scanned ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Verified Active</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Unchecked</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">GSTIN: {bidder?.gstin || '33AAACK1234F1Z5'}</div>
              {scanned && (
                <div className="text-[10px] bg-white p-2 rounded-xl border text-slate-700 space-y-0.5">
                  <div>• Filing Status: <strong>Up to Date (July 2026)</strong></div>
                  <div>• Tax Compliance Score: <strong>98/100</strong></div>
                </div>
              )}
            </div>

            {/* DOC 2: UDYAM MSME */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Udyam MSME Certificate</span>
                </span>
                {scanned ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Micro Industry</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Unchecked</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">UDYAM-TN-02-0012345</div>
              {scanned && (
                <div className="text-[10px] bg-white p-2 rounded-xl border text-slate-700 space-y-0.5">
                  <div>• Enterprise Type: <strong>Small Manufacturing</strong></div>
                  <div>• EMD Fee Exemption: <strong>Eligible ✓</strong></div>
                </div>
              )}
            </div>

            {/* DOC 3: FINANCIAL BALANCE SHEET */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Audited Balance Sheet 2025-26</span>
                </span>
                {scanned ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Turnover Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Unchecked</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">CA Certified Seal #2026/8941</div>
              {scanned && (
                <div className="text-[10px] bg-white p-2 rounded-xl border text-slate-700 space-y-0.5">
                  <div>• 3-Yr Avg Turnover: <strong>₹14.2 Crores</strong></div>
                  <div>• Min Threshold Required: <strong>₹2.0 Crores (Met ✓)</strong></div>
                </div>
              )}
            </div>

            {/* DOC 4: OEM AUTHORIZATION */}
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between font-bold text-slate-900">
                <span className="flex items-center space-x-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>OEM Authorization Letter</span>
                </span>
                {scanned ? (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Valid OEM License</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded font-bold">Unchecked</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">Issuer: Instrumentation Corp Ltd</div>
              {scanned && (
                <div className="text-[10px] bg-white p-2 rounded-xl border text-slate-700 space-y-0.5">
                  <div>• Authorized Territory: <strong>India Refinery Division</strong></div>
                  <div>• License Validity: <strong>Dec 2027</strong></div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 text-white font-extrabold rounded-xl text-xs hover:bg-slate-800 transition-all"
          >
            Close Screening Desk
          </button>
        </div>

      </div>
    </div>
  );
};

export default DocScreeningModal;
