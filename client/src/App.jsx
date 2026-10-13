import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Login from './Login';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AIAuditor from './pages/AIAuditor';
import Docs from './pages/Docs';
import Settings from './pages/Settings';
import './index.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

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

  const runAIAnalysis = async () => {
    if (!transactions.length) return;
    setAnalyzing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ transactions }),
      });
      const result = await response.json();
      setAiQuestions(result.analysis);
    } catch (error) {
      console.error('AI Analysis error:', error);
      alert('AI failed to analyze. Check your backend console!');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-900 text-white font-sans flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

        <div className="fixed top-4 right-6 z-50">
          {token ? (
            <button onClick={handleLogout} className="text-sm text-zinc-300 hover:text-white">
              Log out
            </button>
          ) : (
            <Link
              to="/login"
              title="Sign up to save your data"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
          )}
        </div>

        <main
          className={`flex-1 p-8 md:p-10 overflow-y-auto h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard token={token} transactions={transactions} setTransactions={setTransactions} />} />
              <Route path="/transactions" element={<Transactions transactions={transactions} />} />
              <Route path="/ai-auditor" element={<AIAuditor transactions={transactions} aiQuestions={aiQuestions} analyzing={analyzing} runAIAnalysis={runAIAnalysis} />} />
              <Route path="/docs" element={<Docs />} />
              <Route path="/settings" element={<Settings />} />
              <Route
                path="/login"
                element={
                  <div className="flex items-center justify-center min-h-[80vh]">
                    <Login onLoginSuccess={handleLoginSuccess} />
                  </div>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;