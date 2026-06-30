'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type Store = {
  id: string
  name: string
  mens_count: number
  womens_count: number
  isFavorite: boolean
}

const STORE_INFO_IDS: Record<string, number> = {
  FUKUOKA:   1,
  SAPPORO:   2,
  NAMBA:     3,
  KUMAMOTO:  5,
  UMEDA:     9,
  NSHINJUKU: 11,
  SHINJUKU:  12,
  CHAYA:     13,
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('store_favorites')
    if (saved) setFavorites(new Set(JSON.parse(saved)))
    loadStores()
  }, [])

  async function loadStores() {
    const supabase = createClient()
    const { data } = await supabase.from('stores').select('id, name, mens_count, womens_count').order('name')
    setStores((data ?? []).map((s: Omit<Store, 'isFavorite'>) => ({ ...s, isFavorite: false })))
    setLoading(false)
  }

  function toggleFavorite(e: React.MouseEvent, id: string) {
    e.stopPropagation()
    setFavorites(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      localStorage.setItem('store_favorites', JSON.stringify([...next]))
      return next
    })
  }

  function openInfo(store: Store) {
    const infoId = STORE_INFO_IDS[store.id]
    if (infoId) window.open(`https://jisjis.com/info/ipadinfo/${infoId}/index.html`, '_blank')
  }

  const sorted = [...stores]
    .map(s => ({ ...s, isFavorite: favorites.has(s.id) }))
    .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite))

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <h1 className="text-lg font-bold">店内人数</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {loading && <p className="text-center text-zinc-500 mt-16">読み込み中...</p>}
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((store) => (
            <div
              key={store.id}
              onClick={() => openInfo(store)}
              className="bg-zinc-900 rounded-2xl p-4 relative cursor-pointer active:opacity-80"
            >
              <button onClick={e => toggleFavorite(e, store.id)} className="absolute top-3 right-3 p-0.5">
                <svg width="18" height="18" viewBox="0 0 24 24"
                  fill={store.isFavorite ? '#fbbf24' : 'none'}
                  stroke={store.isFavorite ? '#fbbf24' : '#52525b'}
                  strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <p className="font-bold text-sm pr-6">{store.name}</p>
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-medium">♂</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, (store.mens_count / 30) * 100)}%` }} />
                  </div>
                  <span className="text-blue-400 text-xs font-bold w-5 text-right">{store.mens_count}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-400 text-xs font-medium">♀</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-pink-400 rounded-full" style={{ width: `${Math.min(100, (store.womens_count / 30) * 100)}%` }} />
                  </div>
                  <span className="text-pink-400 text-xs font-bold w-5 text-right">{store.womens_count}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500">合計</span>
                <span className="text-white font-bold">
                  {store.mens_count + store.womens_count}
                  <span className="text-xs text-zinc-400 font-normal ml-0.5">人</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
