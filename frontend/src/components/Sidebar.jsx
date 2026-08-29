import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  ShieldCheck, 
  LogOut, 
  Pin, 
  PinOff, 
  Sparkles,
  Lock,
  Building2,
  ChevronRight,
  Store,
  History,
  User,
  BadgeCheck
} from 'lucide-react';
import { logoutUser } from '../api/client';

const Sidebar = ({ currentTab, setCurrentTab, user, setUser }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);

  const isOpen = isHovered || isPinned;
  const isVendor = user?.portalRole === 'vendor';
  const isOfficer = user?.portalRole === 'officer' || (user?.role === 'officer' && !user?.portalRole);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    setCurrentTab('Login');
  };

  // VENDOR NAV ITEMS
  const vendorNavItems = [
    { name: 'Tender Marketplace', id: 'Marketplace', icon: Store },
    { name: 'My Applications', id: 'VendorDashboard', icon: User },
  ];

  // OFFICER NAV ITEMS  
  const officerNavItems = [
    { name: 'Dashboard', id: 'Dashboard', icon: LayoutDashboard },
    { name: 'Tenders Pipeline', id: 'Tenders', icon: FileText },
    { name: 'Bidders Register', id: 'Bidders Register', icon: Users },
    { name: 'Audit Trail', id: 'Audit Trail', icon: ShieldCheck },
  ];

  const navItems = isVendor ? vendorNavItems : officerNavItems;

  return (
    <aside
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-0 left-0 bottom-0 z-50 text-white border-r shadow-2xl transition-all duration-300 ease-in-out flex flex-col justify-between ${
        isVendor 
          ? 'bg-amber-950 border-amber-900/60' 
          : 'bg-slate-950 border-slate-800/80'
      } ${isOpen ? 'w-64' : 'w-16'}`}
    >
      {/* Top Header & Logo */}
      <div className="p-3">
        <div className="flex items-center justify-between">
          <div 
            onClick={() => setCurrentTab(isVendor ? 'Marketplace' : (user ? 'Dashboard' : 'Login'))} 
            className="flex items-center space-x-3 cursor-pointer overflow-hidden select-none"
          >
            <div className="h-10 w-10 min-w-[40px] rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
              CP
            </div>

            {isOpen && (
              <div className="whitespace-nowrap transition-opacity duration-200 opacity-100">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">GeM 10X Portal</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                    isVendor 
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                      : 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                  }`}>
                    {isVendor ? 'VENDOR' : 'OFFICER'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">CPCL Refinery Division</p>
              </div>
            )}
          </div>

          {isOpen && (
            <button
              onClick={() => setIsPinned(!isPinned)}
              title={isPinned ? "Unpin sidebar" : "Pin sidebar open"}
              className="text-slate-400 hover:text-amber-400 p-1.5 rounded-lg hover:bg-slate-900/50 transition-colors"
            >
              {isPinned ? <PinOff className="w-4 h-4 text-amber-400" /> : <Pin className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Role indicator when open */}
        {isOpen && (
          <div className={`mt-4 p-2.5 rounded-xl text-[11px] flex items-center justify-between ${
            isVendor 
              ? 'bg-amber-900/40 border border-amber-800 text-amber-200'
              : 'bg-slate-900/90 border border-slate-800 text-slate-300'
          }`}>
            {isVendor ? (
              <>
                <div className="flex items-center space-x-2">
                  <Store className="w-3.5 h-3.5 text-amber-400" />
                  <span className="font-medium">Vendor Portal</span>
                </div>
                <BadgeCheck className="w-3.5 h-3.5 text-amber-400" />
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="font-medium text-slate-300">Officer Workstation</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
              </>
            )}
          </div>
        )}
      </div>

      {/* Main Navigation Links */}
      <div className="px-2 py-4 flex-1 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold shadow-lg shadow-amber-500/20'
                  : isVendor
                  ? 'text-amber-200/70 hover:text-white hover:bg-amber-900/50'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className={`w-5 h-5 min-w-[20px] transition-transform group-hover:scale-110 ${
                isActive ? 'text-slate-950' : isVendor ? 'text-amber-400' : 'text-slate-400 group-hover:text-amber-400'
              }`} />
              
              {isOpen && (
                <div className="flex items-center justify-between w-full overflow-hidden whitespace-nowrap">
                  <span className="text-sm">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 text-slate-950 ml-1" />}
                </div>
              )}
            </button>
          );
        })}

        {/* Divider & Switch Role */}
        {isOpen && (
          <div className="pt-4 mt-4 border-t border-slate-800/60">
            <button
              onClick={() => setCurrentTab('Login')}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 transition-all"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              <span>Switch Role / Portal</span>
            </button>
          </div>
        )}
      </div>

      {/* Bottom User Profile Section */}
      <div className={`p-3 border-t ${isVendor ? 'border-amber-900/60 bg-amber-950/40' : 'border-slate-800/80 bg-slate-900/40'}`}>
        {user ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className={`h-9 w-9 min-w-[36px] rounded-xl border flex items-center justify-center font-extrabold text-xs shadow ${
                isVendor ? 'bg-amber-900 border-amber-700/40 text-amber-300' : 'bg-slate-800 border-amber-500/40 text-amber-400'
              }`}>
                {user.name ? user.name.split(' ').map(n => n[0]).join('') : isVendor ? 'V' : 'AR'}
              </div>

              {isOpen && (
                <div className="overflow-hidden whitespace-nowrap">
                  <div className="text-xs font-bold text-slate-200 truncate">{user.name || (isVendor ? 'Vendor User' : 'Ananya Rao')}</div>
                  <div className="text-[10px] text-amber-400 capitalize font-medium">{isVendor ? 'Vendor Access' : (user.role || 'Procurement Officer')}</div>
                </div>
              )}
            </div>

            {isOpen && (
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-slate-800 transition-colors ml-1"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={() => setCurrentTab('Login')}
            className={`w-full bg-amber-500 hover:bg-amber-400 text-slate-950 py-2.5 rounded-xl text-xs font-extrabold shadow-md shadow-amber-500/20 transition-all flex items-center justify-center ${!isOpen && 'px-0'}`}
          >
            {isOpen ? 'Sign In' : 'In'}
          </button>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
