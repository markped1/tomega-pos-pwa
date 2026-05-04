import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSalesByRange, getExpensesByRange, startOfDay, endOfDay, startOfWeek, startOfMonth, endOfMonth } from '../db/database'
import { formatCurrency } from '../store/settings'

type Period = 'daily' | 'weekly' | 'monthly'

export default function ReportsPage() {
  const navigate = useNavigate()
  const [period, setPeriod] = useState<Period>('daily')
  const [data, setData] = useState({ sales: 0, cost: 0, grossProfit: 0, expenses: 0, netProfit: 0, txCount: 0 })

  useEffect(() => { loadReport() }, [period])

  async function loadReport() {
    const now = new Date()
    let start: number, end: number
    if (period === 'daily')   { start = startOfDay(); end = endOfDay() }
    else if (period === 'weekly') { start = startOfWeek(); end = endOfDay() }
    else { start = startOfMonth(); end = endOfMonth() }

    const sales    = await getSalesByRange(start, end)
    const expenses = await getExpensesByRange(start, end)

    const totalSales    = sales.reduce((s, x) => s + x.totalAmount, 0)
    const totalCost     = sales.reduce((s, x) => s + x.totalCost, 0)
    const grossProfit   = sales.reduce((s, x) => s + x.profit, 0)
    const totalExpenses = expenses.reduce((s, x) => s + x.amount, 0)
    const netProfit     = grossProfit - totalExpenses
    const txCount       = new Set(sales.map(s => s.transactionId)).size

    setData({ sales: totalSales, cost: totalCost, grossProfit, expenses: totalExpenses, netProfit, txCount })
  }

  const tabs: { key: Period; label: string }[] = [
    { key: 'daily', label: 'Daily' },
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' }
  ]

  return (
    <div className="page">
      <div className="header">
        <button className="btn-ghost text-white" onClick={() => navigate('/admin')}>←</button>
        <div className="header-title flex-1">Reports</div>
      </div>

      {/* Period tabs */}
      <div style={{ display: 'flex', background: 'white', borderBottom: '1px solid var(--grey-200)', padding: '0 14px' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setPeriod(t.key)}
            style={{ flex: 1, padding: '12px 0', border: 'none', background: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              color: period === t.key ? 'var(--primary)' : 'var(--text-secondary)',
              borderBottom: period === t.key ? '2px solid var(--primary)' : '2px solid transparent' }}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="scroll-area p-3">
        <div className="report-card">
          <div className="report-card-header">
            {period === 'daily' ? "📊 Today's Summary" : period === 'weekly' ? '📊 This Week' : '📊 This Month'}
            <span style={{ float: 'right', fontSize: 11, opacity: 0.85 }}>{data.txCount} transactions</span>
          </div>
          <div className="report-metrics">
            <div className="metric">
              <div className="metric-label">Gross Sales</div>
              <div className="metric-value green">{formatCurrency(data.sales)}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Cost of Goods</div>
              <div className="metric-value">{formatCurrency(data.cost)}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Gross Profit</div>
              <div className="metric-value green">{formatCurrency(data.grossProfit)}</div>
            </div>
            <div className="metric">
              <div className="metric-label">Expenses</div>
              <div className="metric-value red">{formatCurrency(data.expenses)}</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', borderTop: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 13, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>NET PROFIT</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: data.netProfit >= 0 ? 'var(--primary)' : 'var(--red)' }}>
              {formatCurrency(data.netProfit)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
