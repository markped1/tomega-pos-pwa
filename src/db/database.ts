import { openDB, DBSchema, IDBPDatabase } from 'idb'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Product {
  id?: number
  name: string
  sellingPrice: number
  costPrice: number
  mrp: number
  discountPercent: number
  imagePath: string | null
  category: string
  isActive: boolean
  stockQuantity: number
  createdAt: number
}

export interface Sale {
  id?: number
  productId: number
  productName: string
  quantity: number
  sellingPrice: number
  costPrice: number
  totalAmount: number
  totalCost: number
  profit: number
  transactionId: string
  saleDate: number
}

export interface Expense {
  id?: number
  description: string
  amount: number
  category: string
  expenseDate: number
}

export interface CartItem {
  product: Product
  quantity: number
}

// ── DB Schema ─────────────────────────────────────────────────────────────────

interface ToMegaDB extends DBSchema {
  products: {
    key: number
    value: Product
    indexes: { 'by-active': number }
  }
  sales: {
    key: number
    value: Sale
    indexes: { 'by-date': number; 'by-transaction': string }
  }
  expenses: {
    key: number
    value: Expense
    indexes: { 'by-date': number }
  }
}

let dbInstance: IDBPDatabase<ToMegaDB> | null = null

export async function getDB(): Promise<IDBPDatabase<ToMegaDB>> {
  if (dbInstance) return dbInstance
  dbInstance = await openDB<ToMegaDB>('tomega-pos', 1, {
    upgrade(db) {
      const products = db.createObjectStore('products', { keyPath: 'id', autoIncrement: true })
      products.createIndex('by-active', 'isActive')

      const sales = db.createObjectStore('sales', { keyPath: 'id', autoIncrement: true })
      sales.createIndex('by-date', 'saleDate')
      sales.createIndex('by-transaction', 'transactionId')

      const expenses = db.createObjectStore('expenses', { keyPath: 'id', autoIncrement: true })
      expenses.createIndex('by-date', 'expenseDate')
    }
  })
  return dbInstance
}

// ── Products ──────────────────────────────────────────────────────────────────

export async function getAllActiveProducts(): Promise<Product[]> {
  const db = await getDB()
  const all = await db.getAll('products')
  return all.filter(p => p.isActive)
}

export async function getAllProducts(): Promise<Product[]> {
  const db = await getDB()
  return db.getAll('products')
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const db = await getDB()
  return db.get('products', id)
}

export async function saveProduct(product: Product): Promise<number> {
  const db = await getDB()
  return db.put('products', product) as Promise<number>
}

export async function deleteProduct(id: number): Promise<void> {
  const db = await getDB()
  await db.delete('products', id)
}

// ── Sales ─────────────────────────────────────────────────────────────────────

export async function insertSales(sales: Sale[]): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('sales', 'readwrite')
  await Promise.all([...sales.map(s => tx.store.add(s)), tx.done])
}

export async function getSalesByRange(start: number, end: number): Promise<Sale[]> {
  const db = await getDB()
  const all = await db.getAll('sales')
  return all.filter(s => s.saleDate >= start && s.saleDate <= end)
}

export async function getAllSales(): Promise<Sale[]> {
  const db = await getDB()
  return db.getAll('sales')
}

// ── Expenses ──────────────────────────────────────────────────────────────────

export async function getAllExpenses(): Promise<Expense[]> {
  const db = await getDB()
  return db.getAll('expenses')
}

export async function saveExpense(expense: Expense): Promise<void> {
  const db = await getDB()
  await db.put('expenses', expense)
}

export async function deleteExpense(id: number): Promise<void> {
  const db = await getDB()
  await db.delete('expenses', id)
}

export async function getExpensesByRange(start: number, end: number): Promise<Expense[]> {
  const db = await getDB()
  const all = await db.getAll('expenses')
  return all.filter(e => e.expenseDate >= start && e.expenseDate <= end)
}

// ── Date helpers ──────────────────────────────────────────────────────────────

export function startOfDay(date = new Date()): number {
  const d = new Date(date); d.setHours(0,0,0,0); return d.getTime()
}
export function endOfDay(date = new Date()): number {
  const d = new Date(date); d.setHours(23,59,59,999); return d.getTime()
}
export function startOfWeek(): number {
  const d = new Date(); d.setDate(d.getDate() - d.getDay()); d.setHours(0,0,0,0); return d.getTime()
}
export function startOfMonth(): number {
  const d = new Date(); d.setDate(1); d.setHours(0,0,0,0); return d.getTime()
}
export function endOfMonth(): number {
  const d = new Date(); d.setMonth(d.getMonth()+1,0); d.setHours(23,59,59,999); return d.getTime()
}
