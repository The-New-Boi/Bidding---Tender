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
import Home from './pages/Home';
import Login from './pages/Login';
import Marketplace from './pages/Marketplace';
import TenderPublicView from './pages/TenderPublicView';
import VendorDashboard from './pages/VendorDashboard';
import VendorProfile from './pages/VendorProfile';
import VendorEmd from './pages/VendorEmd';
import VendorContracts from './pages/VendorContracts';

function App() {
  const [currentTab, setCurrentTab] = useState('Home');
  const [selectedTenderId, setSelectedTenderId] = useState(1);
  const [selectedBidderId, setSelectedBidderId] = useState(null);
  
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectTender = (id) => {
    setSelectedTenderId(id);
    // Internal officer workstation tabs open Officer TenderDetail view
    if (currentTab === 'Dashboard' || currentTab === 'Tenders') {
      setCurrentTab('TenderDetail');
    } else {
      // Public browsing from Home or Marketplace opens Public Notice view
      setCurrentTab('TenderPublicView');
    }
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
  const isStandalonePage = currentTab === 'Home' || currentTab === 'Login';

  const renderContent = () => {
    switch (currentTab) {
      case 'Home':
        return <Home setCurrentTab={setCurrentTab} onSelectTender={handleSelectTender} />;

      case 'Login':
        return <Login onLoginSuccess={handleLoginSuccess} onBackToHome={() => setCurrentTab('Home')} />;

      // VENDOR PAGES
      case 'Marketplace':
        return <Marketplace user={user} onSelectTender={handleSelectTender} onSetCurrentTab={setCurrentTab} />;

      case 'TenderPublicView':
        return (
          <TenderPublicView
            tenderId={selectedTenderId}
            onBack={() => setCurrentTab('Marketplace')}
          />
        );

      case 'VendorDashboard':
        return <VendorDashboard user={user} setCurrentTab={setCurrentTab} onSelectTender={handleSelectTender} />;

      case 'VendorProfile':
        return <VendorProfile />;

      case 'VendorEmd':
        return <VendorEmd />;

      case 'VendorContracts':
        return <VendorContracts />;

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
        return <Home setCurrentTab={setCurrentTab} onSelectTender={handleSelectTender} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 flex">
      
      {/* Sidebar — show when logged in and not on standalone landing/login pages */}
      {isLoggedIn && !isStandalonePage && (
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          user={user}
          setUser={setUser}
        />
      )}

      {/* Main Content */}
      <main className={`flex-1 min-w-0 transition-all duration-300 ${isLoggedIn && !isStandalonePage ? 'pl-16' : ''}`}>
        {renderContent()}
      </main>

      {/* AI Copilot — show for logged-in officers on workstation pages */}
      {!isVendor && isLoggedIn && !isStandalonePage && (
        <AiCopilotWidget currentTenderId={selectedTenderId} />
      )}
    </div>
  );
}

export default App;
