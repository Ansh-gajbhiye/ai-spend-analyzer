import { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

function Upload({ token }) {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('statement', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      const result = await response.json();
      
      if (response.ok) {
         setTransactions(result.data || []); 
         setAiQuestions([]); 
      } else {
         alert("Upload failed: " + result.error);
      }
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const response = await fetch('http://localhost:3000/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transactions: transactions }), 
      });
      const result = await response.json();
      setAiQuestions(result.analysis);
    } catch (error) {
      console.error("AI Analysis error:", error);
      alert("AI failed to analyze. Check your backend console!");
    } finally {
      setAnalyzing(false);
    }
  };

  // --- MATH ENGINE ---
  const totalDebit = transactions
    .filter(t => parseFloat(t.amount || t.Amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.amount || t.Amount)), 0);

  const totalCredit = transactions
    .filter(t => parseFloat(t.amount || t.Amount) > 0)
    .reduce((sum, t) => sum + parseFloat(t.amount || t.Amount), 0);

  // NEW: Calculate Total Balance
  const totalBalance = totalCredit - totalDebit;

  // --- DATA AGGREGATION ENGINE ---
  const monthlyData = Object.values(transactions.reduce((acc, t) => {
    const amt = parseFloat(t.amount !== undefined ? t.amount : t.Amount);
    const dateStr = t.date || t.Date || '';
    const parts = dateStr.split('/');
    const monthYear = parts.length === 3 ? `${parts[1]}/${parts[2]}` : dateStr.substring(0, 7);
    
    if (!acc[monthYear]) acc[monthYear] = { name: monthYear, Income: 0, Expense: 0 };
    if (amt > 0) acc[monthYear].Income += amt;
    else acc[monthYear].Expense += Math.abs(amt);
    return acc;
  }, {}));

  const CATEGORIES = {
    Food: ['zomato', 'swiggy', 'restaurant', 'cafe'],
    Transport: ['uber', 'ola', 'metro', 'fuel', 'rail'],
    Bills: ['airtel', 'netflix', 'amazon', 'electricity', 'google'],
  };
  const PIE_COLORS = ['#fde047', '#a855f7', '#3b82f6', '#ec4899']; // Updated colors to match image

  const categoryData = Object.entries(transactions.reduce((acc, t) => {
    const amt = parseFloat(t.amount !== undefined ? t.amount : t.Amount);
    if (amt >= 0) return acc; 
    
    const desc = (t.description || t.Description || '').toLowerCase();
    let foundCategory = 'Other';
    
    for (const [cat, keywords] of Object.entries(CATEGORIES)) {
      if (keywords.some(kw => desc.includes(kw))) { foundCategory = cat; break; }
    }
    acc[foundCategory] = (acc[foundCategory] || 0) + Math.abs(amt);
    return acc;
  }, {})).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      {/* Top Header & Upload */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
        <h2 className="text-3xl font-bold text-white mb-4 md:mb-0 tracking-tight">My Dashboard</h2>
        <form onSubmit={handleUpload} className="flex items-center gap-3">
          <input 
            type="file" accept=".csv" onChange={handleFileChange} required 
            className="block w-full text-sm text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-slate-800 file:text-slate-300 hover:file:bg-slate-700 cursor-pointer transition-colors"
          />
          <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black font-semibold rounded-xl shadow-lg hover:bg-slate-200 transition-colors disabled:opacity-50">
            {loading ? "Loading..." : "Load Data"}
          </button>
        </form>
      </div>

      {transactions.length > 0 && (
        <div className="space-y-6 animate-fade-in-up">
          
          {/* ROW 1: The Top Cards (Balance, Income, Expense) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Main Balance Card (Neon Green Gradient) */}
            <div className="lg:col-span-2 bg-gradient-to-br from-emerald-200 via-green-300 to-emerald-500 p-8 rounded-[2rem] shadow-xl flex flex-col justify-between relative overflow-hidden">
              {/* Decorative faint circle in background */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white opacity-20 rounded-full blur-2xl"></div>
              
              <div>
                <p className="text-emerald-900 font-semibold mb-2">Total balance</p>
                <h2 className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight mb-2">
                  ₹{totalBalance.toLocaleString()}
                </h2>
                <p className="text-emerald-800 text-sm font-medium">Updated from latest statement</p>
              </div>
            </div>

            {/* Income & Expense Stack */}
            <div className="flex flex-col gap-6">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl flex-1 flex flex-col justify-center">
                <p className="text-slate-400 font-medium mb-1">Income</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-bold text-white">+₹{totalCredit.toLocaleString()}</h3>
                </div>
              </div>
              
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl flex-1 flex flex-col justify-center">
                <p className="text-slate-400 font-medium mb-1">Expense</p>
                <div className="flex items-center gap-3">
                  <h3 className="text-3xl font-bold text-white">-₹{totalDebit.toLocaleString()}</h3>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: The Charts (Side by Side) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Revenue Flow (Bar Chart) */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
              <h3 className="text-lg font-bold text-white mb-6">Revenue flow</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{fill: '#1e293b'}} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc', borderRadius: '1rem' }} />
                    <Bar dataKey="Income" fill="#c084fc" radius={[6, 6, 6, 6]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Split (Donut Chart) */}
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2">Expense split</h3>
              <div className="flex-1 flex items-center justify-between">
                
                {/* The Donut */}
                <div className="w-1/2 h-48 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => `₹${value.toLocaleString()}`} contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem' }}/>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Text inside the Donut */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-slate-400 text-xs">Total</span>
                     <span className="text-white font-bold text-lg">₹{totalDebit.toLocaleString()}</span>
                  </div>
                </div>

                {/* The Legend List */}
                <div className="w-1/2 pl-4 space-y-4">
                  {categoryData.map((cat, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-6 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}></div>
                        <span className="text-slate-300 text-sm font-medium">{cat.name}</span>
                      </div>
                      <span className="text-white text-sm font-bold">₹{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* ROW 3: AI Auditor & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* AI Review Panel */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
              <h3 className="text-lg font-bold text-white mb-2">Transactions to review</h3>
              <p className="text-sm text-slate-400 mb-6">Unlock Gemini intelligence to flag suspicious spending.</p>
              
              <button onClick={runAIAnalysis} disabled={analyzing} className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors mb-6 disabled:opacity-50">
                {analyzing ? "Analyzing..." : "Unlock Intelligence"}
              </button>

              <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                {aiQuestions.map((q, idx) => (
                  <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-slate-200 text-sm">{q.description}</strong>
                      <span className="text-red-400 text-sm font-semibold">₹{q.amount}</span>
                    </div>
                    <p className="text-slate-400 text-xs italic">"{q.question}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Recent transactions</h3>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-slate-800/50">
                    {transactions.map((t, idx) => {
                      const amt = parseFloat(t.amount !== undefined ? t.amount : t.Amount);
                      const isNegative = amt < 0;
                      return (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 pr-4 whitespace-nowrap text-sm text-slate-400">{t.date || t.Date}</td>
                          <td className="py-4 px-4 text-sm text-slate-200 font-medium">{t.description || t.Description}</td>
                          <td className={`py-4 pl-4 whitespace-nowrap text-sm font-semibold text-right ${isNegative ? 'text-white' : 'text-emerald-400'}`}>
                            {isNegative ? `-₹${Math.abs(amt)}` : `+₹${amt}`}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

export default Upload;