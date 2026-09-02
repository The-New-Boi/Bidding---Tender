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
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

// Static Past Awards History data — "Tender Kiska Nikla Hai" — 20+ records
const PAST_AWARDS = [
  {
    id: 'TENDER-2025-CPCL-089',
    title: 'Supply of High-Pressure Safety Relief Valves – CDU Section',
    department: 'CPCL Chennai Refinery Unit 2 – Safety',
    category: 'Safety Equipment',
    awarded_to: 'Bharat Safety Systems Ltd',
    awarded_value: '₹42.0 Lakhs',
    awarded_date: 'March 2025',
    bidder_count: 4,
    msme_winner: true,
    selection_mode: 'ai_ranked',
    ai_score: 89.4,
    eliminated: 1,
  },
  {
    id: 'TENDER-2025-CPCL-071',
    title: 'Procurement of Heat Exchangers & Cooling Systems – VDU Section',
    department: 'CPCL Chennai Refinery Unit 1 – Process',
    category: 'Heat Transfer Equipment',
    awarded_to: 'Thermotech Industries Pvt Ltd',
    awarded_value: '₹1.08 Crores',
    awarded_date: 'November 2024',
    bidder_count: 3,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 91.0,
    eliminated: 0,
  },
  {
    id: 'TENDER-2024-CPCL-058',
    title: 'Annual Maintenance Contract – Instrumentation Systems AMC 2024-25',
    department: 'CPCL Manali Complex – Instrumentation',
    category: 'Maintenance & AMC',
    awarded_to: 'Kaveri Industrial Supplies Ltd',
    awarded_value: '₹26.0 Lakhs',
    awarded_date: 'August 2024',
    bidder_count: 2,
    msme_winner: true,
    selection_mode: 'ai_ranked',
    ai_score: 88.6,
    eliminated: 0,
  },
  {
    id: 'TENDER-2024-CPCL-043',
    title: 'Supply of Corrosion-Resistant Alloy Pipeline Components',
    department: 'CPCL Refinery Piping Division',
    category: 'Piping & Fittings',
    awarded_to: 'Metallica Steel & Alloys Pvt Ltd',
    awarded_value: '₹58.0 Lakhs',
    awarded_date: 'April 2024',
    bidder_count: 4,
    msme_winner: false,
    selection_mode: 'fair_draw',
    ai_score: 85.5,
    eliminated: 1,
  },
  {
    id: 'TENDER-2025-CPCL-101',
    title: 'Procurement & Commissioning of Fired Heater – Crude Preheat Train',
    department: 'CPCL Fired Equipment & Furnace Division',
    category: 'Heavy Machinery & Rigging',
    awarded_to: 'ISGEC Heavy Engineering Ltd',
    awarded_value: '₹4.80 Crores',
    awarded_date: 'January 2025',
    bidder_count: 3,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 93.2,
    eliminated: 0,
  },
  {
    id: 'TENDER-2025-CPCL-115',
    title: 'Water Treatment Chemical Supply – Cooling Tower & Boiler Feed',
    department: 'CPCL Utilities & Water Management Division',
    category: 'Chemicals & Catalysts',
    awarded_to: 'Nalco Water India Ltd',
    awarded_value: '₹28.5 Lakhs',
    awarded_date: 'June 2025',
    bidder_count: 3,
    msme_winner: true,
    selection_mode: 'ai_ranked',
    ai_score: 86.0,
    eliminated: 1,
  },
  {
    id: 'TENDER-2024-CPCL-137',
    title: 'Civil & Structural Works – New Crude Storage Tank Foundation',
    department: 'CPCL Civil Engineering & Infrastructure Division',
    category: 'Maintenance & AMC',
    awarded_to: 'EIL Engineering & Construction Ltd',
    awarded_value: '₹3.55 Crores',
    awarded_date: 'December 2024',
    bidder_count: 4,
    msme_winner: false,
    selection_mode: 'fair_draw',
    ai_score: 88.5,
    eliminated: 1,
  },
  {
    id: 'PAST-2023-CPCL-088',
    title: 'Supply & Commissioning of DCS Workstations – Control Room Upgrade',
    department: 'CPCL IT & Automation Division',
    category: 'IT & SCADA Automation',
    awarded_to: 'ABB India Limited',
    awarded_value: '₹1.22 Crores',
    awarded_date: 'October 2023',
    bidder_count: 5,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 94.5,
    eliminated: 1,
  },
  {
    id: 'PAST-2023-CPCL-076',
    title: 'Rooftop Solar Installation – CPCL Employee Township',
    department: 'CPCL Corporate ESG & Sustainability Division',
    category: 'Solar & Clean Energy',
    awarded_to: 'Waaree Energies Ltd',
    awarded_value: '₹92.0 Lakhs',
    awarded_date: 'July 2023',
    bidder_count: 6,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 90.2,
    eliminated: 2,
  },
  {
    id: 'PAST-2023-CPCL-061',
    title: 'Supply of CEMS Stack Emission Monitoring Systems',
    department: 'CPCL Environment Health & Safety Division',
    category: 'Environmental & Air Quality',
    awarded_to: 'Enviro Technology Ltd',
    awarded_value: '₹78.5 Lakhs',
    awarded_date: 'April 2023',
    bidder_count: 4,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 88.4,
    eliminated: 0,
  },
  {
    id: 'PAST-2023-CPCL-052',
    title: 'Annual Boiler Safety Inspection & IBR Compliance – Utility Block',
    department: 'CPCL Utilities & Services Division',
    category: 'Maintenance & AMC',
    awarded_to: 'Boilercare Services Pvt Ltd',
    awarded_value: '₹38.5 Lakhs',
    awarded_date: 'February 2023',
    bidder_count: 5,
    msme_winner: true,
    selection_mode: 'fair_draw',
    ai_score: 86.2,
    eliminated: 1,
  },
  {
    id: 'PAST-2024-CPCL-110',
    title: 'Procurement of Fire Suppression Systems – Warehouse & Pump House',
    department: 'CPCL Fire & Safety Division',
    category: 'Safety Equipment',
    awarded_to: 'Godrej Safety Equipment India Ltd',
    awarded_value: '₹51.0 Lakhs',
    awarded_date: 'September 2024',
    bidder_count: 5,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 91.5,
    eliminated: 2,
  },
  {
    id: 'PAST-2024-CPCL-097',
    title: 'Supply of Cooling Water Treatment Chemicals – Rate Contract 2024',
    department: 'CPCL Utilities & Water Management Division',
    category: 'Chemicals & Catalysts',
    awarded_to: 'Veolia Water Technologies India',
    awarded_value: '₹21.8 Lakhs',
    awarded_date: 'July 2024',
    bidder_count: 4,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 85.0,
    eliminated: 1,
  },
  {
    id: 'PAST-2024-CPCL-083',
    title: 'Supply of HVAC Systems – New Admin Block Construction',
    department: 'CPCL Civil Engineering & Infrastructure Division',
    category: 'Electrical Works',
    awarded_to: 'Voltas Limited – Projects Division',
    awarded_value: '₹1.45 Crores',
    awarded_date: 'May 2024',
    bidder_count: 7,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 89.0,
    eliminated: 3,
  },
  {
    id: 'PAST-2023-CPCL-041',
    title: 'Security Perimeter CCTV Upgrade – Phase 1',
    department: 'CPCL Security & Administration Division',
    category: 'Security & Surveillance',
    awarded_to: 'Eagle Eye Security Systems Ltd',
    awarded_value: '₹32.4 Lakhs',
    awarded_date: 'March 2023',
    bidder_count: 5,
    msme_winner: true,
    selection_mode: 'ai_ranked',
    ai_score: 83.0,
    eliminated: 1,
  },
  {
    id: 'PAST-2025-CPCL-029',
    title: 'Procurement of Centrifugal Pump Sets – Crude Transfer Unit',
    department: 'CPCL Rotating Equipment Division',
    category: 'Instrumentation & Controls',
    awarded_to: 'KSB Pumps Ltd',
    awarded_value: '₹1.10 Crores',
    awarded_date: 'February 2025',
    bidder_count: 4,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 92.5,
    eliminated: 0,
  },
  {
    id: 'PAST-2022-CPCL-198',
    title: 'Supply of Structural Steel for Pipe Rack – Refinery Expansion',
    department: 'CPCL Piping & Corrosion Management Cell',
    category: 'Piping & Fittings',
    awarded_to: 'Tata Steel Ltd – Projects',
    awarded_value: '₹2.20 Crores',
    awarded_date: 'November 2022',
    bidder_count: 9,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 95.1,
    eliminated: 4,
  },
  {
    id: 'PAST-2022-CPCL-172',
    title: 'ETP Sludge Dewatering System – Phase 2',
    department: 'CPCL Environment, Health & Safety Division',
    category: 'Water & Effluent Treatment',
    awarded_to: 'VA Tech Wabag Ltd',
    awarded_value: '₹1.85 Crores',
    awarded_date: 'August 2022',
    bidder_count: 6,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 90.8,
    eliminated: 2,
  },
  {
    id: 'PAST-2023-CPCL-119',
    title: 'Annual PPE & Safety Workwear Rate Contract 2023-24',
    department: 'CPCL HSE & Stores Division',
    category: 'Safety Equipment',
    awarded_to: 'Safety India PPE Pvt Ltd',
    awarded_value: '₹18.5 Lakhs',
    awarded_date: 'May 2023',
    bidder_count: 6,
    msme_winner: true,
    selection_mode: 'ai_ranked',
    ai_score: 87.4,
    eliminated: 2,
  },
  {
    id: 'PAST-2024-CPCL-034',
    title: 'Hiring of Heavy Lift Cranes – Turnaround Maintenance 2024',
    department: 'CPCL Maintenance & Turnaround Division',
    category: 'Heavy Machinery & Rigging',
    awarded_to: 'All India Rigging Corporation',
    awarded_value: '₹1.58 Crores',
    awarded_date: 'January 2024',
    bidder_count: 4,
    msme_winner: false,
    selection_mode: 'fair_draw',
    ai_score: 89.0,
    eliminated: 1,
  },
  {
    id: 'PAST-2022-CPCL-154',
    title: 'Petroleum FCC Catalyst Supply – Annual Rate Contract 2022-23',
    department: 'CPCL Chemical Engineering & Process Division',
    category: 'Chemicals & Catalysts',
    awarded_to: 'BASF India Limited',
    awarded_value: '₹3.80 Crores',
    awarded_date: 'October 2022',
    bidder_count: 3,
    msme_winner: false,
    selection_mode: 'ai_ranked',
    ai_score: 96.0,
    eliminated: 0,
  },
];

