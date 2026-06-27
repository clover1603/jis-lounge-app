'use client'

import { useState } from 'react'
import { mockStores } from '@/lib/mock-data'
import { Store } from '@/lib/types'

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>(mockStores)

  function toggleFavorite(id: string) {
    setStores((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    )
  }

  const sorted = [...stores].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1
    if (!a.isFavorite && b.isFavorite) return 1
    return 0
  })

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <h1 className="text-lg font-bold">店内人数</h1>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-2 gap-3">
          {sorted.map((store) => (
            <div key={store.id} className="bg-zinc-900 rounded-2xl p-4 relative">
              <button
                onClick={() => toggleFavorite(store.id)}
                className="absolute top-3 right-3 p-0.5"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill={store.isFavorite ? '#fbbf24' : 'none'} stroke={store.isFavorite ? '#fbbf24' : '#52525b'} strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </button>
              <p className="font-bold text-base pr-6">{store.name}</p>
              <p className="text-zinc-500 text-xs mt-0.5 mb-3">{store.nameEn}</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400 text-xs font-medium">♂</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-400 rounded-full"
                      style={{ width: `${Math.min(100, (store.male / 30) * 100)}%` }}
                    />
                  </div>
                  <span className="text-blue-400 text-xs font-bold w-5 text-right">{store.male}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-pink-400 text-xs font-medium">♀</span>
                  <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-pink-400 rounded-full"
                      style={{ width: `${Math.min(100, (store.female / 30) * 100)}%` }}
                    />
                  </div>
                  <span className="text-pink-400 text-xs font-bold w-5 text-right">{store.female}</span>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                <span className="text-xs text-zinc-500">合計</span>
                <span className="text-white font-bold">{store.total}<span className="text-xs text-zinc-400 font-normal ml-0.5">人</span></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
