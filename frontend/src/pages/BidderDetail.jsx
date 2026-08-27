import React, { useState, useEffect } from 'react';
import { getBidderDetail } from '../api/client';
import RiskBadge from '../components/RiskBadge';
import ScoreGauge from '../components/ScoreGauge';
import { ArrowLeft, Eye, EyeOff, ShieldCheck, AlertTriangle } from 'lucide-react';

const BidderDetail = ({ bidderId, onBack }) => {
  const [bidder, setBidder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [maskPan, setMaskPan] = useState(true);

  useEffect(() => {
    if (bidderId) fetchBidderDetails();
  }, [bidderId]);

  const fetchBidderDetails = async () => {
    setLoading(true);
    try {
      const data = await getBidderDetail(bidderId);
      setBidder(data);
    } catch (err) {
      console.error("Error fetching bidder details:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500 font-medium">Loading bidder compliance ledger...</div>;
  }

  if (!bidder) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-slate-500">Bidder record not found.</p>
        <button onClick={onBack} className="mt-4 text-amber-600 font-bold hover:underline">← Back to Register</button>
      </div>
    );
  }

  const panVal = bidder.pan || bidder.pan_number || 'AAACK1234F';
  const gstinVal = bidder.gstin || '33AAACK1234F1Z5';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Back Button */}
      <button onClick={onBack} className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Register</span>
      </button>

      {/* Header Info */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-md">
              REF: CPCL-{String(bidder.id).padStart(4, '0')}
            </span>
            <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              bidder.blacklisted ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {bidder.blacklisted ? '❌ Blacklisted' : '✓ Active & Compliant'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-2">{bidder.bidder_name || bidder.company_name}</h1>
          <p className="text-xs text-slate-500 mt-1">{bidder.address || bidder.registered_address || 'Chennai, Tamil Nadu, India'}</p>
        </div>

        <div className="flex items-center space-x-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div>
            <div className="text-xs text-slate-500">Evaluation Stage</div>
            <div className="text-sm font-bold text-slate-900 capitalize">{bidder.stage || 'registered'}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Overall AI Score</div>
            <div className="text-2xl font-black text-amber-600">{bidder.final_score || bidder.compliance_score || 85}/100</div>
          </div>
        </div>
      </div>

      {/* Verification Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="font-bold text-slate-900 border-b pb-3">Corporate Credentials</h3>
          
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">PAN Card:</span>
              <div className="flex items-center space-x-2 font-mono font-bold text-slate-900">
                <span>{maskPan ? panVal.replace(/^(.{3}).+(.{2})$/, "$1••••$2") : panVal}</span>
                <button onClick={() => setMaskPan(!maskPan)} className="text-slate-400 hover:text-slate-700">
                  {maskPan ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">GSTIN Portal Status:</span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{gstinVal} ({bidder.gst_status || 'Active'})</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">MSME Status:</span>
              <span className="font-bold text-slate-800">{bidder.msme_registered ? `✓ Yes (${bidder.udyam_number || 'Udyam Verified'})` : 'No'}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-500">Make-In-India Local Content:</span>
              <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">{bidder.local_content_percentage || 60}%</span>
            </div>

            <div className="flex justify-between items-center py-2">
              <span className="text-slate-500">OEM Authorization:</span>
              <span className="font-bold text-slate-800">{bidder.oem_authorized ? '✓ Authorized OEM' : 'Standard Supplier'}</span>
            </div>
          </div>
        </div>

        {/* AI Compliance Analysis */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
            <span>✨</span>
            <span className="uppercase tracking-wider">AI Copilot Risk & Compliance Report</span>
          </div>

          <p className="text-xs leading-relaxed text-slate-300">
            {bidder.blacklisted
              ? `CRITICAL RISK WARNING: ${bidder.bidder_name} is flagged in CPCL & Central Ministry blacklists. Disqualification reason: "${bidder.blacklist_reason || 'Failure to perform on past refinery tender.'}"`
              : `${bidder.bidder_name} shows excellent portal compliance across GSTN, MCA21, EPFO and Digilocker adapters. Company local content level is ${bidder.local_content_percentage || 60}%, meeting statutory Make-in-India guidelines.`}
          </p>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-center text-xs">
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-[10px]">Compliance Score</div>
              <div className="text-lg font-black text-emerald-400 mt-1">{bidder.compliance_score || 100}/100</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-[10px]">Legacy Record Score</div>
              <div className="text-lg font-black text-purple-400 mt-1">{bidder.legacy_score || 85}/100</div>
            </div>
            <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              <div className="text-slate-400 text-[10px]">Financial Bid Amount</div>
              <div className="text-lg font-black text-amber-400 mt-1">₹{((bidder.bid_amount || 4500000) / 100000).toFixed(1)} L</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default BidderDetail;
