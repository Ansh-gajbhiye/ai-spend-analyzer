import { useState } from 'react';

function App() {
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [aiQuestions, setAiQuestions] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('statement', file);

    try {
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setTransactions(result.data);
      setAiQuestions([]); 
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

  const totalDebit = transactions
    .filter(t => parseFloat(t.Amount) < 0)
    .reduce((sum, t) => sum + Math.abs(parseFloat(t.Amount)), 0);

  const totalCredit = transactions
    .filter(t => parseFloat(t.Amount) > 0)
    .reduce((sum, t) => sum + parseFloat(t.Amount), 0);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Personal Wealth Dashboard</h1>
      
      <form onSubmit={handleUpload} style={{ marginBottom: '30px' }}>
        <input type="file" accept=".csv" onChange={handleFileChange} required />
        <button type="submit" disabled={loading}>
          {loading ? "Parsing Statement..." : "Load Data"}
        </button>
      </form>

      {transactions.length > 0 && (
        <div>
         
          <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#666' }}>Total Money Out</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#e74c3c' }}>₹{totalDebit.toLocaleString()}</h2>
            </div>
            <div style={{ flex: 1, padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
              <p style={{ margin: 0, color: '#666' }}>Total Money In</p>
              <h2 style={{ margin: '5px 0 0 0', color: '#2ecc71' }}>₹{totalCredit.toLocaleString()}</h2>
            </div>
          </div>

          <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>AI Auditor</h3>
            <p>Let Gemini analyze your spending and flag suspicious transactions.</p>
            <button 
              onClick={runAIAnalysis} 
              disabled={analyzing}
              style={{ padding: '10px 20px', background: '#000', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
            >
              {analyzing ? "Gemini is thinking..." : "Run AI Audit"}
            </button>

            {aiQuestions && aiQuestions.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h4 style={{ color: '#e74c3c' }}>Flagged by AI:</h4>
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                  {aiQuestions.map((q, idx) => (
                    <li key={idx} style={{ background: '#fff', padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '5px' }}>
                      <strong>{q.date} - {q.description} (₹{q.amount})</strong>
                      <p style={{ margin: '5px 0 0 0', color: '#555' }}>🤖 {q.question}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <h3>All Transactions</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', textAlign: 'left' }}>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Date</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Description</th>
                <th style={{ padding: '12px', borderBottom: '1px solid #ddd' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, idx) => {
                const amt = parseFloat(t.Amount);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '12px' }}>{t.Date}</td>
                    <td style={{ padding: '12px' }}>{t.Description}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: amt < 0 ? '#e74c3c' : '#2ecc71' }}>
                      {amt < 0 ? `-₹${Math.abs(amt)}` : `+₹${amt}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;