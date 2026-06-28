import { useState } from 'react';
import Login from './Login';
import Upload from './Upload';
import './index.css';
import Sidebar from './components/Sidebar';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken('');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-zinc-900 font-sans flex">
      {!token ? (
        <div className="flex-1 flex items-center justify-center">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <>
          <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
          <main
            className={`flex-1 p-8 md:p-10 overflow-y-auto h-screen transition-all duration-300 ${
              sidebarCollapsed ? 'ml-20' : 'ml-64'
            }`}
          >
            <div className="max-w-6xl mx-auto">
              <Upload token={token} />
            </div>
          </main>
        </>
      )}
    </div>
  );
}

export default App;