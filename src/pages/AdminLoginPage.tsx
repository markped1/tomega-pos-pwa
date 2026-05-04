import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings } from '../store/settings'

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    const s = getSettings()
    if (pin === s.adminPin) {
      navigate('/admin', { replace: true })
    } else {
      setError('Incorrect PIN')
      setPin('')
    }
  }

  return (
    <div className="page" style={{ background: 'var(--primary)', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card p-4" style={{ width: 'min(320px, 90vw)' }}>
        <div className="text-center" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>🔐</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Admin Login</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Enter your admin PIN</div>
        </div>

        <div className="input-group" style={{ marginBottom: 12 }}>
          <input className={`input ${error ? 'error' : ''}`} type="password" inputMode="numeric"
            value={pin} onChange={e => setPin(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="Enter PIN" autoFocus />
          {error && <span className="input-error">{error}</span>}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleLogin}>Login</button>
        <button className="btn btn-ghost btn-full" style={{ marginTop: 8 }} onClick={() => navigate(-1)}>Cancel</button>
      </div>
    </div>
  )
}
