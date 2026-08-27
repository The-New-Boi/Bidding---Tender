import React, { useState, useEffect } from 'react';
import { getDashboardStats, getTenders } from '../api/client';

const Dashboard = ({ setCurrentTab, onSelectTender }) => {
  const [stats, setStats] = useState(null);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sData, tData] = await Promise.all([getDashboardStats(), getTenders()]);
        setStats(sData);
        setTenders(tData);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const portals = [
    { name: 'GSTN Portal', status: 'Operational', latency: '120ms', color: 'bg-emerald-500' },
    { name: 'MCA21 Database', status: 'Operational', latency: '158ms', color: 'bg-emerald-500' },
    { name: 'EPFO Compliance', status: 'Operational', latency: '210ms', color: 'bg-emerald-500' },
    { name: 'ESIC Gateway', status: 'Operational', latency: '180ms', color: 'bg-emerald-500' },
    { name: 'Udyam MSME Registry', status: 'Operational', latency: '95ms', color: 'bg-emerald-500' },
    { name: 'PAN Verification', status: 'Operational', latency: '88ms', color: 'bg-emerald-500' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Procurement Control Room
            </span>
            <span className="text-slate-400 text-xs">• CPCL Refinery Division</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black mt-2 text-white">Welcome back, Ananya.</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-2xl">
            Tender evaluation & anti-corruption compliance system is active. Review active tender bids, run eligibility rules, or execute fair-trade draw.
          </p>
        </div>

        <button
          onClick={() => setCurrentTab('Tenders')}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all whitespace-nowrap"
        >
          Open Tenders Workstation →
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Tenders</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats?.total_tenders || tenders.length || 1}</div>
          <div className="text-xs text-blue-600 font-semibold mt-1">In Pipeline Scope</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bidders</div>
          <div className="text-3xl font-black text-slate-900 mt-2">{stats?.total_bidders || 4}</div>
          <div className="text-xs text-slate-500 mt-1">Across all notices</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Passed / Verified</div>
          <div className="text-3xl font-black text-emerald-600 mt-2">{stats?.verified || 3}</div>
          <div className="text-xs text-emerald-700 font-semibold mt-1">Clean Compliance</div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Blacklisted / Flagged</div>
          <div className="text-3xl font-black text-red-600 mt-2">{stats?.high_risk || 1}</div>
          <div className="text-xs text-red-600 font-semibold mt-1">Disqualified Bidders</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Source Health Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Government Portal Adapters</h2>
            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">All Nominal</span>
          </div>
          <div className="space-y-3">
            {portals.map((p, i) => (
              <div key={i} className="flex justify-between items-center border-b border-slate-100 pb-2.5 last:border-0">
                <div className="flex items-center space-x-2.5">
                  <div className={`h-2 w-2 rounded-full ${p.color}`}></div>
                  <span className="font-semibold text-xs text-slate-800">{p.name}</span>
                </div>
                <div className="text-right">
                  <div className="text-[11px] font-medium text-slate-500">{p.status}</div>
                  <div className="text-[10px] font-mono text-slate-400">{p.latency}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Tenders Notice Overview */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-slate-900">Active Tender Notices & Pipelines</h2>
            <button onClick={() => setCurrentTab('Tenders')} className="text-xs text-amber-600 font-bold hover:underline">
              View All Tenders →
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {tenders.map((t) => (
              <div
                key={t.id}
                onClick={() => onSelectTender(t.id)}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between cursor-pointer hover:bg-slate-50 p-3 rounded-xl transition-all"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{t.tender_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>{t.status}</span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">{t.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Budget: ₹{(t.budget / 100000).toFixed(1)} Lakhs | {t.bidders_count || 0} Registered Bidders</p>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-amber-600 hover:underline">Manage Pipeline →</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
