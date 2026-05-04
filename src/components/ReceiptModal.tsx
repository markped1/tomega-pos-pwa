import { useState } from 'react'
import { CartItem } from '../db/database'
import { formatCurrency, getSettings } from '../store/settings'

interface Props {
  items: CartItem[]
  transactionId: string
  onClose: () => void
}

export default function ReceiptModal({ items, transactionId, onClose }: Props) {
  const [step, setStep] = useState<'choose' | 'whatsapp'>('choose')
  const [phone, setPhone] = useState('')
  const [phoneError, setPhoneError] = useState('')
  const settings = getSettings()
  const total = items.reduce((s, i) => s + i.product.sellingPrice * i.quantity, 0)
  const ref = transactionId.slice(0, 8).toUpperCase()

  function buildReceiptText() {
    let text = `🧾 *Receipt from ${settings.businessName}*\n\n`
    items.forEach(item => {
      text += `• ${item.product.name}  ×${item.quantity}  →  ${formatCurrency(item.product.sellingPrice * item.quantity)}\n`
    })
    text += `\n*Total: ${formatCurrency(total)}*\n`
    text += `\nRef: ${ref}\nThank you for your purchase! 🙏`
    return text
  }

  function sendWhatsApp() {
    const raw = phone.replace(/[^\d+]/g, '')
    if (!raw) { setPhoneError('Enter a WhatsApp number'); return }
    setPhoneError('')
    const text = encodeURIComponent(buildReceiptText())
    // wa.me link works on both Android and iPhone
    window.open(`https://wa.me/${raw}?text=${text}`, '_blank')
    onClose()
  }

  function printReceipt() {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <html><head><title>Receipt</title>
      <style>
        body { font-family: monospace; font-size: 13px; padding: 16px; max-width: 300px; margin: 0 auto; }
        h2 { text-align: center; font-size: 16px; }
        .sub { text-align: center; font-size: 11px; color: #666; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        td { padding: 4px 0; }
        .right { text-align: right; }
        .total { font-weight: bold; border-top: 1px solid #000; padding-top: 6px; }
        .footer { text-align: center; margin-top: 12px; font-size: 11px; }
      </style></head><body>
      <h2>${settings.businessName}</h2>
      <div class="sub">${settings.businessAddress}</div>
      <div class="sub">${new Date().toLocaleString()}</div>
      <table>
        <tr><td><b>Item</b></td><td class="right"><b>Qty</b></td><td class="right"><b>Amount</b></td></tr>
        ${items.map(i => `<tr><td>${i.product.name}</td><td class="right">×${i.quantity}</td><td class="right">${formatCurrency(i.product.sellingPrice * i.quantity)}</td></tr>`).join('')}
        <tr class="total"><td colspan="2"><b>TOTAL</b></td><td class="right"><b>${formatCurrency(total)}</b></td></tr>
      </table>
      <div class="footer">Ref: ${ref}<br>Thank you for your purchase!</div>
      </body></html>
    `)
    win.document.close()
    win.print()
    onClose()
  }

  return (
    <div className="modal-overlay center">
      <div className="modal center-modal">
        <div className="modal-title">✓ Sale Complete!</div>
        <div className="modal-sub">
          {items.length} item{items.length !== 1 ? 's' : ''}  •  Total: {formatCurrency(total)}
        </div>

        <div className="modal-divider" />

        {step === 'choose' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Send a receipt to the customer?
            </p>
            <button className="btn btn-whatsapp btn-full" onClick={() => setStep('whatsapp')}>
              📲  Send via WhatsApp
            </button>
            <button className="btn btn-primary btn-full" onClick={printReceipt}>
              🖨️  Print Receipt
            </button>
            <button className="btn btn-outline btn-full" onClick={onClose}>
              Skip — No Receipt
            </button>
          </div>
        )}

        {step === 'whatsapp' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div className="input-group">
              <label className="input-label">Customer WhatsApp Number</label>
              <input className={`input ${phoneError ? 'error' : ''}`}
                value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+2348012345678" inputMode="tel" type="tel" />
              {phoneError && <span className="input-error">{phoneError}</span>}
            </div>
            <button className="btn btn-whatsapp btn-full" onClick={sendWhatsApp}>
              ✓  Confirm & Send
            </button>
            <button className="btn btn-outline btn-full" onClick={() => setStep('choose')}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
