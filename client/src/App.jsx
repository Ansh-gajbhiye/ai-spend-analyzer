import { useState } from 'react';

function App() {
  // 1. Memory Storage: React needs a place to remember the file and the returned data
  const [file, setFile] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // 2. The File Catcher: Updates React's memory when a user selects a file
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 3. The Hijacker: Stops the default reload and sends the data secretly
  const handleUpload = async (e) => {
    e.preventDefault(); // STOP the page from reloading!

    if (!file) {
      alert("Please select a file first!");
      return;
    }

    setLoading(true);

    // Pack the file into a virtual box that the backend can understand
    const formData = new FormData();
    formData.append('statement', file); // 'statement' MUST match your backend upload.single('statement')

    try {
      // Send the virtual box to the backend
      const response = await fetch('http://localhost:3000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      // Save the cleaned data to React's memory so we can show it on screen
      setTransactions(result.data);
      console.log("Success:", result);

    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Something went wrong. Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>AI Spend Analyzer</h2>
      
      {/* Notice we removed the 'action' and 'method'. React controls it now via onSubmit */}
      <form onSubmit={handleUpload}>
        <input 
          type="file" 
          name="statement" 
          accept=".csv" 
          onChange={handleFileChange} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Upload File"}
        </button>
      </form>

      {/* 4. The UI: If we have transactions in memory, draw them on the screen! */}
      {transactions.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h3>Raw Data Successfully Parsed:</h3>
          <pre style={{ background: '#f4f4f4', padding: '10px', borderRadius: '5px' }}>
            {JSON.stringify(transactions, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default App;