const CATEGORIES = [
  { label: 'All Categories', value: 'all', icon: '🗂️' },
  { label: 'Instrumentation', value: 'Instrumentation & Controls', icon: '⚙️' },
  { label: 'Electrical Works', value: 'Electrical Works', icon: '⚡' },
  { label: 'Safety Equipment', value: 'Safety Equipment', icon: '🛡️' },
  { label: 'Heat Transfer', value: 'Heat Transfer Equipment', icon: '🌡️' },
  { label: 'Maintenance & AMC', value: 'Maintenance & AMC', icon: '🔧' },
  { label: 'Piping & Fittings', value: 'Piping & Fittings', icon: '🔩' },
  { label: 'IT & SCADA', value: 'IT & SCADA Automation', icon: '🖥️' },
  { label: 'Solar & Energy', value: 'Solar & Clean Energy', icon: '☀️' },
  { label: 'Water Treatment', value: 'Water & Effluent Treatment', icon: '💧' },
  { label: 'Chemicals', value: 'Chemicals & Catalysts', icon: '🧪' },
  { label: 'Heavy Machinery', value: 'Heavy Machinery & Rigging', icon: '🏗️' },
  { label: 'Environment', value: 'Environmental & Air Quality', icon: '🌿' },
  { label: 'Security', value: 'Security & Surveillance', icon: '📷' },
];

