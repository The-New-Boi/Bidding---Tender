import React, { useState } from 'react';
import { loginUser } from '../api/client';
import { Building2, User, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

const Login = ({ onLoginSuccess }) => {
  const [role, setRole] = useState(''); // 'officer' | 'vendor'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleOfficerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      onLoginSuccess({ ...data.user, portalRole: 'officer' });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid login credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVendorContinue = () => {
    // Vendor logs in as guest / with basic credentials
    onLoginSuccess({
      name: 'Vendor User',
      email: email || 'vendor@company.com',
      role: 'vendor',
      portalRole: 'vendor',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
        backgroundSize: '40px 40px'
      }}></div>

      <div className="relative w-full max-w-4xl">

        {/* Header Branding */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black text-2xl shadow-2xl shadow-amber-500/30 mb-4">
            CP
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">GeM 10X Procurement Portal</h1>
          <p className="text-slate-400 text-sm mt-2 flex items-center justify-center space-x-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered Tender Intelligence & Anti-Corruption Platform — CPCL Refinery Division</span>
          </p>
        </div>

        {/* Role Selector — Step 1 */}
        {!role && (
          <div className="space-y-4">
            <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest mb-6">
              Select Your Role to Continue
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* VENDOR CARD */}
              <button
                onClick={() => setRole('vendor')}
                className="group relative bg-slate-900 border border-slate-700 hover:border-amber-500/60 rounded-3xl p-8 text-left transition-all hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:bg-amber-500/20 transition-colors">
                  <User className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-white font-extrabold text-xl mb-2">Vendor / Supplier</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Browse active tenders, check eligibility requirements, track application status, and view past awarded contracts.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Browse Tenders', 'Apply Online', 'Track Status', 'Past Awards'].map(tag => (
                    <span key={tag} className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center text-amber-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Continue as Vendor</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              {/* OFFICER CARD */}
              <button
                onClick={() => setRole('officer')}
                className="group relative bg-slate-900 border border-slate-700 hover:border-purple-500/60 rounded-3xl p-8 text-left transition-all hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5 group-hover:bg-purple-500/20 transition-colors">
                  <ShieldCheck className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-white font-extrabold text-xl mb-2">Procurement Officer</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  Access the internal evaluation workstation, manage sealed bids, run AI scoring, and maintain audit trail.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Evaluation Workstation', 'Sealed Bids', 'AI Scoring', 'Audit Trail'].map(tag => (
                    <span key={tag} className="text-[11px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full border border-slate-700">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center text-purple-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
                  <span>Sign In as Officer</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>

            </div>
          </div>
        )}

        {/* VENDOR — Quick Access (no password needed for browse) */}
        {role === 'vendor' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-3xl p-8 space-y-6">
            <button onClick={() => setRole('')} className="text-slate-400 hover:text-white text-xs flex items-center space-x-1 transition-colors">
              <span>← Back</span>
            </button>
            <div>
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <User className="w-6 h-6 text-amber-400" />
              </div>
              <h2 className="text-white font-extrabold text-2xl">Vendor Portal Access</h2>
              <p className="text-slate-400 text-sm mt-1">Browse all active tenders and past awards — no login required.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Company Email (Optional)</label>
                <input
                  type="email"
                  placeholder="vendor@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              onClick={handleVendorContinue}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all"
            >
              Enter Vendor Portal →
            </button>

            <p className="text-center text-xs text-slate-500">
              Already registered? Track your application status after entering your company email.
            </p>
          </div>
        )}

        {/* OFFICER — Secure Login */}
        {role === 'officer' && (
          <div className="max-w-md mx-auto bg-slate-900 border border-slate-700 rounded-3xl p-8 space-y-6">
            <button onClick={() => setRole('')} className="text-slate-400 hover:text-white text-xs flex items-center space-x-1 transition-colors">
              <span>← Back</span>
            </button>
            <div>
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6 text-purple-400" />
              </div>
              <h2 className="text-white font-extrabold text-2xl">Officer Secure Login</h2>
              <p className="text-slate-400 text-sm mt-1">Restricted to authorized CPCL procurement officers.</p>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-700 text-red-400 px-4 py-3 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleOfficerLogin} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Official Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="ananya@cpcl.gov.in"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-500">
                Demo: ananya@cpcl.gov.in / admin123
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3.5 rounded-xl text-sm shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Access Officer Workstation →'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;
