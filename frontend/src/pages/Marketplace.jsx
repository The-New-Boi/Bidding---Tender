import React, { useState, useEffect } from 'react';
import { getTenders } from '../api/client';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Tag, 
  BadgeCheck,
  Sparkles,
  Filter,
  TrendingUp,
  Building2,
  AlertCircle
} from 'lucide-react';

// Static Past Awards History data
const PAST_AWARDS = [
  {
    id: 'PAST-2025-CPCL-089',
    title: 'Supply of High-Pressure Safety Relief Valves',
    department: 'CPCL Chennai Refinery Unit 2',
    category: 'Safety Equipment',
    awarded_to: 'Bharat Safety Systems Ltd',
    awarded_value: '₹42.3 Lakhs',
    awarded_date: 'March 2025',
    bidder_count: 8,
    msme_winner: true,
  },
  {
    id: 'PAST-2024-CPCL-071',
    title: 'Procurement of Heat Exchangers & Cooling Systems',
    department: 'CPCL Chennai Refinery Unit 1',
    category: 'Heat Transfer Equipment',
    awarded_to: 'Thermotech Industries Pvt Ltd',
    awarded_value: '₹1.2 Crores',
    awarded_date: 'November 2024',
    bidder_count: 12,
    msme_winner: false,
  },
  {
    id: 'PAST-2024-CPCL-058',
    title: 'Annual Maintenance Contract for Instrumentation Systems',
    department: 'CPCL Manali Complex',
    category: 'Maintenance & Services',
    awarded_to: 'Kaveri Industrial Supplies Ltd',
    awarded_value: '₹28.7 Lakhs',
    awarded_date: 'August 2024',
    bidder_count: 5,
    msme_winner: true,
  },
  {
    id: 'PAST-2023-CPCL-043',
    title: 'Supply of Corrosion Resistant Pipeline Components',
    department: 'CPCL Refinery Piping Division',
    category: 'Piping & Fittings',
    awarded_to: 'Southern Pipeline Corp',
    awarded_value: '₹67.0 Lakhs',
    awarded_date: 'April 2023',
    bidder_count: 9,
    msme_winner: false,
  },
];

const CATEGORIES = [
  { label: 'All Categories', value: 'all', icon: '🗂️' },
  { label: 'Instrumentation & Controls', value: 'Instrumentation & Controls', icon: '⚙️' },
  { label: 'Safety Equipment', value: 'Safety Equipment', icon: '🛡️' },
  { label: 'Heat Transfer', value: 'Heat Transfer Equipment', icon: '🌡️' },
  { label: 'Maintenance & AMC', value: 'Maintenance & Services', icon: '🔧' },
  { label: 'Piping & Fittings', value: 'Piping & Fittings', icon: '🔩' },
];

