import { useState } from 'react'
import { Product } from '../db/database'
import { getSettings, originalPriceLabel } from '../store/settings'

interface Props {
  product: Product | null
  onSave: (p: Product) => void
  onClose: () => void
}

export default function ProductFormModal({ product, onSave, onClose }: Props) {
  const settings = getSettings()
  const sym = settings.currencySymbol

  const [name, setName]         = useState(product?.name ?? '')
  const [selling, setSelling]   = useState(product?.sellingPrice.toString() ?? '')
  const [cost, setCost]         = useState(product?.costPrice.toString() ?? '')
  const [mrp, setMrp]           = useState(product?.mrp && product.mrp !== product.sellingPrice ? product.mrp.toString() : '')
  const [discount, setDiscount] = useState(product?.discountPercent ? product.discountPercent.toString() : '')
  const [category, setCategory] = useState(product?.category ?? 'General')
  const [stock, setStock]       = useState(product?.stockQuantity.toString() ?? '0')
  const [imageUrl, setImageUrl] = useState(product?.imagePath ?? '')
  const [errors, setErrors]     = useState<Record<string, string>>({})
  const [showGallery, setShowGallery] = useState(false)
  const [gallerySearch, setGallerySearch] = useState(product?.name ?? '')
  const [galleryImages, setGalleryImages] = useState<string[]>([])

  function validate() {
    const e: Record<string, string> = {}
    if (!name.trim())  e.name    = 'Required'
    if (!selling)      e.selling = 'Required'
    if (!cost)         e.cost    = 'Required'
    if (mrp && parseFloat(mrp) < parseFloat(selling || '0')) e.mrp = `Must be ≥ selling price`
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSave() {
    if (!validate()) return
    const sellingPrice = parseFloat(selling)
    const mrpVal = mrp ? parseFloat(mrp) : sellingPrice
    onSave({
      id:              product?.id,
      name:            name.trim(),
      sellingPrice,
      costPrice:       parseFloat(cost),
      mrp:             mrpVal,
      discountPercent: discount ? parseFloat(discount) : 0,
      category:        category.trim() || 'General',
      stockQuantity:   parseInt(stock) || 0,
      imagePath:       imageUrl || null,
      isActive:        product?.isActive ?? true,
      createdAt:       product?.createdAt ?? Date.now()
    })
  }

  function loadGallery() {
    const q = encodeURIComponent(gallerySearch || name || 'product')
    const images = Array.from({ length: 24 }, (_, i) =>
      `https://source.unsplash.com/200x200/?${q}&sig=${i + 1}`
    )
    setGalleryImages(images)
    setShowGallery(true)
  }

  return (
    <div className="modal-overlay" style={{ alignItems: 'flex-end' }}>
      <div className="modal" style={{ borderRadius: '16px 16px 0 0', maxHeight: '92dvh' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, fontWeight: 700, fontSize: 17 }}>{product ? 'Edit Product' : 'Add Product'}</div>
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: 20 }}>✕</button>
        </div>

        {/* Image */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 14, gap: 8 }}>
          {imageUrl ? (
            <img src={imageUrl} alt="product" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 10 }} />
          ) : (
            <div style={{ width: 100, height: 100, background: 'var(--grey-100)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>🛍️</div>
          )}
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={loadGallery}>✨ Browse Gallery</button>
            {imageUrl && <button className="btn btn-sm" style={{ background: '#FFEBEE', color: 'var(--red)' }} onClick={() => setImageUrl('')}>Remove</button>}
          </div>
        </div>

        {/* Gallery */}
        {showGallery && (
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <input className="input" style={{ flex: 1 }} value={gallerySearch}
                onChange={e => setGallerySearch(e.target.value)} placeholder="Search images…" />
              <button className="btn btn-primary btn-sm" onClick={loadGallery}>Search</button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowGallery(false)}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, maxHeight: 200, overflowY: 'auto' }}>
              {galleryImages.map((url, i) => (
                <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: imageUrl === url ? '2px solid var(--primary)' : 'none' }}
                  onClick={() => { setImageUrl(url); setShowGallery(false) }} />
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="input-group">
            <label className="input-label">Product Name *</label>
            <input className={`input ${errors.name ? 'error' : ''}`} value={name} onChange={e => setName(e.target.value)} />
            {errors.name && <span className="input-error">{errors.name}</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">Selling Price * ({sym})</label>
              <input className={`input ${errors.selling ? 'error' : ''}`} value={selling} onChange={e => setSelling(e.target.value)} inputMode="decimal" type="number" />
              {errors.selling && <span className="input-error">{errors.selling}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Cost Price * ({sym})</label>
              <input className={`input ${errors.cost ? 'error' : ''}`} value={cost} onChange={e => setCost(e.target.value)} inputMode="decimal" type="number" />
              {errors.cost && <span className="input-error">{errors.cost}</span>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">{originalPriceLabel()} ({sym}) — optional</label>
              <input className={`input ${errors.mrp ? 'error' : ''}`} value={mrp} onChange={e => setMrp(e.target.value)} inputMode="decimal" type="number" placeholder="Before discount" />
              {errors.mrp && <span className="input-error">{errors.mrp}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Discount % — optional</label>
              <input className="input" value={discount} onChange={e => setDiscount(e.target.value)} inputMode="decimal" type="number" placeholder="e.g. 20" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div className="input-group">
              <label className="input-label">Category</label>
              <input className="input" value={category} onChange={e => setCategory(e.target.value)} placeholder="General" />
            </div>
            <div className="input-group">
              <label className="input-label">Stock Quantity *</label>
              <input className="input" value={stock} onChange={e => setStock(e.target.value)} inputMode="numeric" type="number" />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button className="btn btn-outline flex-1" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary flex-1" onClick={handleSave}>Save Product</button>
          </div>
        </div>
      </div>
    </div>
  )
}
