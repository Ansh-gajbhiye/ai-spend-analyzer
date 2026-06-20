import { useState } from 'react'
import Login from './Login'
import Upload from './Upload'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  const handleLoginSuccess = (newToken) => {
    localStorage.setItem('token', newToken) 
    setToken(newToken) 
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
  }

  return (
    // The main wrapper is now a deep dark navy (slate-950)
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex">
      {!token ? (
        <div className="flex-1 flex items-center justify-center">
          <Login onLoginSuccess={handleLoginSuccess} />
        </div>
      ) : (
        <>
          {/* Sidebar Navigation */}
          <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between hidden md:flex">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-white mb-10 tracking-tight">
                Remark<span className="text-blue-500">Flow</span>
              </h1>
              
              <nav className="space-y-3">
                {/* Active Link */}
                <div className="flex items-center gap-3 bg-blue-500/10 text-blue-400 px-4 py-3 rounded-xl font-semibold cursor-pointer">
                  <span>📊</span> Dashboard
                </div>
                {/* Inactive Links */}
                <div className="flex items-center gap-3 text-slate-400 hover:text-slate-200 px-4 py-3 rounded-xl cursor-pointer transition-colors">
                  <span>💳</span> Transactions
                </div>
                <div className="flex items-center gap-3 text-slate-400 hover:text-slate-200 px-4 py-3 rounded-xl cursor-pointer transition-colors">
                  <span>🤖</span> AI Auditor
                </div>
              </nav>
            </div>

            <div className="p-6">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors font-medium border border-transparent hover:border-slate-800"
              >
                Logout
              </button>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 p-8 md:p-10 overflow-y-auto h-screen">
            <Upload token={token} />
          </main>
        </>
      )}
    </div>
  )
}

export default App