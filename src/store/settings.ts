// Simple localStorage-based settings store

const KEY = 'tomega_settings'

export interface Settings {
  businessName: string
  businessAddress: string
  adminPin: string
  currencyCode: string
  currencySymbol: string
  isSetup: boolean
}

const DEFAULTS: Settings = {
  businessName: 'My Business',
  businessAddress: '',
  adminPin: '1234',
  currencyCode: 'NGN',
  currencySymbol: '₦',
  isSetup: false
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { ...DEFAULTS }
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(s: Partial<Settings>): void {
  const current = getSettings()
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...s }))
}

export function isSetup(): boolean {
  return getSettings().isSetup
}

// ── Currency formatting ───────────────────────────────────────────────────────

export function formatCurrency(amount: number): string {
  const { currencySymbol } = getSettings()
  return `${currencySymbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function originalPriceLabel(): string {
  const { currencyCode } = getSettings()
  return currencyCode === 'INR' ? 'MRP' : `${currencyCode} Price`
}

// ── Business ID (for remote view) ─────────────────────────────────────────────
export function getBusinessId(): string {
  const { businessName, adminPin } = getSettings()
  let hash = 0
  const str = businessName + adminPin
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString().replace(/-/g, 'n')
}

// ── Staff ─────────────────────────────────────────────────────────────────────
export interface StaffMember {
  id: string
  name: string
  pin: string
}

export function getStaffList(): StaffMember[] {
  try {
    return JSON.parse(localStorage.getItem('tomega_staff') || '[]')
  } catch { return [] }
}

export function saveStaffList(list: StaffMember[]): void {
  localStorage.setItem('tomega_staff', JSON.stringify(list))
}

export function getRoleForPin(pin: string): string | null {
  const s = getSettings()
  if (pin === s.adminPin) return 'admin'
  const staff = getStaffList().find(m => m.pin === pin)
  return staff ? `staff:${staff.name}` : null
}
