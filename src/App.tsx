import { useState, useEffect } from 'react';
import { LoginPage } from './components/LoginPage';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ProfilePage } from './components/ProfilePage';
import { EventsPage } from './components/EventsPage';
import { FundraisersPage } from './components/FundraisersPage';
import { AdminDashboard } from './components/AdminDashboard';
import { ChatPage } from './components/ChatPage';
import { SearchPage } from './components/SearchPage';
import { fallbackDatabase as mongoDatabase } from './lib/fallbackDatabase';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [dbStatus, setDbStatus] = useState<any>(null);

  useEffect(() => {
    // Check MongoDB connection status on app load
    const checkConnection = async () => {
      try {
        const status = await mongoDatabase.getConnectionStatus();
        setDbStatus(status);
      } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        setDbStatus({ connected: false, error: error.message });
      }
    };
    
    checkConnection();
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentPage(userData.role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const handleUpdateUser = (updatedUser: any) => {
    setUser(updatedUser);
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard user={user} onNavigate={handleNavigate} />;
      case 'profile':
        return <ProfilePage user={user} onUpdateUser={handleUpdateUser} />;
      case 'events':
        return <EventsPage user={user} />;
      case 'fundraisers':
        return <FundraisersPage user={user} />;
      case 'admin':
        return <AdminDashboard user={user} />;
      case 'chat':
        return <ChatPage user={user} />;
      case 'search':
        return <SearchPage user={user} />;
      default:
        return <Dashboard user={user} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* MongoDB Connection Status Bar */}
      {dbStatus && (
        <div className={`px-4 py-2 text-center ${
          dbStatus.connected 
            ? 'bg-green-100 text-green-800 border-b border-green-200' 
            : 'bg-yellow-100 text-yellow-800 border-b border-yellow-200'
        }`}>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              dbStatus.connected ? 'bg-green-500' : 'bg-yellow-500'
            }`}></div>
            <span className="font-medium">
              {dbStatus.connected 
                ? `🗄️ MongoDB Active: ${dbStatus.info.database}` 
                : '⚠️ MongoDB Initializing...'}
            </span>
            {dbStatus.connected && (
              <span className="text-xs opacity-75">
                • Mode: {dbStatus.info.mode} • Collections: {dbStatus.info.collections.join(', ')}
              </span>
            )}
          </div>
        </div>
      )}
      
      <Header 
        user={user} 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        onLogout={handleLogout} 
      />
      {renderCurrentPage()}
    </div>
  );
}