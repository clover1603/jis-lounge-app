'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { mockMenuItems } from '@/lib/mock-data'
import { CartItem } from '@/lib/types'

const DEFAULT_CART: CartItem[] = [
  { ...mockMenuItems[0], quantity: 2 },
  { ...mockMenuItems[4], quantity: 1 },
]

const SERVICE_RATE = 0.1

export default function CartPage() {
  const router = useRouter()
  const [cart, setCart] = useState<CartItem[]>(DEFAULT_CART)
  const [storeName, setStoreName] = useState('J梅田')
  const [ordered, setOrdered] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('cart')
      const savedStore = sessionStorage.getItem('storeName')
      if (saved) {
        try {
          const parsed = JSON.parse(saved) as CartItem[]
          if (parsed.length > 0) setCart(parsed)
        } catch {
          // fall through to default
        }
      }
      if (savedStore) setStoreName(savedStore)
    }
  }, [])

  function changeQty(id: string, delta: number) {
    setCart((prev) =>
      prev
        .map((c) => c.id === id ? { ...c, quantity: c.quantity + delta } : c)
        .filter((c) => c.quantity > 0)
    )
  }

  function removeItem(id: string) {
    setCart((prev) => prev.filter((c) => c.id !== id))
  }

  const subtotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0)
  const service = Math.floor(subtotal * SERVICE_RATE)
  const total = subtotal + service

  function confirm() {
    setOrdered(true)
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('cart')
      sessionStorage.removeItem('storeName')
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold flex-1">カート</h1>
        {cart.length > 0 && (
          <span className="text-xs text-zinc-500">{cart.reduce((s, c) => s + c.quantity, 0)}点</span>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-48 space-y-3">
        {cart.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-zinc-500 text-sm">カートは空です。</p>
            <button onClick={() => router.back()} className="mt-4 text-blue-400 text-sm">メニューに戻る</button>
          </div>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">{item.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{item.description}</p>
                  <p className="text-white font-bold text-sm mt-1">¥{item.price.toLocaleString()}</p>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-zinc-600 hover:text-zinc-400 p-1 flex-shrink-0"
                  aria-label="削除"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => changeQty(item.id, -1)}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-lg font-bold hover:bg-zinc-700 transition-colors"
                    aria-label="減らす"
                  >
                    −
                  </button>
                  <span className="text-white font-bold w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => changeQty(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white text-lg font-bold hover:bg-zinc-700 transition-colors"
                    aria-label="増やす"
                  >
                    +
                  </button>
                </div>
                <span className="text-white font-bold text-sm">
                  ¥{(item.price * item.quantity).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 px-4 py-4">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">小計</span>
              <span className="text-white text-sm">¥{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-400 text-sm">サービス料 (10%)</span>
              <span className="text-white text-sm">¥{service.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <span className="text-white font-bold">合計</span>
              <span className="text-white font-bold text-lg">¥{total.toLocaleString()}</span>
            </div>
          </div>
          <button
            onClick={confirm}
            disabled={cart.length === 0}
            className="w-full bg-white text-black font-bold rounded-xl py-4 text-base disabled:opacity-40 transition-opacity"
          >
            注文を確定する
          </button>
        </div>
      )}

      {/* Success modal */}
      {ordered && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-6">
          <div className="bg-zinc-900 rounded-2xl p-8 w-full max-w-xs text-center border border-zinc-800">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h2 className="text-lg font-bold mb-1">ご注文を承りました</h2>
            <p className="text-zinc-400 text-sm mb-1">{storeName}</p>
            <p className="text-zinc-500 text-xs mb-6">しばらくお待ちください</p>
            <button
              onClick={() => router.push('/board')}
              className="w-full bg-white text-black font-semibold rounded-xl py-3 text-sm"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
