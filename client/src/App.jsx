import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // Function to run AI analysis – uses the current transactions
  const runAIAnalysis = async () => {
    if (!transactions.length) return;
    setAnalyzing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
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

  if (!token) {
    return (
      <div className="min-h-screen bg-zinc-900 text-white font-sans flex items-center justify-center">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-900 text-white font-sans flex">
        <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
        <main
          className={`flex-1 p-8 md:p-10 overflow-y-auto h-screen transition-all duration-300 ${
            sidebarCollapsed ? 'ml-20' : 'ml-64'
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route
                path="/"
                element={
                  <Dashboard
                    token={token}
                    transactions={transactions}
                    setTransactions={setTransactions}
                  />
                }
              />
              <Route
                path="/transactions"
                element={<Transactions transactions={transactions} />}
              />
              <Route
                path="/ai-auditor"
                element={
                  <AIAuditor
                    transactions={transactions}
                    aiQuestions={aiQuestions}
                    analyzing={analyzing}
                    runAIAnalysis={runAIAnalysis}
                  />
                }
              />
              <Route path="/docs" element={<Docs />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;