const Marketplace = ({ onSelectTender, onSetCurrentTab }) => {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeView, setActiveView] = useState('active'); // 'active' | 'history'

  useEffect(() => {
    const fetchTenders = async () => {
      setLoading(true);
      try {
        const data = await getTenders();
        setTenders(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTenders();
  }, []);

  const filteredTenders = tenders.filter(t => {
    const q = searchQuery.toLowerCase();
    const titleMatch = (t.title || '').toLowerCase().includes(q) ||
                       (t.tender_number || '').toLowerCase().includes(q) ||
                       (t.category || '').toLowerCase().includes(q) ||
                       (t.department || '').toLowerCase().includes(q);
    const catMatch = selectedCategory === 'all' || t.category === selectedCategory;
    return titleMatch && catMatch;
  });

  const filteredHistory = PAST_AWARDS.filter(a => {
    const q = searchQuery.toLowerCase();
    return (a.title || '').toLowerCase().includes(q) ||
           (a.category || '').toLowerCase().includes(q) ||
           (a.awarded_to || '').toLowerCase().includes(q);
  });

  return (
    <div className="min-h-screen bg-slate-50">

      {/* HERO BANNER */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles className="w-4 h-4" />
            <span>CPCL Refinery Division — Government Public Procurement Portal</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight max-w-3xl">
            Tender Notice Board &<br />
            <span className="text-amber-400">Contract Opportunity Registry</span>
          </h1>
          <p className="text-slate-400 mt-4 max-w-2xl text-sm leading-relaxed">
            Browse all active tenders, check eligibility criteria, view past awarded contracts, and apply for procurement opportunities. All procurement is conducted transparently under GeM & CVC Guidelines.
          </p>

          {/* STATS ROW */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Active Tenders', value: tenders.length.toString(), color: 'text-amber-400' },
              { label: 'Total Awards (2023–26)', value: '143+', color: 'text-emerald-400' },
              { label: 'MSME Preferred', value: '68%', color: 'text-blue-400' },
              { label: 'Avg Processing Time', value: '12 Days', color: 'text-purple-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <div className={`text-2xl font-black ${stat.color}`}>{stat.value}</div>
                <div className="text-slate-400 text-xs font-medium mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* SEARCH BAR */}
          <div className="relative mt-8 max-w-3xl">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search tenders by title, category, department... e.g. 'instrumentation valves' or 'MSME tenders'"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/10 border border-white/20 rounded-2xl pl-10 pr-4 py-4 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white/15"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ACTIVE / HISTORY TOGGLE + CATEGORY FILTER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-white border border-slate-200 p-1 rounded-2xl shadow-sm text-sm font-bold">
            <button
              onClick={() => setActiveView('active')}
              className={`px-5 py-2 rounded-xl transition-all ${activeView === 'active' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
              🔔 Active Tenders ({tenders.length})
            </button>
            <button
              onClick={() => setActiveView('history')}
              className={`px-5 py-2 rounded-xl transition-all ${activeView === 'history' ? 'bg-slate-900 text-white shadow' : 'text-slate-500 hover:text-slate-900'}`}
            >
              📋 Past Awards & History
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium overflow-x-auto pb-1">
            <Filter className="w-4 h-4 text-slate-400 min-w-[16px]" />
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl border transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-amber-500 text-slate-950 border-amber-500 font-bold'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300'
                }`}
              >
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ACTIVE TENDERS LISTING */}
        {activeView === 'active' && (
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-16 text-slate-400">Loading active tender notices...</div>
            ) : filteredTenders.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">No tenders found matching your search.</p>
                <button onClick={() => setSearchQuery('')} className="mt-3 text-amber-600 font-bold text-sm hover:underline">
                  Clear filters
                </button>
              </div>
            ) : (
              filteredTenders.map(tender => (
                <div
                  key={tender.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-md transition-all p-6 cursor-pointer group"
                  onClick={() => onSelectTender(tender.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Tags Row */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold bg-slate-900 text-amber-400 px-2.5 py-1 rounded-lg">
                          {tender.tender_number}
                        </span>
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          tender.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          tender.status === 'evaluation' ? 'bg-amber-100 text-amber-700' :
                          tender.status === 'awarded' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {tender.status === 'open' ? '🟢 Accepting Applications' :
                           tender.status === 'evaluation' ? '🟡 Under Evaluation' :
                           tender.status === 'awarded' ? '✅ Awarded' : tender.status}
                        </span>
                        {tender.eligibility_criteria?.require_msme && (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                            MSME Preferred
                          </span>
                        )}
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {tender.category || 'General'}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-lg font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                        {tender.title}
                      </h3>

                      {/* Description */}
                      <p className="text-sm text-slate-500 line-clamp-2">{tender.description}</p>

                      {/* Details Row */}
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                        <span className="flex items-center space-x-1">
                          <Building2 className="w-3.5 h-3.5" />
                          <span>{tender.department || 'CPCL Refinery'}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Tag className="w-3.5 h-3.5" />
                          <span>Min Local Content: {tender.eligibility_criteria?.min_local_content || 40}%</span>
                        </span>
                        {tender.status === 'open' && (
                          <span className="flex items-center space-x-1 text-blue-600 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Submissions Open</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* CTA Side */}
                    <div className="flex flex-col items-end space-y-3 min-w-[160px]">
                      {/* NOTE: No price/budget shown to vendors */}
                      <div className="text-right">
                        <div className="text-xs text-slate-400 font-medium">Selection Method</div>
                        <div className="font-bold text-slate-700 text-sm">
                          {tender.selection_mode === 'fair_draw' ? '🎲 Anti-Corruption Draw' : '⚡ AI Ranked'}
                        </div>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); onSelectTender(tender.id); }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all shadow-sm flex items-center space-x-1.5 ${
                          tender.status === 'open'
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{tender.status === 'open' ? 'View & Apply' : 'View Details'}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PAST AWARDS HISTORY */}
        {activeView === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-800">
              <BadgeCheck className="w-5 h-5 text-blue-600 min-w-[20px]" />
              <span>
                <strong>Public Transparency Record:</strong> All awarded contracts are publicly disclosed as per Government Transparency & RTI Act. Budget values are disclosed only after contract award.
              </span>
            </div>

            {filteredHistory.map(award => (
              <div key={award.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-lg">
                        {award.id}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        ✅ Contract Awarded
                      </span>
                      {award.msme_winner && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                          🏅 MSME Winner
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-500">{award.category}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{award.title}</h3>
                    <p className="text-xs text-slate-500">{award.department}</p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 font-medium pt-1">
                      <span>🏆 Winner: <strong>{award.awarded_to}</strong></span>
                      <span>📅 Awarded: <strong>{award.awarded_date}</strong></span>
                      <span>👥 Total Bidders: <strong>{award.bidder_count}</strong></span>
                    </div>
                  </div>

                  <div className="text-right space-y-1 min-w-[140px]">
                    <div className="text-xs text-slate-400">Contract Value</div>
                    {/* Awarded contracts show value as part of public record */}
                    <div className="text-xl font-black text-emerald-700">{award.awarded_value}</div>
                    <div className="text-[11px] text-slate-400">Post-Award Disclosed</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Marketplace;
