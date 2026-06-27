'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockStores } from '@/lib/mock-data'

export default function CheckinPage() {
  const router = useRouter()
  const [selectedStore, setSelectedStore] = useState(mockStores[4].name) // J梅田 default
  const [scanState, setScanState] = useState<'idle' | 'success'>('idle')

  function handleScan() {
    setScanState('success')
    setTimeout(() => {
      router.push(`/order?store=${encodeURIComponent(selectedStore)}`)
    }, 800)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <h1 className="text-lg font-bold">チェックイン</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        {/* QR scan frame — 200×200px */}
        <div className="relative" style={{ width: 200, height: 200 }}>
          {/* Animated corner brackets */}
          <span
            className="qr-corner absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg"
            style={{ animationDelay: '0s' }}
          />
          <span
            className="qr-corner absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg"
            style={{ animationDelay: '0.375s' }}
          />
          <span
            className="qr-corner absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg"
            style={{ animationDelay: '0.75s' }}
          />
          <span
            className="qr-corner absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg"
            style={{ animationDelay: '1.125s' }}
          />

          {/* Inner guide border */}
          <div className="absolute border border-zinc-800 rounded-lg" style={{ inset: 16 }} />

          {/* Center content */}
          <div className="absolute inset-0 flex items-center justify-center">
            {scanState === 'success' ? (
              <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center animate-scale-in">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            ) : (
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.2">
                <rect x="3" y="3" width="5" height="5" rx="0.5" />
                <rect x="3" y="16" width="5" height="5" rx="0.5" />
                <rect x="16" y="3" width="5" height="5" rx="0.5" />
                <line x1="3" y1="10" x2="8" y2="10" />
                <line x1="10" y1="3" x2="10" y2="8" />
                <line x1="10" y1="10" x2="15" y2="10" />
                <line x1="10" y1="16" x2="10" y2="21" />
                <line x1="16" y1="10" x2="21" y2="10" />
                <line x1="16" y1="16" x2="21" y2="16" />
                <line x1="16" y1="21" x2="21" y2="21" />
              </svg>
            )}
          </div>
        </div>

        <div className="text-center">
          <p className="text-zinc-300 text-sm">カメラでQRコードをスキャンしてください</p>
          <p className="text-zinc-600 text-xs mt-1">店内に設置されたQRコードにカメラを向けてください</p>
        </div>

        {/* Store selector */}
        <div className="w-full">
          <label className="text-xs text-zinc-500 block mb-2 text-center">または店舗を選択してデモを実行</label>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600"
          >
            {mockStores.map((store) => (
              <option key={store.id} value={store.name}>{store.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleScan}
          disabled={scanState === 'success'}
          className="w-full bg-white text-black font-semibold rounded-xl py-4 text-base disabled:opacity-60 transition-opacity"
        >
          {scanState === 'success' ? 'スキャン成功...' : 'スキャン成功（デモ）'}
        </button>
        <p className="text-zinc-600 text-xs text-center -mt-4">※ プロトタイプ用デモボタンです</p>
      </div>
    </div>
  )
}
