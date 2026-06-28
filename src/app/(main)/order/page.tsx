'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CartItem } from '@/lib/types'

const CATEGORIES = ['フード', 'ドリンク', 'ボトル', 'シャンパン', 'その他']

type MenuItem = { id: string; name: string; price: number; category: string; description: string }

function OrderPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const storeName = searchParams.get('store') ?? 'JIS梅田'

  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState('フード')
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    const supabase = createClient()
    supabase.from('menu_items').select('*').then(({ data }) => setMenuItems(data ?? []))
  }, [])

  const filtered = menuItems.filter((item) => item.category === activeCategory)
  const totalCount = cart.reduce((sum, c) => sum + c.quantity, 0)

  function addToCart(id: string) {
    const item = menuItems.find((m) => m.id === id)
    if (!item) return
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id)
      if (existing) {
        return prev.map((c) => c.id === id ? { ...c, quantity: c.quantity + 1 } : c)
      }
      return [...prev, { ...item, quantity: 1 }]
    })
  }

  function getQuantity(id: string): number {
    return cart.find((c) => c.id === id)?.quantity ?? 0
  }

  // Pass cart data via sessionStorage so cart page can read it
  function goToCart() {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('cart', JSON.stringify(cart))
      sessionStorage.setItem('storeName', storeName)
    }
    router.push('/order/cart')
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800">
        <div className="flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-tight">注文</h1>
            <p className="text-xs text-zinc-500 leading-tight">{storeName}</p>
          </div>
          <button onClick={goToCart} className="relative p-2" aria-label="カートを見る">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {totalCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                {totalCount > 9 ? '9+' : totalCount}
              </span>
            )}
          </button>
        </div>

        {/* Category tabs */}
        <div className="flex overflow-x-auto scrollbar-hide border-t border-zinc-800/50">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeCategory === cat
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-28">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((item) => {
            const qty = getQuantity(item.id)
            return (
              <div key={item.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex flex-col">
                <p className="font-semibold text-sm text-white mb-1 leading-snug">{item.name}</p>
                <p className="text-xs text-zinc-500 mb-3 flex-1 leading-snug">{item.description}</p>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white font-bold text-sm">¥{item.price.toLocaleString()}</span>
                  {qty > 0 && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 font-semibold px-2 py-0.5 rounded-full">
                      × {qty}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(item.id)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-xl py-2 transition-colors border border-zinc-700 flex items-center justify-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  追加
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {totalCount > 0 && (
        <div className="fixed left-0 right-0 px-4 pb-4 pt-3 bg-black border-t border-zinc-800" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
          <button
            onClick={goToCart}
            className="w-full bg-white text-black font-bold rounded-xl py-4 flex items-center justify-center gap-2 text-base"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            カートを見る ({totalCount}点)
          </button>
        </div>
      )}
    </div>
  )
}

export default function OrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 text-sm">読み込み中...</div>}>
      <OrderPageInner />
    </Suspense>
  )
}
