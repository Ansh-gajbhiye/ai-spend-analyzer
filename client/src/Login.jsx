import { useState } from 'react'

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@remarkflow.com')
  const [password, setPassword] = useState('MySecurePassword123')
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Success! Pass the token back to App.jsx
        onLoginSuccess(data.token) 
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Cannot connect to server. Is your backend running?')
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', maxWidth: '300px' }}>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label><br />
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label><br />
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <button type="submit">Enter Vault</button>
      </form>
    </div>
  )
}

export default Login