import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSettings, formatCurrency, getBusinessId } from '../store/settings'
import { listenForSales, listenForExpenses } from '../firebase'

export default function RemoteViewPage() {
  const navigate = useNavigate()
  const settings = getSettings()
  const bizId = getBusinessId(settings.businessName, settings.adminPin)

  const [sales, setSales]       = useState<Record<string, unknown>[]>([])
  const [expenses, setExpenses] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [lastUpdated, setLastUpdated] = useState('')

  const unsubSales    = useRef<(() => void) | null>(null)
  const unsubExpenses = useRef<(() => void) | null>(null)
  const timeoutRef    = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // 10-second timeout if Firebase doesn't respond
    timeoutRef.current = setTimeout(() => {
      if (loading) {
        setLoading(false)
        setError('Could not connect. Check your internet connection and Firebase setup.')
      }
    }, 10_000)

    unsubSales.current = listenForSales(
      bizId,
      data => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setLoading(false)
        setError('')
        setSales(data)
        setLastUpdated(new Date().toLocaleTimeString())
      },
      msg => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setLoading(false)
        setError(`Connection error: ${msg}`)
      }
    )

    unsubExpenses.current = listenForExpenses(bizId, data => {
      setExpenses(data)
    })

    return () => {
      unsubSales.current?.()
      unsubExpenses.current?.()
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  // ── Computed totals ───────────────────────────────────────────────────────
  const totalRevenue  = sales.reduce((s, x) => s + ((x.totalAmount as number) || 0), 0)
  const totalCost     = sales.reduce((s, x) => s + ((x.totalCost   as number) || 0), 0)
  const grossProfit   = sales.reduce((s, x) => s + ((x.profit      as number) || 0), 0)
  const totalExpenses = expenses.reduce((s, x) => s + ((x.amount   as number) || 0), 0)
  const netProfit     = grossProfit - totalExpenses
  const txCount       = new Set(sales.map(s => s.transactionId as string)).size

  // ── Group sales by transaction, newest first ──────────────────────────────
  const txGroups = Object.values(
    sales.reduce((acc, sale) => {
      const tid = sale.transactionId as string
      if (!acc[tid]) acc[tid] = []
      acc[tid].push(sale)
      return acc
    }, {} as Record<string, Record<string, unknown>[]>)
  ).sort((a, b) => ((b[0].saleDate as number) || 0) - ((a[0].saleDate as number) || 0))

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <button className="btn-ghost text-white" onClick={() => navigate('/admin')}>←</button>
        <div style={{ flex: 1 }}>
          <div className="header-title">🔴 Live Sales View</div>
          <div className="header-sub">{settings.businessName}  •  ID: {bizId}</div>
        </div>
      </div>

      <div className="scroll-area p-3">

        {/* Loading */}
        {loading && (
          <div className="text-center" style={{ marginTop: 48 }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
            <div style={{ color: 'var(--text-secondary)' }}>Connecting to live data…</div>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="card p-4 text-center" style={{ marginTop: 24, borderLeft: '4px solid var(--red)' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Connection Failed</div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{error}</div>
            <div style={{ fontSize: 12, color: 'var(--text-hint)' }}>
              Make sure Firebase Realtime Database is created and the sales device is online.
            </div>
          </div>
        )}

        {/* Summary card */}
        {!loading && !error && (
          <>
            <div className="report-card" style={{ marginBottom: 12 }}>
              <div className="report-card-header">
                🔴 LIVE  All-Time Summary
                <span style={{ float: 'right', fontSize: 11, opacity: 0.85 }}>{txCount} transactions</span>
              </div>
              <div className="report-metrics">
                <div className="metric">
                  <div className="metric-label">Total Revenue</div>
                  <div className="metric-value green">{formatCurrency(totalRevenue)}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Cost of Goods</div>
                  <div className="metric-value">{formatCurrency(totalCost)}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Gross Profit</div>
                  <div className="metric-value green">{formatCurrency(grossProfit)}</div>
                </div>
                <div className="metric">
                  <div className="metric-label">Expenses</div>
                  <div className="metric-value red">{formatCurrency(totalExpenses)}</div>
                </div>
              </div>
              <div style={{ padding: '12px 14px', borderTop: '1px solid var(--grey-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-secondary)' }}>NET PROFIT</span>
                <span style={{ fontSize: 22, fontWeight: 700, color: netProfit >= 0 ? 'var(--primary)' : 'var(--red)' }}>
                  {formatCurrency(netProfit)}
                </span>
              </div>
              {lastUpdated && (
                <div style={{ padding: '6px 14px', fontSize: 11, color: 'var(--text-hint)', borderTop: '1px solid var(--grey-100)' }}>
                  Last updated: {lastUpdated}
                </div>
              )}
            </div>

            {/* Transaction list */}
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: 'var(--text-secondary)' }}>
              TRANSACTIONS (newest first)
            </div>

            {txGroups.length === 0 ? (
              <div className="text-center text-hint p-4">No sales recorded yet.</div>
            ) : (
              txGroups.map((txSales, i) => {
                const txTotal = txSales.reduce((s, x) => s + ((x.totalAmount as number) || 0), 0)
                const txDate  = new Date((txSales[0].saleDate as number) || 0)
                return (
                  <div key={i} className="card" style={{ marginBottom: 8, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--grey-50)', borderBottom: '1px solid var(--grey-200)' }}>
                      <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {txDate.toLocaleDateString()}  {txDate.toLocaleTimeString()}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(txTotal)}</span>
                    </div>
                    {txSales.map((sale, j) => (
                      <div key={j} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 12px', borderBottom: '1px solid var(--grey-100)', fontSize: 13 }}>
                        <span>{sale.productName as string}  ×{sale.quantity as number}</span>
                        <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{formatCurrency((sale.totalAmount as number) || 0)}</span>
                      </div>
                    ))}
                  </div>
                )
              })
            )}
          </>
        )}
      </div>
    </div>
  )
}
