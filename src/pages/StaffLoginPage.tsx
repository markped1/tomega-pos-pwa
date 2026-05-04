import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRoleForPin } from '../store/settings'

export default function StaffLoginPage() {
  const navigate = useNavigate()
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    const role = getRoleForPin(pin)
    if (!role) { setError('Incorrect PIN'); setPin(''); return }
    if (role === 'admin') {
      navigate('/admin', { replace: true })
    } else {
      const staffName = role.replace('staff:', '')
      navigate(`/staff-sales?name=${encodeURIComponent(staffName)}`, { replace: true })
    }
  }

  return (
    <div className="page" style={{ background: 'var(--primary)', justifyContent: 'center', alignItems: 'center' }}>
      <div className="card p-4" style={{ width: 'min(320px, 90vw)' }}>
        <div className="text-center" style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 40 }}>👤</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Staff Login</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Enter your PIN</div>
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