const Marketplace = ({ user, onSelectTender, onSetCurrentTab }) => {
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

  const filteredTenders = tenders
    .filter(t => {
      const q = searchQuery.toLowerCase();
      const titleMatch = (t.title || '').toLowerCase().includes(q) ||
                         (t.tender_number || '').toLowerCase().includes(q) ||
                         (t.category || '').toLowerCase().includes(q) ||
                         (t.department || '').toLowerCase().includes(q);
      const catMatch = selectedCategory === 'all' || t.category === selectedCategory;
      return titleMatch && catMatch;
    })
    .sort((a, b) => {
      const statusOrder = { open: 1, evaluation: 2, awarded: 3, closed: 4 };
      const orderA = statusOrder[a.status] || 5;
      const orderB = statusOrder[b.status] || 5;
      if (orderA !== orderB) return orderA - orderB;
      return b.id - a.id;
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
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-white px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">

          {/* Top Header Bar */}
          {onSetCurrentTab && (
            <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
              <button
                onClick={() => onSetCurrentTab('Home')}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-slate-200 hover:text-amber-400 px-4 py-2 rounded-xl text-xs font-bold transition-all border border-white/15"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home Portal</span>
              </button>

              {user ? (
                <div className="flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold px-3.5 py-2 rounded-xl">
                  <BadgeCheck className="w-4 h-4 text-amber-400" />
                  <span>Logged in as: <strong className="text-white font-extrabold">{user.name || (user.portalRole === 'vendor' ? 'Vendor User' : 'Officer')}</strong> ({user.portalRole === 'vendor' ? 'Vendor Access' : 'Officer Access'})</span>
                </div>
              ) : (
                <button
                  onClick={() => onSetCurrentTab('Login')}
                  className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 px-4 py-2 rounded-xl text-xs font-black shadow-lg hover:from-amber-400 hover:to-amber-500 transition-all"
                >
                  Portal Entry / Sign In →
                </button>
              )}
            </div>
          )}

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
              <div key={award.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 hover:border-emerald-300 hover:shadow-md transition-all">
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
                      {award.selection_mode === 'fair_draw' && (
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          🎲 Fair Draw
                        </span>
                      )}
                      <span className="text-[11px] font-medium text-slate-500">{award.category}</span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900">{award.title}</h3>
                    <p className="text-xs text-slate-500">{award.department}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-slate-600 font-medium pt-1">
                      <span className="flex items-center gap-1">🏆 <span>Winner: <strong className="text-slate-900">{award.awarded_to}</strong></span></span>
                      <span className="flex items-center gap-1">📅 <span>Awarded: <strong>{award.awarded_date}</strong></span></span>
                      <span className="flex items-center gap-1">👥 <span>Total Bidders: <strong>{award.bidder_count}</strong></span></span>
                      {award.eliminated > 0 && (
                        <span className="flex items-center gap-1 text-red-500">🚫 <span><strong>{award.eliminated}</strong> Eliminated</span></span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 min-w-[155px]">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Contract Value</div>
                      <div className="text-xl font-black text-emerald-700">{award.awarded_value}</div>
                      <div className="text-[11px] text-slate-400">Post-Award Disclosed</div>
                    </div>
                    {award.ai_score && (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 text-right w-full">
                        <div className="text-[10px] text-amber-600 font-semibold uppercase tracking-wider">AI Eval Score</div>
                        <div className="text-lg font-black text-amber-700">{award.ai_score}<span className="text-xs font-semibold text-amber-500">/100</span></div>
                      </div>
                    )}
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
