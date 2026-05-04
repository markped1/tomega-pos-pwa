import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { saveSettings, getSettings } from '../store/settings'
import CurrencyPicker from '../components/CurrencyPicker'

export default function SetupPage() {
  const navigate = useNavigate()
  const existing = getSettings()
  const isEdit = existing.isSetup

  const [name, setName]       = useState(existing.businessName !== 'My Business' ? existing.businessName : '')
  const [address, setAddress] = useState(existing.businessAddress)
  const [pin, setPin]         = useState(isEdit ? existing.adminPin : '')
  const [confirm, setConfirm] = useState(isEdit ? existing.adminPin : '')
  const [currency, setCurrency] = useState({ code: existing.currencyCode, symbol: existing.currencySymbol })
  const [errors, setErrors]   = useState<Record<string, string>>({})
  const [showCurrency, setShowCurrency] = useState(false)

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())        e.name    = 'Business name is required'
    if (!address.trim())     e.address = 'Address is required'
    if (pin.length < 4)      e.pin     = 'PIN must be at least 4 digits'
    if (pin !== confirm)     e.confirm = 'PINs do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    saveSettings({
      businessName: name.trim(),
      businessAddress: address.trim(),
      adminPin: pin,
      currencyCode: currency.code,
      currencySymbol: currency.symbol,
      isSetup: true
    })
    navigate('/', { replace: true })
  }

  return (
    <div className="page" style={{ background: 'var(--primary)' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 16px' }}>
        {/* Logo / title */}
        <div className="text-center" style={{ marginBottom: 28, color: 'white' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🏪</div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>ToMega POS</div>
          <div style={{ fontSize: 13, opacity: 0.85 }}>
            {isEdit ? 'Update Business Info' : 'Set up your business'}
          </div>
        </div>

        <div className="card p-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="input-group">
            <label className="input-label">Business Name *</label>
            <input className={`input ${errors.name ? 'error' : ''}`} value={name}
              onChange={e => setName(e.target.value)} placeholder="e.g. Mama Africana Restaurant" />
            {errors.name && <span className="input-error">{errors.name}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Business Address *</label>
            <input className={`input ${errors.address ? 'error' : ''}`} value={address}
              onChange={e => setAddress(e.target.value)} placeholder="e.g. 12 Market Street, Lagos" />
            {errors.address && <span className="input-error">{errors.address}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Currency</label>
            <button className="btn btn-outline btn-full" onClick={() => setShowCurrency(true)}
              style={{ justifyContent: 'flex-start', fontWeight: 400 }}>
              {currency.code} — {currency.symbol}
            </button>
          </div>

          <div className="input-group">
            <label className="input-label">Admin PIN (4+ digits) *</label>
            <input className={`input ${errors.pin ? 'error' : ''}`} value={pin} type="password"
              inputMode="numeric" onChange={e => setPin(e.target.value)} placeholder="Enter PIN" />
            {errors.pin && <span className="input-error">{errors.pin}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Confirm PIN *</label>
            <input className={`input ${errors.confirm ? 'error' : ''}`} value={confirm} type="password"
              inputMode="numeric" onChange={e => setConfirm(e.target.value)} placeholder="Repeat PIN" />
            {errors.confirm && <span className="input-error">{errors.confirm}</span>}
          </div>

          <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={handleSave}>
            {isEdit ? 'Update Business Info' : '✓  Complete Setup'}
          </button>
        </div>
      </div>

      {showCurrency && (
        <CurrencyPicker
          current={currency.code}
          onSelect={c => { setCurrency(c); setShowCurrency(false) }}
          onClose={() => setShowCurrency(false)}
        />
      )}
    </div>
  )
}
