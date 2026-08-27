import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Tenders from './pages/Tenders';
import TenderDetail from './pages/TenderDetail';
import BidderList from './pages/BidderList';
import BidderDetail from './pages/BidderDetail';
import AuditLog from './pages/AuditLog';
import Login from './pages/Login';

function App() {
  const [currentTab, setCurrentTab] = useState('Dashboard');
  const [selectedTenderId, setSelectedTenderId] = useState(1);
  const [selectedBidderId, setSelectedBidderId] = useState(null);
  
  // Auth state
  const [user, setUser] = useState({
    name: 'Ananya Rao',
    email: 'ananya@cpcl.gov.in',
    role: 'Procurement Officer'
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectTender = (id) => {
    setSelectedTenderId(id);
    setCurrentTab('TenderDetail');
  };

  const handleSelectBidder = (id) => {
    setSelectedBidderId(id);
    setCurrentTab('BidderDetail');
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setCurrentTab('Dashboard');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'Login':
        return <Login onLoginSuccess={handleLoginSuccess} />;

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
        return <Dashboard setCurrentTab={setCurrentTab} onSelectTender={handleSelectTender} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        user={user}
        setUser={setUser}
      />
      <main className="pb-12">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;
