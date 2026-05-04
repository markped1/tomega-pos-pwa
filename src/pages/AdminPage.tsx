import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllProducts, saveProduct, deleteProduct, Product } from '../db/database'
import { formatCurrency, getSettings, originalPriceLabel } from '../store/settings'
import ProductFormModal from '../components/ProductFormModal'

export default function AdminPage() {
  const navigate = useNavigate()
  const settings = getSettings()
  const [products, setProducts] = useState<Product[]>([])
  const [editProduct, setEditProduct] = useState<Product | null | undefined>(undefined)
  // undefined = closed, null = new product, Product = editing

  useEffect(() => { reload() }, [])

  async function reload() {
    setProducts(await getAllProducts())
  }

  async function toggleActive(p: Product) {
    await saveProduct({ ...p, isActive: !p.isActive })
    reload()
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    await deleteProduct(p.id!)
    reload()
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <button className="btn-ghost text-white" onClick={() => navigate('/')}>←</button>
        <div style={{ flex: 1 }}>
          <div className="header-title">Admin Panel</div>
          <div className="header-sub">{settings.businessName}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 14px', background: 'white', borderBottom: '1px solid var(--grey-200)' }}>
        <button className="btn btn-outline" onClick={() => navigate('/reports')}>📊 Reports</button>
        <button className="btn btn-outline" onClick={() => navigate('/expenses')}>💰 Expenses</button>
        <button className="btn btn-outline" onClick={() => navigate('/setup')}>⚙️ Settings</button>
        <button className="btn btn-outline" onClick={() => navigate('/staff-login')}>👥 Staff</button>
        <button className="btn btn-outline" style={{ gridColumn: 'span 2', color: 'var(--primary)', borderColor: 'var(--primary)' }}
          onClick={() => navigate('/remote-view')}>📱 View Sales Remotely (Live)</button>
      </div>

      {/* Products header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: 'white', borderBottom: '1px solid var(--grey-200)' }}>
        <span style={{ flex: 1, fontWeight: 700 }}>Products ({products.length})</span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditProduct(null)}>+ Add Product</button>
      </div>

      {/* Product list */}
      <div className="scroll-area">
        {products.length === 0 && (
          <div className="text-center text-hint p-4" style={{ marginTop: 32 }}>
            No products yet. Tap "+ Add Product" to get started.
          </div>
        )}
        {products.map(p => (
          <div key={p.id} className="admin-product-item" style={{ opacity: p.isActive ? 1 : 0.5 }}>
            {p.imagePath ? (
              <img className="admin-product-img" src={p.imagePath} alt={p.name} />
            ) : (
              <div className="admin-product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>🛍️</div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }} className="truncate">{p.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.category} • Stock: {p.stockQuantity}</div>
              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                {formatCurrency(p.sellingPrice)}
                {p.discountPercent > 0 && <span className="discount-badge" style={{ marginLeft: 6 }}>{p.discountPercent.toFixed(0)}% OFF</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
              <button className="btn btn-outline btn-sm" onClick={() => setEditProduct(p)}>Edit</button>
              <button className="btn btn-sm" style={{ background: p.isActive ? 'var(--grey-200)' : 'var(--primary-light)', color: p.isActive ? 'var(--text-secondary)' : 'var(--primary)' }}
                onClick={() => toggleActive(p)}>{p.isActive ? 'Hide' : 'Show'}</button>
              <button className="btn btn-sm" style={{ background: '#FFEBEE', color: 'var(--red)' }}
                onClick={() => handleDelete(p)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Product form modal */}
      {editProduct !== undefined && (
        <ProductFormModal
          product={editProduct}
          onSave={async (p) => { await saveProduct(p); setEditProduct(undefined); reload() }}
          onClose={() => setEditProduct(undefined)}
        />
      )}
    </div>
  )
}
