import { useState } from 'react'
import Login from './Login'
import Upload from './Upload'

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
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {!token ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div>
          <button onClick={handleLogout} style={{ marginBottom: '20px', padding: '10px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Logout</button>
          <Upload token={token} />
        </div>
      )}
    </div>
  )
}

export default App