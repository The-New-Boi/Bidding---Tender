import React from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Award, 
  Users, 
  Lock, 
  Eye, 
  Zap, 
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  FileCheck
} from 'lucide-react';

const Home = ({ setCurrentTab, onSelectTender }) => {
  const featuredTenders = [
    {
      id: 1,
      code: 'TENDER-2026-CPCL-001',
      title: 'Procurement of Refinery Instrumentation Valves & Flow Controllers',
      dept: 'CPCL Refinery Instrumentation Division',
      budget: '₹55.0 Lakhs',
      bidders: 4,
      deadline: '7 Days Left',
      category: 'Instrumentation',
      status: 'Active',
      msmePreference: true
    },
    {
      id: 2,
      code: 'TENDER-2026-CPCL-002',
      title: 'Annual Turnaround Electrical Substation Overhaul & Transformer Testing',
      dept: 'Electrical Engineering Dept',
      budget: '₹1.20 Crores',
      bidders: 4,
      deadline: '12 Days Left',
      category: 'Electrical Works',
      status: 'Active',
      msmePreference: true
    },
    {
      id: 4,
      code: 'TENDER-2026-CPCL-004',
      title: 'SCADA/DCS Upgradation – Refinery Process Units 2 & 3',
      dept: 'CPCL IT & Automation Division',
      budget: '₹2.80 Crores',
      bidders: 3,
      deadline: '15 Days Left',
      category: 'IT & SCADA Automation',
      status: 'Active',
      msmePreference: false
    },
    {
      id: 5,
      code: 'TENDER-2026-CPCL-005',
      title: 'Supply of Fire & Gas Detection Systems – LPG Bottling Plant',
      dept: 'CPCL Fire & Safety Division',
      budget: '₹95.0 Lakhs',
      bidders: 3,
      deadline: '9 Days Left',
      category: 'Safety Equipment',
      status: 'Active',
      msmePreference: true
    },
    {
      id: 6,
      code: 'TENDER-2026-CPCL-006',
      title: 'Procurement of Heat Exchangers – Atmospheric Distillation Unit',
      dept: 'CPCL Mechanical Engineering Division',
      budget: '₹1.50 Crores',
      bidders: 4,
      deadline: '14 Days Left',
      category: 'Heat Transfer Equipment',
      status: 'Active',
      msmePreference: false
    },
    {
      id: 7,
      code: 'TENDER-2026-CPCL-007',
      title: 'Rooftop Solar Power Generation System (500 kWp) – CPCL HQ',
      dept: 'CPCL Corporate ESG & Sustainability',
      budget: '₹2.20 Crores',
      bidders: 3,
      deadline: '20 Days Left',
      category: 'Solar & Clean Energy',
      status: 'Active',
      msmePreference: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center space-x-2 truncate">
            <span className="bg-slate-950 text-amber-400 text-[10px] uppercase font-black px-2 py-0.5 rounded-full">Official Portal</span>
            <span className="truncate">Chennai Petroleum Corporation Limited — GeM 10X Anti-Corruption e-Tendering & Public Bidding Portal</span>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-[11px] font-extrabold text-slate-900">
            <span className="flex items-center space-x-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>CVC Compliant</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-800" />
              <span>ISO 27001 Certified Security</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Header */}
      <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo Branding */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('Home')}>
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-2xl shadow-xl shadow-amber-500/20 border border-amber-300/40">
              CP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-black text-white tracking-tight">CPCL e-Procurement</h1>
                <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-black px-2 py-0.5 rounded-md">
                  GeM 10X
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Chennai Petroleum Corporation Limited (A Group Company of IOCL)</p>
            </div>
          </div>

          {/* Quick Nav Links */}
          <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-slate-300">
            <button 
              onClick={() => setCurrentTab('Home')} 
              className="text-amber-400 font-bold transition-colors flex items-center space-x-1"
            >
              <span>Home</span>
            </button>
            <button 
              onClick={() => setCurrentTab('Marketplace')} 
              className="hover:text-amber-400 transition-colors flex items-center space-x-1"
            >
              <span>Active Tenders</span>
              <span className="bg-slate-800 text-amber-400 text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-slate-700">Live</span>
            </button>
            <a href="#gateways" className="hover:text-amber-400 transition-colors">
              Portal Gateways
            </a>
            <a href="#features" className="hover:text-amber-400 transition-colors">
              AI Security & Audit
            </a>
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentTab('Marketplace')}
              className="hidden sm:flex items-center space-x-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border border-slate-700"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Browse Tenders</span>
            </button>

            <button
              onClick={() => setCurrentTab('Login')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all flex items-center space-x-2"
            >
              <span>Portal Entry / Login</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950">
        
        {/* Background Decorative Grid */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(245, 158, 11, 0.4) 1px, transparent 0)',
          backgroundSize: '48px 48px'
        }}></div>

        {/* Glow Spheres */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500/10 via-amber-400/20 to-amber-500/10 border border-amber-500/30 text-amber-300 px-4 py-2 rounded-full text-xs font-extrabold tracking-wide uppercase shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>CPCL Anti-Corruption & Sealed Bid Evaluation Portal</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-none">
            Next-Gen AI & Sealed Bidding <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
              Tender Evaluation Workstation
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed font-normal">
            Automated compliance verification across <strong className="text-white font-semibold">GSTN, MCA21, EPFO & MSME Udyam</strong> registries. Built for transparent, tamper-proof government procurement with real-time audit logs.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setCurrentTab('Login')}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-8 py-4 rounded-2xl text-base font-black shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/40 hover:-translate-y-0.5 transition-all flex items-center space-x-3 group"
            >
              <span>Enter Portal / Choose Role</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setCurrentTab('Marketplace')}
              className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-500/50 px-8 py-4 rounded-2xl text-base font-bold transition-all shadow-lg flex items-center space-x-2"
            >
              <Eye className="w-5 h-5 text-amber-400" />
              <span>Browse Active Tenders</span>
            </button>
          </div>

          {/* Key Trust Badges */}
          <div className="pt-8 flex flex-wrap justify-center items-center gap-6 sm:gap-12 text-xs font-semibold text-slate-400 border-t border-slate-800/80 max-w-4xl mx-auto">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Zero-Corruption Framework</span>
            </div>
            <div className="flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Instant AI Verification</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-purple-400" />
              <span>Cryptographic Sealed Bids</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileCheck className="w-4 h-4 text-blue-400" />
              <span>Automated MSME Benefit Engine</span>
            </div>
          </div>

        </div>
      </section>

      {/* Gateway Entry Cards Section */}
      <section id="gateways" className="py-20 bg-slate-900/60 border-y border-slate-800 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Portal Access Pathways</h2>
            <p className="text-3xl sm:text-4xl font-black text-white">Select Your Access Portal to Begin</p>
            <p className="text-slate-400 text-sm max-w-2xl mx-auto">
              Dedicated interfaces for external vendors/bidders and internal CPCL procurement officers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* VENDOR PORTAL CARD */}
            <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-8 sm:p-10 transition-all hover:shadow-2xl hover:shadow-amber-500/10 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-amber-400" />
                  </div>
                  <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase">
                    Public / Supplier Gateway
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-3">Vendor & Supplier Portal</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Explore active CPCL tender notices, check eligibility requirements, register vendor profile, submit sealed bids, and track awarded contracts.
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[
                    'Search & Filter Active Tenders by Category',
                    'Automated Document Compliance Checklist',
                    'Instant MSME & GST Eligibility Check',
                    'Transparent Past Awards & Transparency Log'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCurrentTab('Marketplace')}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-4 rounded-xl text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2 group-hover:translate-x-0.5"
              >
                <span>Enter Vendor Marketplace</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* OFFICER WORKSTATION CARD */}
            <div className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-8 sm:p-10 transition-all hover:shadow-2xl hover:shadow-purple-500/10 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="h-16 w-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <ShieldCheck className="w-8 h-8 text-purple-400" />
                  </div>
                  <span className="bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black px-3 py-1 rounded-full uppercase">
                    Restricted Access
                  </span>
                </div>

                <h3 className="text-2xl font-black text-white mb-3">Procurement Officer Workstation</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Internal workstation for CPCL procurement officers to evaluate sealed technical & financial bids, run AI risk scoring, and maintain immutable audit logs.
                </p>

                <ul className="space-y-2.5 mb-8">
                  {[
                    'Automated Multi-Government Portal Adapter Check',
                    'AI Bid Screening & Anomaly Flags',
                    'Fair Trade Randomization Draw Engine',
                    'Full CVC Anti-Corruption Audit Trail'
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => setCurrentTab('Login')}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black py-4 rounded-xl text-sm shadow-lg shadow-purple-600/20 transition-all flex items-center justify-center space-x-2 group-hover:translate-x-0.5"
              >
                <span>Officer Secure Sign In</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* Featured Live Tenders Showcase */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-black uppercase tracking-wider mb-2">
                <FileText className="w-4 h-4" />
                <span>Current Procurement Notices</span>
              </div>
              <h2 className="text-3xl font-black text-white">Active Tenders & Invitations to Bid</h2>
            </div>
            <button
              onClick={() => setCurrentTab('Marketplace')}
              className="inline-flex items-center space-x-2 text-amber-400 hover:text-amber-300 font-extrabold text-sm transition-colors"
            >
              <span>View All Tenders in Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredTenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-mono text-slate-400 font-bold bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700">
                      {tender.code}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {tender.status}
                    </span>
                  </div>

                  <h4 className="text-white font-extrabold text-base mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                    {tender.title}
                  </h4>
                  <p className="text-slate-400 text-xs mb-4">{tender.dept}</p>

                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-6 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Estimated Value:</span>
                      <span className="font-extrabold text-amber-400 text-sm">{tender.budget}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Closing Countdown:</span>
                      <span className="font-bold text-slate-300 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{tender.deadline}</span>
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectTender(tender.id);
                  }}
                  className="w-full bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-200 font-bold py-3 rounded-xl text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>View Details & Requirements</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* Platform Key Features Grid */}
      <section id="features" className="py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-400">Anti-Corruption & Security Standards</h2>
            <p className="text-3xl font-black text-white">How CPCL Ensures Zero Corruption & Fair Play</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Portal API Adapters</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Direct verification with GSTN, MCA21, EPFO, ESIC & Udyam MSME databases in real-time.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Sealed Bid Cryptography</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Financial bids remain encrypted and completely inaccessible until technical evaluation passes.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">AI Eligibility Matrix</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Automated document parsing for turnovers, past work certificates, and solvency ratios.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-white text-base">Fair Trade Draw Engine</h3>
              <p className="text-slate-400 text-xs leading-relaxed">
                Provably fair random draw algorithm for tied L1 bids or identical scores.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-lg">
                CP
              </div>
              <div>
                <p className="font-extrabold text-white">Chennai Petroleum Corporation Limited</p>
                <p className="text-[11px] text-slate-500">Refinery House, 536, Anna Salai, Teynampet, Chennai - 600018</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-6 font-semibold text-slate-400">
              <button onClick={() => setCurrentTab('Home')} className="hover:text-amber-400">Home</button>
              <button onClick={() => setCurrentTab('Marketplace')} className="hover:text-amber-400">Active Tenders</button>
              <button onClick={() => setCurrentTab('Login')} className="hover:text-amber-400">Portal Entry</button>
              <a href="https://cpcl.co.in" target="_blank" rel="noreferrer" className="hover:text-amber-400 flex items-center space-x-1">
                <span>CPCL Official Site</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-500 gap-4">
            <p>© 2026 Chennai Petroleum Corporation Limited. Powered by GeM 10X Anti-Corruption Infrastructure.</p>
            <p className="flex items-center space-x-2">
              <span>CVC Guidelines Compliant</span>
              <span>•</span>
              <span>Central Public Procurement Portal Format</span>
            </p>
          </div>

        </div>
      </footer>

    </div>
  );
};

export default Home;
