import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, Settings } from 'lucide-react'
import { getAllActiveProducts, Product, CartItem, insertSales, Sale } from '../db/database'
import { getSettings, formatCurrency } from '../store/settings'
import { getBusinessId } from '../store/settings'
import { pushSale } from '../firebase'
import ProductRow from '../components/ProductRow'
import CartDrawer from '../components/CartDrawer'
import ReceiptModal from '../components/ReceiptModal'

export default function SalesPage() {
  const navigate = useNavigate()
  const settings = getSettings()

  const [products, setProducts]   = useState<Product[]>([])
  const [filtered, setFiltered]   = useState<Product[]>([])
  const [cart, setCart]           = useState<CartItem[]>([])
  const [search, setSearch]       = useState('')
  const [cartOpen, setCartOpen]   = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [soldItems, setSoldItems] = useState<CartItem[]>([])
  const [txId, setTxId]           = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    getAllActiveProducts().then(p => { setProducts(p); setFiltered(p) })
  }, [])

  useEffect(() => {
    const q = search.toLowerCase()
    setFiltered(q ? products.filter(p =>
      p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    ) : products)
  }, [search, products])

  const cartTotal = cart.reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0)
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0)

  const addToCart = useCallback((product: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.product.id === product.id)
      if (ex) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product, quantity: 1 }]
    })
    setCartOpen(true)
  }, [])

  const increment = useCallback((id: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i))
  }, [])

  const decrement = useCallback((id: number) => {
    setCart(prev => {
      const item = prev.find(i => i.product.id === id)
      if (!item) return prev
      if (item.quantity <= 1) return prev.filter(i => i.product.id !== id)
      return prev.map(i => i.product.id === id ? { ...i, quantity: i.quantity - 1 } : i)
    })
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(i => i.product.id !== id))
  }, [])

  function handleConfirmSale(items: CartItem[], transactionId: string) {
    const bizId = getBusinessId()
    const sales: Sale[] = items.map(item => ({
      productId:     item.product.id!,
      productName:   item.product.name,
      quantity:      item.quantity,
      sellingPrice:  item.product.sellingPrice,
      costPrice:     item.product.costPrice,
      totalAmount:   item.product.sellingPrice * item.quantity,
      totalCost:     item.product.costPrice * item.quantity,
      profit:        (item.product.sellingPrice - item.product.costPrice) * item.quantity,
      transactionId,
      saleDate:      Date.now()
    }))
    insertSales(sales)
    // Push each sale to Firebase for remote view
    sales.forEach(s => pushSale(bizId, s as unknown as Record<string, unknown>))
    setSoldItems(items)
    setTxId(transactionId)
    setCart([])
    setCartOpen(false)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
      setShowReceipt(true)
    }, 1500)
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="header">
        <div style={{ flex: 1 }}>
          <div className="header-title">{settings.businessName}</div>
          <div className="header-sub">{settings.businessAddress}</div>
        </div>
        <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.2)', position: 'relative' }}
          onClick={() => setCartOpen(true)}>
          <ShoppingCart size={18} />
          {cartCount > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4, background: 'var(--red)',
              color: 'white', borderRadius: '50%', width: 18, height: 18,
              fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{cartCount}</span>
          )}
        </button>
        <button className="btn-icon" style={{ background: 'rgba(255,255,255,0.2)', marginLeft: 6 }}
          onClick={() => navigate('/admin-login')}>
          <Settings size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="search-bar">
        <span>🔍</span>
        <input className="search-input" placeholder="Search products…"
          value={search} onChange={e => setSearch(e.target.value)} />
        {search && <button className="btn-ghost btn-sm" onClick={() => setSearch('')}>✕</button>}
      </div>

      {/* Column headers */}
      <div className="table-header">
        <div style={{ width: 44 }} />
        <div className="th flex-1" style={{ paddingLeft: 8 }}>Product</div>
        <div className="th" style={{ width: 52, textAlign: 'center' }}>Stock</div>
        <div className="th" style={{ width: 80, textAlign: 'center' }}>Qty</div>
      </div>

      {/* Product list */}
      <div className="scroll-area">
        {filtered.length === 0 && (
          <div className="text-center text-hint p-4" style={{ marginTop: 32 }}>
            {search ? `No products found for "${search}"` : 'No products yet. Ask admin to add products.'}
          </div>
        )}
        {filtered.map(product => (
          <ProductRow
            key={product.id}
            product={product}
            cartQty={cart.find(i => i.product.id === product.id)?.quantity ?? 0}
            onAdd={() => addToCart(product)}
            onIncrement={() => increment(product.id!)}
            onDecrement={() => decrement(product.id!)}
          />
        ))}
      </div>

      {/* Checkout bar */}
      {cart.length > 0 && (
        <div className="checkout-bar safe-bottom">
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 9, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}>ORDER TOTAL</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--primary)' }}>{formatCurrency(cartTotal)}</div>
          </div>
          <button className="btn btn-primary" onClick={() => setCartOpen(true)}>
            ✓ Confirm Sale
          </button>
        </div>
      )}

      {/* Cart drawer */}
      <CartDrawer
        open={cartOpen}
        cart={cart}
        onClose={() => setCartOpen(false)}
        onIncrement={increment}
        onDecrement={decrement}
        onRemove={removeFromCart}
        onClear={() => setCart([])}
        onConfirm={handleConfirmSale}
      />

      {/* Receipt modal */}
      {showReceipt && (
        <ReceiptModal
          items={soldItems}
          transactionId={txId}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Sale success overlay */}
      {showSuccess && (
        <div className="success-overlay">
          <div className="success-box">
            <div style={{ fontSize: 48 }}>✓</div>
            <div style={{ fontSize: 18, fontWeight: 700, marginTop: 8 }}>Sale Recorded!</div>
          </div>
        </div>
      )}
    </div>
  )
}
