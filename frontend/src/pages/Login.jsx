import React, { useState } from 'react';
import { loginUser } from '../api/client';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('ananya@cpcl.gov.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await loginUser(email, password);
      onLoginSuccess(data.user);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Invalid login credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div>
          <div className="mx-auto h-16 w-16 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/30">
            CP
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
            Sign in to CPCL Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            GeM Tender AI Compliance & Anti-Corruption Workstation
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Official Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3.5 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                placeholder="ananya@cpcl.gov.in"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 uppercase tracking-wider">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3.5 py-2.5 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
            <p className="font-semibold text-slate-800">Demo Login Credentials:</p>
            <p><span className="font-medium text-slate-900">Email:</span> ananya@cpcl.gov.in</p>
            <p><span className="font-medium text-slate-900">Password:</span> admin123</p>
            <p><span className="font-medium text-slate-900">Role:</span> Procurement Officer (CPCL Refinery)</p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-slate-950 bg-amber-500 hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In as Officer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
