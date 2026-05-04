import { CartItem } from '../db/database'
import { formatCurrency } from '../store/settings'
import { v4 as uuid } from '../utils/uuid'

interface Props {
  open: boolean
  cart: CartItem[]
  onClose: () => void
  onIncrement: (id: number) => void
  onDecrement: (id: number) => void
  onRemove: (id: number) => void
  onClear: () => void
  onConfirm: (items: CartItem[], transactionId: string) => void
}

export default function CartDrawer({ open, cart, onClose, onIncrement, onDecrement, onRemove, onClear, onConfirm }: Props) {
  const total = cart.reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0)
  const isEmpty = cart.length === 0

  function handleConfirm() {
    if (isEmpty) return
    onConfirm([...cart], uuid())
  }

  return (
    <>
      {/* Overlay */}
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} />

      {/* Drawer */}
      <div className={`cart-drawer ${open ? 'open' : ''}`}>
        {/* Header */}
        <div className="cart-header">
          <span style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>🛒 Current Order</span>
          {!isEmpty && (
            <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)' }}
              onClick={onClear}>Clear</button>
          )}
          <button className="btn-ghost btn-sm text-white" style={{ marginLeft: 4 }} onClick={onClose}>✕</button>
        </div>

        {/* Column headers */}
        <div style={{ display: 'flex', padding: '5px 12px', background: 'var(--grey-50)', borderBottom: '1px solid var(--grey-200)', fontSize: 9, fontWeight: 700, color: 'var(--text-secondary)' }}>
          <div style={{ width: 36 }} />
          <div style={{ flex: 1, paddingLeft: 6 }}>Item</div>
          <div style={{ width: 80, textAlign: 'center' }}>Qty</div>
          <div style={{ width: 60, textAlign: 'right' }}>Amount</div>
          <div style={{ width: 22 }} />
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: 'auto', WebkitOverflowScrolling: 'touch' as any }}>
          {isEmpty ? (
            <div className="text-center text-hint p-4" style={{ marginTop: 24 }}>
              Cart is empty.<br />Tap a product to add it.
            </div>
          ) : (
            cart.map(item => (
              <div key={item.product.id} className="cart-item">
                {item.product.imagePath ? (
                  <img className="cart-item-img" src={item.product.imagePath} alt={item.product.name} />
                ) : (
                  <div className="cart-item-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🛍️</div>
                )}
                <div className="cart-item-info">
                  <div className="cart-item-name truncate">{item.product.name}</div>
                  <div className="cart-item-price">{formatCurrency(item.product.sellingPrice)}</div>
                </div>
                <div className="qty-controls">
                  <button className="btn-icon minus" style={{ width: 26, height: 26, fontSize: 14 }} onClick={() => onDecrement(item.product.id!)}>−</button>
                  <span style={{ width: 22, textAlign: 'center', fontSize: 13, fontWeight: 700 }}>{item.quantity}</span>
                  <button className="btn-icon" style={{ width: 26, height: 26, fontSize: 14 }} onClick={() => onIncrement(item.product.id!)}>+</button>
                </div>
                <div className="cart-item-subtotal">{formatCurrency(item.product.sellingPrice * item.quantity)}</div>
                <button style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', padding: '0 0 0 4px', fontSize: 14 }}
                  onClick={() => onRemove(item.product.id!)}>✕</button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="cart-footer safe-bottom">
          <div className="cart-total-row">
            <div>
              <div className="cart-total-label">ORDER TOTAL</div>
              <div className="cart-total-amount">{formatCurrency(total)}</div>
            </div>
          </div>
          <button className="btn btn-primary btn-full" disabled={isEmpty} onClick={handleConfirm}>
            ✓  Confirm Sale
          </button>
        </div>
      </div>
    </>
  )
}
