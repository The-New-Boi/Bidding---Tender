import React, { useState, useEffect } from 'react';
import {
  getTenderDetail,
  getTenderBidders,
  registerBidderForTender,
  runEligibilityCheck,
  runAiScoring,
  selectTenderWinner
} from '../api/client';
import TenderAnalyticsGraph from '../components/TenderAnalyticsGraph';
import DocScreeningModal from '../components/DocScreeningModal';
import { 
  Lock, 
  Unlock, 
  ShieldAlert, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Cpu,
  BarChart2
} from 'lucide-react';

const TenderDetail = ({ tenderId, onBack, onSelectBidder }) => {
  const [tender, setTender] = useState(null);
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStageTab, setActiveStageTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(false);
  const [lotteryRunning, setLotteryRunning] = useState(false);
  const [lotteryWinner, setLotteryWinner] = useState(null);

  // Financial Bid Sealed / Unsealed State (Officer Action — one-way unseal)
  const [isFinancialUnsealed, setIsFinancialUnsealed] = useState(false);
  const [isBudgetRevealed, setIsBudgetRevealed] = useState(false);

  // Doc Screening Modal State
  const [selectedBidderForDoc, setSelectedBidderForDoc] = useState(null);

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
      if (tData?.status === 'awarded') {
        setIsFinancialUnsealed(true);
      }
    } catch (err) {
      console.error('Error loading tender workstation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenderId) loadData();
  }, [tenderId]);

  const handleToggleUnsealFinancial = () => {
    if (!isFinancialUnsealed) {
      const confirmAction = window.confirm(
        "OFFICIAL AUDIT NOTICE:\n\nUnsealing Financial Bids (Envelope B) will decrypt bidder financial quotes and log an immutable entry into the CVC Compliance Audit Trail.\n\nDo you want to proceed with Financial Unsealing?"
      );
      if (confirmAction) {
        setIsFinancialUnsealed(true);
      }
    } else {
      setIsFinancialUnsealed(false);
    }
  };

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
      // Auto-unseal financial bids upon scoring
      setIsFinancialUnsealed(true);
      alert(`AI Scoring Complete!\nFinancial Bids Unsealed automatically for evaluation.\nTop Ranked: ${res.top_bidder}`);
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'AI Scoring failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelectWinner = async (mode) => {
    if (mode === 'fair_draw') {
      setLotteryRunning(true);
      setLotteryWinner(null);
      setTimeout(async () => {
        try {
          const res = await selectTenderWinner(tenderId, 'fair_draw');
          setLotteryWinner(res.winner_name);
          setLotteryRunning(false);
          setIsFinancialUnsealed(true);
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
        setIsFinancialUnsealed(true);
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
      
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="hover:text-slate-900 transition-colors flex items-center space-x-1">
            <span>← Back to Tenders Pipeline</span>
          </button>
          <span>/</span>
          <span className="text-slate-900 font-bold">{tender.tender_number}</span>
        </div>

        <div className="flex items-center space-x-2 text-[11px] text-amber-700 font-bold bg-amber-100 px-3 py-1 rounded-full">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          <span>AI 10X Smart Procurement Engine Active</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-5">
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

              {/* Envelope Status Tag */}
              <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1.5 ${
                isFinancialUnsealed ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
              }`}>
                {isFinancialUnsealed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{isFinancialUnsealed ? 'Envelope B: Unsealed' : 'Envelope B: Sealed'}</span>
              </span>
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 mt-2">{tender.title}</h1>
            <p className="text-xs text-slate-600 mt-1 max-w-3xl">{tender.description}</p>
          </div>

          {/* OFFICER INTERNAL BUDGET REFERENCE — Masked by default */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-700 text-right min-w-[260px]">
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1">Officer Internal Reference</div>
            <div className="text-[11px] text-slate-500 font-mono mb-2">Estimated Tender Value</div>
            
            <div className="text-xl font-black text-amber-400 mb-1">
              {isBudgetRevealed ? (
                <span>₹{(tender.budget / 100000).toFixed(1)} Lakhs</span>
              ) : (
                <span className="text-slate-400 font-mono text-sm bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                  🔒 Confidential (Masked)
                </span>
              )}
            </div>

            <button
              onClick={() => setIsBudgetRevealed(!isBudgetRevealed)}
              className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline transition-colors"
            >
              {isBudgetRevealed ? '👁️ Mask Internal Budget' : '🔓 Reveal Internal Estimate (Officer Only)'}
            </button>

            <div className="text-[10px] text-slate-500 mt-2 border-t border-slate-800 pt-2">
              Mode: {tender.selection_mode === 'fair_draw' ? '🎲 Fair Trade Draw' : '⚡ AI Ranked'}
            </div>
          </div>
        </div>

        {/* 2-ENVELOPE SECURITY STATUS — Officer-only, one-way unseal */}
        <div className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          isFinancialUnsealed 
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-amber-50/80 border-amber-200 text-amber-950'
        }`}>
          <div className="flex items-start space-x-3">
            <div className={`p-2 rounded-xl mt-0.5 ${isFinancialUnsealed ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
              {isFinancialUnsealed ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h4 className="font-extrabold text-sm flex items-center space-x-2">
                <span>{isFinancialUnsealed ? 'Financial Bids Unsealed (Envelope B Active)' : 'Financial Bids Sealed — Awaiting Technical Clearance'}</span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded border font-bold uppercase">CVC / GeM Protocol</span>
              </h4>
              <p className="text-xs mt-0.5 opacity-90">
                {isFinancialUnsealed
                  ? 'Officer decrypted financial quotes. All bid prices are now visible internally for L1/AI evaluation. This action is logged in the audit trail.'
                  : 'Bidder financial quotes (Envelope B) are cryptographically sealed. They will be revealed only after all technical documents are verified, per 2-Envelope procurement protocol.'}
              </p>
            </div>
          </div>

          {!isFinancialUnsealed ? (
            <button
              onClick={handleToggleUnsealFinancial}
              className="px-4 py-2.5 rounded-xl font-extrabold text-xs shadow transition-all whitespace-nowrap flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20"
            >
              <Unlock className="w-4 h-4" />
              <span>🔓 Unseal Financial Envelopes (Officer Action)</span>
            </button>
          ) : (
            <div className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center space-x-2 bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
              <span>Unsealed & Audit Logged</span>
            </div>
          )}
        </div>

        {/* 5-STAGE WORKFLOW PIPELINE BAR */}
        <div className="pt-2 border-t border-slate-100">
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
              2. Technical Check ({eligibleBidders.length} Pass)
            </div>
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              isFinancialUnsealed ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-500 font-normal">STAGE 3</div>
              3. Financial Opening ({isFinancialUnsealed ? 'Unsealed' : 'Sealed'})
            </div>
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              bidders.some(b => b.stage === 'scored' || b.stage === 'selected') ? 'bg-purple-50 border-purple-200 text-purple-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-500 font-normal">STAGE 4</div>
              4. AI Scoring & Ranking
            </div>
            <div className={`p-3 rounded-xl border font-bold transition-all ${
              tender.status === 'awarded' ? 'bg-slate-900 text-amber-400 border-slate-800' : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}>
              <div className="text-[10px] text-slate-400 font-normal">STAGE 5</div>
              🏆 Contract Award
            </div>
          </div>
        </div>

        {/* CONTROLS & PIPELINE ACTIONS */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
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
              ⚡ 1. Run Tech Eligibility
            </button>
            <button
              onClick={handleRunAiScoring}
              disabled={actionLoading || eligibleBidders.length === 0}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow shadow-purple-600/20 transition-all disabled:opacity-50"
            >
              🤖 2. Run AI Scoring & Unseal
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
              <span>🎲 Fair Trade Draw</span>
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

      {/* INTEGRATED GRAPH & ANALYTICS ENGINE */}
      <TenderAnalyticsGraph
        tender={tender}
        bidders={bidders}
        isFinancialUnsealed={isFinancialUnsealed}
      />

      {/* REGISTERED BIDDERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Registered Companies & Bidding Register</h3>
            <p className="text-xs text-slate-500">Envelope A (Credentials) & Envelope B (Financial Quotes)</p>
          </div>

          <div className="flex space-x-2">
            {['all', 'eligible', 'eliminated', 'scored'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveStageTab(tab)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                  activeStageTab === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab === 'all' ? `All (${bidders.length})` :
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
                <th className="px-6 py-3.5">Financial Quote (Envelope B)</th>
                <th className="px-6 py-3.5">Credentials (MSME / Local %)</th>
                <th className="px-6 py-3.5">Evaluation Status</th>
                <th className="px-6 py-3.5 text-center">AI Total Score</th>
                <th className="px-6 py-3.5 text-right">AI OCR & Actions</th>
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

                    {/* FINANCIAL BID QUOTE COLUMN */}
                    <td className="px-6 py-4">
                      {isFinancialUnsealed ? (
                        <div>
                          <div className="font-extrabold text-slate-900 text-base">₹{(b.bid_amount / 100000).toFixed(2)} Lakhs</div>
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex items-center space-x-1">
                              <Unlock className="w-2.5 h-2.5" />
                              <span>Unsealed & Audited</span>
                            </span>
                            {b.bid_amount > tender.budget && (
                              <span className="text-[10px] font-semibold text-red-600 bg-red-100 px-1.5 py-0.5 rounded">Exceeds Budget</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="inline-flex items-center space-x-1.5 bg-amber-500/10 text-amber-800 border border-amber-500/30 px-3 py-1.5 rounded-xl font-bold text-xs">
                            <Lock className="w-3.5 h-3.5 text-amber-600" />
                            <span>🔒 Sealed Financial Bid</span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">Hidden until officer unsealing</p>
                        </div>
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

                    <td className="px-6 py-4 text-right space-y-1">
                      <button
                        onClick={() => setSelectedBidderForDoc(b)}
                        className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-extrabold text-[11px] px-3 py-1.5 rounded-xl border border-purple-200 transition-all flex items-center space-x-1 ml-auto"
                      >
                        <Cpu className="w-3.5 h-3.5" />
                        <span>⚡ AI OCR Screening</span>
                      </button>

                      <button
                        onClick={() => onSelectBidder(b.id)}
                        className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline block ml-auto"
                      >
                        View Audit Log →
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI OCR DOCUMENT SCREENING MODAL */}
      {selectedBidderForDoc && (
        <DocScreeningModal
          bidder={selectedBidderForDoc}
          onClose={() => setSelectedBidderForDoc(null)}
        />
      )}

      {/* ADD BIDDER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-slate-900 text-xl">Register Vendor Bid Proposal</h3>
            <form onSubmit={handleAddBidder} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Company / Bidder Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. L&T Heavy Engineering"
                  value={newBidder.bidder_name}
                  onChange={(e) => setNewBidder({ ...newBidder, bidder_name: e.target.value })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">PAN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="AAACK1234F"
                    value={newBidder.pan}
                    onChange={(e) => setNewBidder({ ...newBidder, pan: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">GSTIN Number</label>
                  <input
                    type="text"
                    required
                    placeholder="33AAACK1234F1Z5"
                    value={newBidder.gstin}
                    onChange={(e) => setNewBidder({ ...newBidder, gstin: e.target.value.toUpperCase() })}
                    className="w-full p-2.5 border rounded-xl bg-slate-50"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Sealed Financial Bid Amount (₹ INR)
                </label>
                <input
                  type="number"
                  required
                  value={newBidder.bid_amount}
                  onChange={(e) => setNewBidder({ ...newBidder, bid_amount: parseFloat(e.target.value) })}
                  className="w-full p-2.5 border rounded-xl bg-slate-50 font-bold"
                />
                <p className="text-[10px] text-amber-600 mt-1">🔒 Price will be stored sealed in Envelope B.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <label className="flex items-center space-x-2 font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={newBidder.msme_registered}
                    onChange={(e) => setNewBidder({ ...newBidder, msme_registered: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>MSME Registered</span>
                </label>
                <div>
                  <label className="font-bold text-slate-700 block">Local Content %</label>
                  <input
                    type="number"
                    value={newBidder.local_content_percentage}
                    onChange={(e) => setNewBidder({ ...newBidder, local_content_percentage: parseInt(e.target.value) })}
                    className="w-full p-1.5 border rounded-xl bg-slate-50 text-center font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl hover:bg-amber-400 shadow shadow-amber-500/20"
                >
                  {actionLoading ? 'Saving...' : 'Submit Sealed Bid'}
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
