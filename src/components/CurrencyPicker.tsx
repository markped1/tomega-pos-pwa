import { useState } from 'react'

const CURRENCIES = [
  { code: 'NGN', symbol: '₦',   name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$',   name: 'US Dollar' },
  { code: 'GBP', symbol: '£',   name: 'British Pound' },
  { code: 'EUR', symbol: '€',   name: 'Euro' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GHS', symbol: '₵',   name: 'Ghanaian Cedi' },
  { code: 'ZAR', symbol: 'R',   name: 'South African Rand' },
  { code: 'INR', symbol: '₹',   name: 'Indian Rupee' },
  { code: 'PKR', symbol: '₨',   name: 'Pakistani Rupee' },
  { code: 'BDT', symbol: '৳',   name: 'Bangladeshi Taka' },
  { code: 'EGP', symbol: 'E£',  name: 'Egyptian Pound' },
  { code: 'ETB', symbol: 'Br',  name: 'Ethiopian Birr' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'XOF', symbol: 'CFA', name: 'West African CFA' },
  { code: 'XAF', symbol: 'FCFA',name: 'Central African CFA' },
  { code: 'MAD', symbol: 'MAD', name: 'Moroccan Dirham' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$',  name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥',   name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥',   name: 'Chinese Yuan' },
  { code: 'BRL', symbol: 'R$',  name: 'Brazilian Real' },
  { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal' },
  { code: 'PHP', symbol: '₱',   name: 'Philippine Peso' },
  { code: 'IDR', symbol: 'Rp',  name: 'Indonesian Rupiah' },
  { code: 'MYR', symbol: 'RM',  name: 'Malaysian Ringgit' },
  { code: 'SGD', symbol: 'S$',  name: 'Singapore Dollar' },
  { code: 'THB', symbol: '฿',   name: 'Thai Baht' },
]

interface Props {
  current: string
  onSelect: (c: { code: string; symbol: string }) => void
  onClose: () => void
}

export default function CurrencyPicker({ current, onSelect, onClose }: Props) {
  const [search, setSearch] = useState('')
  const filtered = CURRENCIES.filter(c =>
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end' }}>
      <div className="modal" style={{ borderRadius: '16px 16px 0 0', maxHeight: '80dvh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 17 }}>Select Currency</div>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 20 }}>✕</button>
        </div>
        <input className="input" placeholder="Search currency…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ marginBottom: 10 }} />
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filtered.map(c => (
            <div key={c.code} onClick={() => onSelect(c)}
              style={{ display: 'flex', alignItems: 'center', padding: '12px 4px', borderBottom: '1px solid var(--grey-100)', cursor: 'pointer', background: c.code === current ? 'var(--primary-light)' : 'transparent' }}>
              <span style={{ width: 48, fontWeight: 700, color: 'var(--primary)' }}>{c.symbol}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.code}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{c.name}</div>
              </div>
              {c.code === current && <span style={{ color: 'var(--primary)', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
