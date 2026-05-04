import { Product } from '../db/database'
import { formatCurrency, originalPriceLabel } from '../store/settings'

interface Props {
  product: Product
  cartQty: number
  onAdd: () => void
  onIncrement: () => void
  onDecrement: () => void
  onAlertRestock?: () => void
}

export default function ProductRow({ product, cartQty, onAdd, onIncrement, onDecrement, onAlertRestock }: Props) {
  const inStock = product.stockQuantity > 0
  const hasDiscount = product.discountPercent > 0 && product.mrp > product.sellingPrice
  const savings = product.mrp - product.sellingPrice

  return (
    <div className="product-row" style={{ opacity: inStock ? 1 : 0.6 }}>
      {/* Image */}
      {product.imagePath ? (
        <img className="product-img" src={product.imagePath} alt={product.name} />
      ) : (
        <div className="product-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🛍️</div>
      )}

      {/* Info */}
      <div className="product-info">
        <div className="product-name truncate">{product.name}</div>
        <div className="product-cat">{product.category}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
          {hasDiscount && <span className="product-mrp">{originalPriceLabel()}: {formatCurrency(product.mrp)}</span>}
          <span className="product-price">{formatCurrency(product.sellingPrice)}</span>
          {hasDiscount && <span className="discount-badge">{product.discountPercent.toFixed(0)}% OFF</span>}
        </div>
        {hasDiscount && <div className="savings-text">Save {formatCurrency(savings)}</div>}
      </div>

      {/* Stock */}
      <div className={`stock-label ${inStock ? 'stock-in' : 'stock-out'}`}>
        {inStock ? `${product.stockQuantity}` : 'Out'}
      </div>

      {/* Action */}
      {!inStock ? (
        <button className="btn btn-outline btn-sm" style={{ color: 'var(--orange)', borderColor: 'var(--orange)', width: 80 }}
          onClick={onAlertRestock}>⚠ Alert</button>
      ) : cartQty > 0 ? (
        <div className="qty-controls">
          <button className="btn-icon minus" style={{ width: 30, height: 30, fontSize: 16 }} onClick={onDecrement}>−</button>
          <span className="qty-display">{cartQty}</span>
          <button className="btn-icon" style={{ width: 30, height: 30, fontSize: 16 }} onClick={onIncrement}>+</button>
        </div>
      ) : (
        <button className="btn-icon" style={{ width: 36, height: 36 }} onClick={onAdd}>+</button>
      )}
    </div>
  )
}
