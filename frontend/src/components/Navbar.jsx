import React from 'react';
import { logoutUser } from '../api/client';

const Navbar = ({ currentTab, setCurrentTab, user, setUser }) => {
  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentTab('Login');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab(user ? 'Dashboard' : 'Login')}>
            <div className="h-10 w-10 rounded-xl bg-amber-500 flex items-center justify-center font-extrabold text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              CP
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white">GeM Bid Compliance Copilot</span>
                <span className="bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  CPCL AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Refinery Tender Intelligence & Anti-Corruption Platform</p>
            </div>
          </div>

          {/* Navigation Links */}
          {user && (
            <div className="hidden md:flex items-center space-x-1">
              {[
                { name: 'Dashboard', id: 'Dashboard' },
                { name: 'Tenders Pipeline', id: 'Tenders' },
                { name: 'Bidders Register', id: 'Bidders Register' },
                { name: 'Audit Trail', id: 'Audit Trail' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-semibold shadow-md shadow-amber-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          )}

          {/* Right Section: User Profile & Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5">
                <div className="h-8 w-8 rounded-full bg-slate-700 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold text-xs">
                  {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'AR'}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold text-slate-200">{user.name || 'Ananya Rao'}</div>
                  <div className="text-[10px] text-amber-400 capitalize">{user.role || 'Procurement Officer'}</div>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-slate-400 hover:text-red-400 font-medium ml-2 pl-2 border-l border-slate-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setCurrentTab('Login')}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-amber-500/20 transition-all"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
