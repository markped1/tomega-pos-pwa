import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, off } from 'firebase/database'

const firebaseConfig = {
  apiKey:            'AIzaSyC6QAmxgGKKCqhQ7vZEbXYAhnvQun-ylqQ',
  authDomain:        'tomega-pos.firebaseapp.com',
  projectId:         'tomega-pos',
  storageBucket:     'tomega-pos.firebasestorage.app',
  messagingSenderId: '178416220449',
  appId:             '1:178416220449:web:c12467b7a2515d4745a660',
  // databaseURL added once Realtime Database is created
  databaseURL:       'https://tomega-pos-default-rtdb.firebaseio.com'
}

const app = initializeApp(firebaseConfig)
const db  = getDatabase(app)

// ── Business ID ───────────────────────────────────────────────────────────────
// Matches the Android app's formula: hash(businessName + adminPin)
export function getBusinessId(businessName: string, adminPin: string): string {
  let hash = 0
  const str = businessName + adminPin
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash).toString().replace(/-/g, 'n')
}

// ── Push a sale to Firebase ───────────────────────────────────────────────────
export function pushSale(businessId: string, sale: Record<string, unknown>): void {
  try {
    const salesRef = ref(db, `businesses/${businessId}/sales`)
    push(salesRef, sale)
  } catch (e) {
    console.warn('Firebase push failed (offline?):', e)
  }
}

// ── Push an expense ───────────────────────────────────────────────────────────
export function pushExpense(businessId: string, expense: Record<string, unknown>): void {
  try {
    const expRef = ref(db, `businesses/${businessId}/expenses`)
    push(expRef, expense)
  } catch (e) {
    console.warn('Firebase push failed (offline?):', e)
  }
}

// ── Listen for live sales (remote view) ──────────────────────────────────────
export function listenForSales(
  businessId: string,
  onData: (sales: Record<string, unknown>[]) => void,
  onError: (msg: string) => void
): () => void {
  const salesRef = ref(db, `businesses/${businessId}/sales`)
  onValue(
    salesRef,
    snapshot => {
      const list: Record<string, unknown>[] = []
      snapshot.forEach(child => {
        list.push(child.val() as Record<string, unknown>)
      })
      onData(list)
    },
    error => onError(error.message)
  )
  // Return unsubscribe function
  return () => off(salesRef)
}

// ── Listen for live expenses ──────────────────────────────────────────────────
export function listenForExpenses(
  businessId: string,
  onData: (expenses: Record<string, unknown>[]) => void
): () => void {
  const expRef = ref(db, `businesses/${businessId}/expenses`)
  onValue(expRef, snapshot => {
    const list: Record<string, unknown>[] = []
    snapshot.forEach(child => {
      list.push(child.val() as Record<string, unknown>)
    })
    onData(list)
  })
  return () => off(expRef)
}
