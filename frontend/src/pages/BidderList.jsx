import React, { useState, useEffect } from 'react';
import { getBidders } from '../api/client';
import RiskBadge from '../components/RiskBadge';
import ScoreGauge from '../components/ScoreGauge';
import { Search } from 'lucide-react';

const BidderList = ({ onSelectBidder }) => {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBidders = async () => {
      try {
        const data = await getBidders();
        setBidders(data);
      } catch (error) {
        console.error("Error fetching bidders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBidders();
  }, []);

  const filteredBidders = bidders.filter(b => {
    const name = b.bidder_name || b.company_name || '';
    const pan = b.pan || b.pan_number || '';
    const gstin = b.gstin || '';
    const term = searchTerm.toLowerCase();
    return name.toLowerCase().includes(term) || pan.toLowerCase().includes(term) || gstin.toLowerCase().includes(term);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bidders Master Register</h1>
          <p className="text-xs text-slate-500 mt-1">Unified corporate registry across all CPCL refinery tender notices</p>
        </div>

        <div className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search company, PAN or GSTIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        </div>
      </div>

      <div className="bg-white shadow-sm overflow-hidden border border-slate-200 sm:rounded-2xl">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Company Name</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">PAN & GSTIN</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tender Scope</th>
              <th className="px-6 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Score</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100 text-sm">
            {loading ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">Loading bidders database...</td></tr>
            ) : filteredBidders.length === 0 ? (
              <tr><td colSpan="5" className="px-6 py-8 text-center text-slate-500 font-medium">No bidders found.</td></tr>
            ) : (
              filteredBidders.map((bidder) => (
                <tr 
                  key={bidder.id} 
                  onClick={() => onSelectBidder(bidder.id)}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{bidder.bidder_name || bidder.company_name}</div>
                    <div className="text-xs text-slate-400">ID: CPCL-{String(bidder.id).padStart(4, '0')}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">
                    <div className="text-slate-900 font-semibold">{bidder.pan || bidder.pan_number}</div>
                    <div className="text-slate-500">{bidder.gstin || 'GST Verified'}</div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-700">
                    {bidder.tender_ref || 'Refinery Procurement'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      bidder.blacklisted ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {bidder.blacklisted ? '❌ Blacklisted' : (bidder.stage || 'Active')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-black text-slate-900">
                    {bidder.final_score || bidder.compliance_score || 85}/100
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BidderList;
