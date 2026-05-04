import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllExpenses, saveExpense, deleteExpense, Expense } from '../db/database'
import { formatCurrency } from '../store/settings'

export default function ExpensesPage() {
  const navigate = useNavigate()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [showForm, setShowForm] = useState(false)
  const [desc, setDesc]         = useState('')
  const [amount, setAmount]     = useState('')
  const [category, setCategory] = useState('General')
  const [error, setError]       = useState('')

  useEffect(() => { reload() }, [])

  async function reload() {
    const all = await getAllExpenses()
    setExpenses(all.sort((a, b) => b.expenseDate - a.expenseDate))
  }

  async function handleAdd() {
    if (!desc.trim()) { setError('Description required'); return }
    if (!amount || parseFloat(amount) <= 0) { setError('Enter a valid amount'); return }
    setError('')
    await saveExpense({ description: desc.trim(), amount: parseFloat(amount), category: category || 'General', expenseDate: Date.now() })
    setDesc(''); setAmount(''); setCategory('General'); setShowForm(false)
    reload()
  }

  async function handleDelete(e: Expense) {
    if (!confirm(`Delete "${e.description}"?`)) return
    await deleteExpense(e.id!)
    reload()
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="page">
      <div className="header">
        <button className="btn-ghost text-white" onClick={() => navigate('/admin')}>←</button>
        <div className="header-title flex-1">Expenses</div>
        <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
          onClick={() => setShowForm(true)}>+ Add</button>
      </div>

      {/* Total */}
      <div style={{ background: 'white', padding: '10px 14px', borderBottom: '1px solid var(--grey-200)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Total Expenses</span>
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--red)' }}>{formatCurrency(total)}</span>
      </div>

      <div className="scroll-area">
        {expenses.length === 0 && (
          <div className="text-center text-hint p-4" style={{ marginTop: 32 }}>No expenses recorded yet.</div>
        )}
        {expenses.map(e => (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: 'white', borderBottom: '1px solid var(--grey-100)', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{e.description}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{e.category} • {new Date(e.expenseDate).toLocaleDateString()}</div>
            </div>
            <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: 14 }}>{formatCurrency(e.amount)}</div>
            <button className="btn btn-sm" style={{ background: '#FFEBEE', color: 'var(--red)' }} onClick={() => handleDelete(e)}>Delete</button>
          </div>
        ))}
      </div>

      {/* Add form modal */}
      {showForm && (
        <div className="modal-overlay center">
          <div className="modal center-modal">
            <div className="modal-title">Add Expense</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 12 }}>
              <div className="input-group">
                <label className="input-label">Description *</label>
                <input className="input" value={desc} onChange={e => setDesc(e.target.value)} placeholder="e.g. Rent, Transport" />
              </div>
              <div className="input-group">
                <label className="input-label">Amount *</label>
                <input className="input" value={amount} onChange={e => setAmount(e.target.value)} inputMode="decimal" type="number" placeholder="0.00" />
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="General" />
              </div>
              {error && <span className="input-error">{error}</span>}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-outline flex-1" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="btn btn-primary flex-1" onClick={handleAdd}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
