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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/upload`, {
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transactions }),
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

  const totalBalance = totalCredit - totalDebit;

  const monthlySpend = totalDebit;
  const averageSpend = transactions.length > 0 ? totalDebit / Math.ceil(totalDebit / 3800) : 3800;
  const safeToSpend = Math.max(0, totalBalance * 0.2);

  // --- MONTHLY DATA ---
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

  // --- CATEGORY DATA ---
  const CATEGORIES = {
    Food: ['zomato', 'swiggy', 'restaurant', 'cafe'],
    Transport: ['uber', 'ola', 'metro', 'fuel', 'rail'],
    Bills: ['airtel', 'netflix', 'amazon', 'electricity', 'google'],
  };
  const PIE_COLORS = ['#fde047', '#a855f7', '#3b82f6', '#ec4899'];

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

  const formatCurrency = (value) => {
    if (value === 0) return '₹0.00';
    return `₹${Math.abs(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full max-w-6xl mx-auto pb-10">
      {/* Header & Upload */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-white tracking-tight">My Dashboard</h2>
        <form onSubmit={handleUpload} className="flex items-center gap-3 md:flex-1 md:justify-end">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            required
            className="block flex-1 md:flex-none text-sm text-zinc-300 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border file:border-zinc-700 file:text-sm file:font-medium file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg shadow-md transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {loading ? 'Loading...' : 'Load Data'}
          </button>
        </form>
      </div>

      {transactions.length > 0 && (
        <div className="space-y-6">
          {/* ROW 1: Four Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <p className="text-zinc-400 text-sm font-medium mb-2">Total Cash</p>
              <h3 className="text-3xl font-semibold text-white">
                {formatCurrency(totalBalance)}
              </h3>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <p className="text-zinc-400 text-sm font-medium mb-2">Monthly Spend</p>
              <h3 className="text-3xl font-semibold text-rose-400">
                {monthlySpend === 0 ? '₹0.00' : `-${formatCurrency(monthlySpend)}`}
              </h3>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <p className="text-zinc-400 text-sm font-medium mb-2">Average Spend</p>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-semibold text-white">
                  {formatCurrency(averageSpend)}
                </h3>
                <span className="text-teal-400 text-xs font-semibold">↑ 12%</span>
              </div>
              <p className="text-zinc-500 text-xs mt-1">/ month</p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <p className="text-zinc-400 text-sm font-medium mb-2">Safe to Spend</p>
              <h3 className="text-3xl font-semibold text-teal-400">
                {formatCurrency(safeToSpend)}
              </h3>
            </div>
          </div>

          {/* ROW 2: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Flow */}
            <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-white mb-6">Revenue Flow</h3>
              <div className="h-80 w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4">
                {transactions.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid stroke="#3f3f46" strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        stroke="#a1a1aa"
                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        stroke="#a1a1aa"
                        tick={{ fill: '#a1a1aa', fontSize: 12 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: '#27272a',
                          borderColor: '#3f3f46',
                          color: '#f4f4f5',
                          borderRadius: '0.75rem',
                        }}
                      />
                      <Bar dataKey="Income" fill="#c084fc" radius={[6, 6, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-zinc-500 text-center text-sm">Upload a bank statement to generate analytics</p>
                )}
              </div>
            </div>

            {/* Expense Split */}
            <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-bold text-white mb-6">Expense Split</h3>
              <div className="h-80 w-full bg-zinc-900 border border-zinc-700 rounded-xl flex items-center justify-center">
                {transactions.length > 0 ? (
                  <div className="flex items-center justify-between w-full h-full p-6">
                    <div className="w-1/2 h-48 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={75}
                            paddingAngle={4}
                            dataKey="value"
                            stroke="none"
                          >
                            {categoryData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <RechartsTooltip
                            formatter={(value) => `₹${value.toLocaleString()}`}
                            contentStyle={{
                              backgroundColor: '#27272a',
                              borderColor: '#3f3f46',
                              borderRadius: '0.75rem',
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-1/2 pl-6 space-y-4">
                      {categoryData.map((cat, idx) => {
                        const percentage = totalDebit > 0 ? ((cat.value / totalDebit) * 100).toFixed(0) : '0';
                        return (
                          <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                              />
                              <span className="text-zinc-300 text-sm font-medium">{cat.name}</span>
                            </div>
                            <span className="text-white text-sm font-semibold">{percentage}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center text-sm">Upload a bank statement to generate analytics</p>
                )}
              </div>
            </div>
          </div>

          {/* ROW 3: AI Auditor & Recent Transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* AI Review Panel */}
            <div className="lg:col-span-1 bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm relative overflow-hidden flex flex-col">
              <h3 className="text-lg font-bold text-white mb-2">Transactions to review</h3>
              <p className="text-sm text-zinc-400 mb-6">Unlock Gemini intelligence to flag suspicious spending.</p>
              <button
                onClick={runAIAnalysis}
                disabled={analyzing}
                className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 text-white font-medium rounded-lg border border-zinc-600 transition-colors mb-6 disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Unlock Intelligence'}
              </button>
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[300px]">
                {aiQuestions.map((q, idx) => (
                  <div key={idx} className="bg-zinc-900 p-4 rounded-lg border border-zinc-700">
                    <div className="flex justify-between items-start mb-2">
                      <strong className="text-zinc-200 text-sm">{q.description}</strong>
                      <span className="text-rose-400 text-sm font-semibold">₹{q.amount}</span>
                    </div>
                    <p className="text-zinc-400 text-xs italic">"{q.question}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="lg:col-span-2 bg-zinc-800 border border-zinc-700 p-6 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-white">Recent transactions</h3>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-zinc-700">
                    {transactions.map((t, idx) => {
                      const amt = parseFloat(t.amount !== undefined ? t.amount : t.Amount);
                      const isNegative = amt < 0;
                      return (
                        <tr key={idx} className="hover:bg-zinc-700/50 transition-colors">
                          <td className="py-4 pr-4 whitespace-nowrap text-sm text-zinc-400">{t.date || t.Date}</td>
                          <td className="py-4 px-4 text-sm text-zinc-200 font-medium">{t.description || t.Description}</td>
                          <td className={`py-4 pl-4 whitespace-nowrap text-sm font-semibold text-right ${isNegative ? 'text-rose-400' : 'text-emerald-400'}`}>
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