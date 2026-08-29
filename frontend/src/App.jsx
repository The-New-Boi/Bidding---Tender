import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import AiCopilotWidget from './components/AiCopilotWidget';

// Officer Pages
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import TenderDetail from './pages/TenderDetail';
import BidderList from './pages/BidderList';
import BidderDetail from './pages/BidderDetail';
import AuditLog from './pages/AuditLog';

// Public / Vendor Pages
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import TenderPublicView from './pages/TenderPublicView';

// Simple vendor dashboard placeholder
const VendorDashboard = ({ user, setCurrentTab }) => (
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
      <h1 className="text-2xl font-black text-slate-900">My Applications</h1>
      <p className="text-slate-500 text-sm mt-1">Track the status of tenders you have applied for.</p>
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-4">
      <div className="text-4xl">📋</div>
      <h3 className="font-extrabold text-amber-900 text-lg">No Applications Yet</h3>
      <p className="text-amber-700 text-sm">Browse the Tender Marketplace and apply for active tenders to track them here.</p>
      <button
        onClick={() => setCurrentTab('Marketplace')}
        className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-6 py-3 rounded-xl text-sm shadow shadow-amber-500/20 transition-all"
      >
        Browse Active Tenders →
      </button>
    </div>
  </div>
);

function App() {
  const [currentTab, setCurrentTab] = useState('Login');
  const [selectedTenderId, setSelectedTenderId] = useState(1);
  const [selectedBidderId, setSelectedBidderId] = useState(null);
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        // Route based on stored role
        if (parsed?.portalRole === 'vendor') {
          setCurrentTab('Marketplace');
        } else if (parsed?.portalRole === 'officer' || parsed?.role === 'officer') {
          setCurrentTab('Dashboard');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectTender = (id) => {
    setSelectedTenderId(id);
    const isVendor = user?.portalRole === 'vendor';
    setCurrentTab(isVendor ? 'TenderPublicView' : 'TenderDetail');
  };

  const handleSelectBidder = (id) => {
    setSelectedBidderId(id);
    setCurrentTab('BidderDetail');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.portalRole === 'vendor') {
      setCurrentTab('Marketplace');
    } else {
      setCurrentTab('Dashboard');
    }
  };

  const isVendor = user?.portalRole === 'vendor';
  const isLoggedIn = !!user;
  const isLoginPage = currentTab === 'Login';

  const renderContent = () => {
    switch (currentTab) {
      case 'Login':
        return <Login onLoginSuccess={handleLoginSuccess} />;

      // VENDOR PAGES
      case 'Marketplace':
        return <Marketplace onSelectTender={handleSelectTender} onSetCurrentTab={setCurrentTab} />;

      case 'TenderPublicView':
        return (
          <TenderPublicView
            tenderId={selectedTenderId}
            onBack={() => setCurrentTab('Marketplace')}
          />
        );

      case 'VendorDashboard':
        return <VendorDashboard user={user} setCurrentTab={setCurrentTab} />;

      // OFFICER PAGES
      case 'Dashboard':
        return <Dashboard setCurrentTab={setCurrentTab} onSelectTender={handleSelectTender} />;

      case 'Tenders':
        return <Tenders onSelectTender={handleSelectTender} />;

      case 'TenderDetail':
        return (
          <TenderDetail
            tenderId={selectedTenderId}
            onBack={() => setCurrentTab('Tenders')}
            onSelectBidder={handleSelectBidder}
          />
        );

      case 'Bidders Register':
        return <BidderList onSelectBidder={handleSelectBidder} />;

      case 'BidderDetail':
        return (
          <BidderDetail
            bidderId={selectedBidderId}
            onBack={() => setCurrentTab('Bidders Register')}
          />
        );

      case 'Audit Trail':
        return <AuditLog />;

      default:
        if (isVendor) return <Marketplace onSelectTender={handleSelectTender} onSetCurrentTab={setCurrentTab} />;
        return <Dashboard setCurrentTab={setCurrentTab} onSelectTender={handleSelectTender} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex">
      
      {/* Sidebar — only show when logged in and not on login page */}
      {isLoggedIn && !isLoginPage && (
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          setUser={setUser}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 min-w-0 transition-all duration-300 pb-16 ${isLoggedIn && !isLoginPage ? 'pl-16' : ''}`}>
        {renderContent()}
      </main>

      {/* AI Copilot — show for officer only */}
      {!isVendor && isLoggedIn && !isLoginPage && (
        <AiCopilotWidget currentTenderId={selectedTenderId} />
      )}
    </div>
  );
}

export default App;
