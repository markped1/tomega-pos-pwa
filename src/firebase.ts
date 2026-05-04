// @ts-nocheck
import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, onValue, off } from 'firebase/database'

const firebaseConfig = {
  apiKey:            'AIzaSyC6QAmxgGKKCqhQ7vZEbXYAhnvQun-ylqQ',
  authDomain:        'tomega-pos.firebaseapp.com',
  projectId:         'tomega-pos',
  storageBucket:     'tomega-pos.firebasestorage.app',
  messagingSenderId: '178416220449',
  appId:             '1:178416220449:web:c12467b7a2515d4745a660',
  databaseURL:       'https://tomega-pos-default-rtdb.firebaseio.com'
}

const app = initializeApp(firebaseConfig)
const db  = getDatabase(app)

export function pushSale(businessId: string, sale: Record<string, unknown>): void {
  try { push(ref(db, `businesses/${businessId}/sales`), sale) }
  catch (e) { console.warn('Firebase push failed:', e) }
}

export function pushExpense(businessId: string, expense: Record<string, unknown>): void {
  try { push(ref(db, `businesses/${businessId}/expenses`), expense) }
  catch (e) { console.warn('Firebase push failed:', e) }
}

export function listenForSales(
  businessId: string,
  onData: (sales: Record<string, unknown>[]) => void,
  onError: (msg: string) => void
): () => void {
  const salesRef = ref(db, `businesses/${businessId}/sales`)
  onValue(
    salesRef,
    (snapshot) => {
      const list: Record<string, unknown>[] = []
      snapshot.forEach((child) => { list.push(child.val()) })
      onData(list)
    },
    (error) => onError(error.message)
  )
  return () => off(salesRef)
}

export function listenForExpenses(
  businessId: string,
  onData: (expenses: Record<string, unknown>[]) => void
): () => void {
  const expRef = ref(db, `businesses/${businessId}/expenses`)
  onValue(expRef, (snapshot) => {
    const list: Record<string, unknown>[] = []
    snapshot.forEach((child) => { list.push(child.val()) })
    onData(list)
  })
  return () => off(expRef)
}
