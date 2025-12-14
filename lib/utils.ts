import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || 'ج.م'
  return `${amount.toFixed(2)} ${currency}`
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Africa/Cairo',
  })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Cairo',
  })
}

export function calculateProfit(sellingPrice: number, buyingPrice: number, quantity: number = 1): number {
  return (sellingPrice - buyingPrice) * quantity
}

export function calculateProfitMargin(sellingPrice: number, buyingPrice: number): number {
  if (buyingPrice === 0) return 0
  return ((sellingPrice - buyingPrice) / buyingPrice) * 100
}
