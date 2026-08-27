import React, { useState, useEffect } from 'react';
import {
  getTenderDetail,
  getTenderBidders,
  registerBidderForTender,
  runEligibilityCheck,
  runAiScoring,
  selectTenderWinner
} from '../api/client';

const TenderDetail = ({ tenderId, onBack, onSelectBidder }) => {
  const [tender, setTender] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStageTab, setActiveStageTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [lotteryRunning, setLotteryRunning] = useState(false);
  const [lotteryWinner, setLotteryWinner] = useState(null);

  // New Bidder Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newBidder, setNewBidder] = useState({
    bidder_name: '',
    pan: '',
    gstin: '',
    bid_amount: 4500000,
    msme_registered: true,
    local_content_percentage: 60,
    oem_authorized: true,
    legacy_score: 80,
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const tData = await getTenderDetail(tenderId);
      const bData = await getTenderBidders(tenderId);
      setTender(tData);
      setBidders(bData);
    } catch (err) {
      console.error('Error loading tender workstation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) loadData();
  }, [tenderId]);

  const handleAddBidder = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await registerBidderForTender(tenderId, newBidder);
      setShowAddModal(false);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to register bidder');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunEligibility = async () => {
    setActionLoading(true);
    try {
      const res = await runEligibilityCheck(tenderId);
      alert(`Eligibility Check Completed!\n${res.eligible} Passed, ${res.eliminated} Eliminated.`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Eligibility check failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRunAiScoring = async () => {
    setActionLoading(true);
    try {
      const res = await runAiScoring(tenderId);
      alert(`AI Scoring Complete!\nTop Ranked: ${res.top_bidder}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Scoring failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectWinner = async (mode) => {
    if (mode === 'fair_draw') {
      // Trigger lottery animation
      setLotteryRunning(true);
      setLotteryWinner(null);
      setTimeout(async () => {
        try {
          const res = await selectTenderWinner(tenderId, 'fair_draw');
          setLotteryWinner(res.winner_name);
          setLotteryRunning(false);
          loadData();
        } catch (err) {
          setLotteryRunning(false);
          alert(err.response?.data?.detail || 'Lottery draw failed');
        }
      }, 2500);
    } else {
      setActionLoading(true);
      try {
        const res = await selectTenderWinner(tenderId, 'ai_ranked');
        alert(`Tender Awarded to Highest Score Winner: ${res.winner_name}`);
        loadData();
      } catch (err) {
        alert(err.response?.data?.detail || 'Award failed');
      } finally {
        setActionLoading(false);
      }
    }
  };

  if (loading || !tender) {
    return <div className="p-8 text-center text-slate-500 font-medium">Loading Tender Workstation...</div>;
  }

  const eligibleBidders = bidders.filter(b => b.stage === 'eligible' || b.stage === 'scored' || b.stage === 'selected');
  const eliminatedBidders = bidders.filter(b => b.stage === 'eliminated');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Navigation & Header */}
      <div className="flex items-center space-x-3 text-xs font-semibold text-slate-500 mb-2">
        <button onClick={onBack} className="hover:text-slate-900 transition-colors flex items-center space-x-1">
          <span>← Back to Tenders Pipeline</span>
        </button>
        <span>/</span>
        <span className="text-slate-900 font-bold">{tender.tender_number}</span>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-3 py-1 rounded-md">
                {tender.tender_number}
              </span>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                tender.status === 'open' ? 'bg-blue-100 text-blue-800' :
                tender.status === 'evaluation' ? 'bg-amber-100 text-amber-800' :
                tender.status === 'awarded' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
              }`}>
                Stage: {tender.status}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{tender.title}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">{tender.description}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-right min-w-[220px]">
            <div className="text-xs text-slate-500">Tender Budget</div>
            <div className="text-2xl font-black text-slate-900">₹{(tender.budget / 100000).toFixed(1)} Lakhs</div>
            <div className="text-[11px] text-amber-600 font-semibold mt-1">
              Mode: {tender.selection_mode === 'fair_draw' ? '🎲 Fair Anti-Corruption Draw' : '⚡ AI Ranked Evaluation'}
            </div>
          </div>
        </div>

        {/* 5-STAGE WORKFLOW PIPELINE BAR */}
        <div className="pt-4 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">5-Stage Evaluation Pipeline Status</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-center text-xs">
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              bidders.length > 0 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-500 font-normal">STAGE 1</div>
              1. Bidders Registered ({bidders.length})
            </div>
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              bidders.some(b => b.stage !== 'registered') ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-500 font-normal">STAGE 2</div>
              2. Eligibility Check ({eligibleBidders.length} Pass)
            </div>
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              bidders.some(b => b.stage === 'scored' || b.stage === 'selected') ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-500 font-normal">STAGE 3</div>
              3. AI & Legacy Scoring
            </div>
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              tender.status === 'awarded' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-500 font-normal">STAGE 4 & 5</div>
              4. Winner Selection ({tender.status === 'awarded' ? 'Awarded' : 'Pending'})
            </div>
            <div className="p-3 rounded-xl border font-bold bg-slate-900 text-amber-400 border-slate-800 flex items-center justify-center">
              🏆 Final Winner Award
            </div>
          </div>
        </div>

        {/* CONTROLS & PIPELINE ACTIONS */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all"
            >
              + Register New Bidder
            </button>
            <button
              onClick={handleRunEligibility}
              disabled={actionLoading || bidders.length === 0}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              ⚡ 1. Run Eligibility Filter
            </button>
            <button
              onClick={handleRunAiScoring}
              disabled={actionLoading || eligibleBidders.length === 0}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              🤖 2. Run AI & Legacy Scoring
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleSelectWinner('ai_ranked')}
              disabled={actionLoading || bidders.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition-all disabled:opacity-50"
            >
              🥇 Award to Top AI Rank
            </button>
            <button
              onClick={() => handleSelectWinner('fair_draw')}
              disabled={actionLoading || lotteryRunning || bidders.length === 0}
              className="bg-purple-900 hover:bg-purple-800 text-amber-300 font-bold text-xs px-4 py-2.5 rounded-xl border border-purple-700 shadow transition-all disabled:opacity-50 flex items-center space-x-1"
            >
              <span>🎲 Fair Trade Lottery Draw</span>
            </button>
          </div>
        </div>
      </div>

      {/* WINNER BANNER IF AWARDED */}
      {tender.status === 'awarded' && (
        <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl border border-emerald-500/40 space-y-2 relative overflow-hidden">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Tender Contract Formally Awarded</div>
              <h2 className="text-xl font-black text-white mt-0.5">
                Winner: {bidders.find(b => b.id === tender.awarded_bidder_id)?.bidder_name || 'Qualified Vendor'}
              </h2>
              <p className="text-xs text-slate-300 mt-1">{tender.awarded_reason}</p>
            </div>
          </div>
        </div>
      )}

      {/* ANIMATED LOTTERY DRAW MODAL */}
      {lotteryRunning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-purple-500/40 text-center space-y-6 animate-pulse">
            <div className="text-6xl animate-spin">🎲</div>
            <div>
              <h3 className="text-2xl font-black text-amber-400">Anti-Corruption Fair Trade Draw</h3>
              <p className="text-xs text-slate-400 mt-2">Selecting a random winner among qualified top bidders to prevent bias & corruption...</p>
            </div>
            <div className="py-4 bg-slate-800 rounded-xl border border-slate-700 text-sm font-mono text-purple-300">
              Shuffling Qualified Candidates...
            </div>
          </div>
        </div>
      )}

      {/* BIDDERS REGISTER TABLE & FILTER */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-lg">Registered Companies & Evaluation Breakdown</h3>
          <div className="flex space-x-2">
            {['all', 'eligible', 'eliminated', 'scored'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveStageTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeStageTab === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? `All Bidders (${bidders.length})` :
                 tab === 'eligible' ? `Passed (${eligibleBidders.length})` :
                 tab === 'eliminated' ? `Eliminated (${eliminatedBidders.length})` : 'Scored'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Rank & Company Name</th>
                <th className="px-6 py-3.5">Bid Amount</th>
                <th className="px-6 py-3.5">Credentials (MSME / Local %)</th>
                <th className="px-6 py-3.5">Stage & Evaluation Status</th>
                <th className="px-6 py-3.5 text-center">AI Total Score</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bidders
                .filter(b => activeStageTab === 'all' || b.stage === activeStageTab || (activeStageTab === 'eligible' && (b.stage === 'eligible' || b.stage === 'scored' || b.stage === 'selected')))
                .map((b) => (
                  <tr
                    key={b.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      b.id === tender.awarded_bidder_id ? 'bg-emerald-50/60' : b.stage === 'eliminated' ? 'bg-red-50/30' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        {b.rank ? (
                          <span className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            b.rank === 1 ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-200 text-slate-700'
                          }`}>
                            #{b.rank}
                          </span>
                        ) : (
                          <span className="h-7 w-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-bold">•</span>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{b.bidder_name}</div>
                          <div className="text-xs font-mono text-slate-400">PAN: {b.pan} | GST: {b.gstin}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">₹{(b.bid_amount / 100000).toFixed(2)} L</div>
                      {b.bid_amount > tender.budget && (
                        <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Exceeds Budget</span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-xs">
                      <div className="space-y-1">
                        <div>
                          <span className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            b.msme_registered ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {b.msme_registered ? '✓ MSME Registered' : 'No MSME'}
                          </span>
                        </div>
                        <div className="text-slate-600 font-medium">Local Content: <span className="font-bold">{b.local_content_percentage}%</span></div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {b.stage === 'eliminated' ? (
                        <div className="space-y-1">
                          <span className="bg-red-100 text-red-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
                            ❌ Eliminated
                          </span>
                          <p className="text-[11px] text-red-600 font-medium max-w-xs">{b.elimination_reason}</p>
                        </div>
                      ) : b.stage === 'selected' ? (
                        <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
                          🏆 Awarded Winner
                        </span>
                      ) : b.stage === 'eligible' ? (
                        <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full inline-block">
                          ✓ Passed Eligibility
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-700 text-xs font-bold px-2.5 py-1 rounded-full inline-block capitalize">
                          {b.stage}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <div className="text-lg font-black text-slate-900">{b.final_score ? `${b.final_score}` : '—'}</div>
                      <div className="text-[10px] text-slate-400">Legacy: {b.legacy_score || 75}/100</div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onSelectBidder(b.id)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline"
                      >
                        View Compliance Audit →
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW BIDDER REGISTRATION MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900">Register Bidder for Tender</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddBidder} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={newBidder.bidder_name}
                  onChange={(e) => setNewBidder({...newBidder, bidder_name: e.target.value})}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="e.g. Larsen & Toubro Heavy Eng"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    required
                    value={newBidder.pan}
                    onChange={(e) => setNewBidder({...newBidder, pan: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
                    placeholder="AAACL1234F"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN</label>
                  <input
                    type="text"
                    required
                    value={newBidder.gstin}
                    onChange={(e) => setNewBidder({...newBidder, gstin: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm uppercase"
                    placeholder="33AAACL1234F1Z5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bid Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={newBidder.bid_amount}
                    onChange={(e) => setNewBidder({...newBidder, bid_amount: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Local Content %</label>
                  <input
                    type="number"
                    value={newBidder.local_content_percentage}
                    onChange={(e) => setNewBidder({...newBidder, local_content_percentage: e.target.value})}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBidder.msme_registered}
                    onChange={(e) => setNewBidder({...newBidder, msme_registered: e.target.checked})}
                  />
                  <span>MSME Registered</span>
                </label>
                <label className="flex items-center space-x-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newBidder.oem_authorized}
                    onChange={(e) => setNewBidder({...newBidder, oem_authorized: e.target.checked})}
                  />
                  <span>OEM Authorized</span>
                </label>
              </div>

              <div className="pt-3 flex justify-end space-x-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-amber-500 text-slate-950 font-bold px-4 py-1.5 rounded-lg text-xs"
                >
                  Submit Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default TenderDetail;
