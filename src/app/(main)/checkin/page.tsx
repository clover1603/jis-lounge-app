'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Session = {
  storeName: string
  checkedInAt: string
  groupSize: number
  totalAmount: number
}

export default function CheckinPage() {
  const router = useRouter()
  const [stores, setStores] = useState<{ id: string; name: string }[]>([])
  const [selectedStore, setSelectedStore] = useState('')
  const [step, setStep] = useState<'idle' | 'group' | 'active'>('idle')
  const [groupSize, setGroupSize] = useState(2)
  const [session, setSession] = useState<Session | null>(null)
  const [elapsed, setElapsed] = useState('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('stores').select('id, name').order('name').then(({ data }) => {
      const list = data ?? []
      setStores(list)
      if (list.length > 0) setSelectedStore(list[0].name)
    })
    const saved = localStorage.getItem('active_checkin')
    if (saved) {
      const s = JSON.parse(saved) as Session
      setSession(s)
      setStep('active')
    }
  }, [])

  useEffect(() => {
    if (step === 'active' && session) {
      function tick() {
        const diff = Date.now() - new Date(session!.checkedInAt).getTime()
        const h = Math.floor(diff / 3600000)
        const m = Math.floor((diff % 3600000) / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setElapsed(`${h > 0 ? h + '時間' : ''}${m}分${s}秒`)
      }
      tick()
      timerRef.current = setInterval(tick, 1000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step, session])

  function checkin() {
    const s: Session = {
      storeName: selectedStore,
      checkedInAt: new Date().toISOString(),
      groupSize,
      totalAmount: 0,
    }
    localStorage.setItem('active_checkin', JSON.stringify(s))
    setSession(s)
    setStep('active')
  }

  function checkout() {
    localStorage.removeItem('active_checkin')
    sessionStorage.removeItem('cart')
    sessionStorage.removeItem('storeName')
    if (timerRef.current) clearInterval(timerRef.current)
    setSession(null)
    setStep('idle')
  }

  const perPerson = session && session.groupSize > 0
    ? Math.floor(session.totalAmount / session.groupSize)
    : 0

  /* ─── 入店中画面 ─── */
  if (step === 'active' && session) {
    const inTime = new Date(session.checkedInAt).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center gap-2 px-4 h-14">
          <h1 className="text-lg font-bold">チェックイン中</h1>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full font-medium">● 入店中</span>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
          {/* 店舗・時間 */}
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-1">店舗</p>
            <p className="text-lg font-bold mb-4">{session.storeName}</p>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xs text-zinc-500 mb-1">入店時間</p>
                <p className="text-white font-bold text-xl">{inTime}</p>
              </div>
              <div className="border-x border-zinc-800">
                <p className="text-xs text-zinc-500 mb-1">滞在時間</p>
                <p className="text-white font-bold text-sm leading-tight">{elapsed}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 mb-1">グループ</p>
                <p className="text-white font-bold text-xl">{session.groupSize}<span className="text-sm font-normal text-zinc-400">名</span></p>
              </div>
            </div>
          </div>

          {/* 現在会計 */}
          <div className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800">
            <p className="text-xs text-zinc-500 mb-4">現在会計</p>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-400">グループ合計</span>
              <span className="text-white font-bold text-2xl">¥{session.totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
              <span className="text-sm text-zinc-400">一人当たり</span>
              <span className="text-yellow-400 font-bold text-2xl">¥{perPerson.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => router.push(`/order?store=${encodeURIComponent(session.storeName)}`)}
            className="w-full bg-white text-black font-bold rounded-xl py-4 text-base"
          >
            注文する
          </button>

          <button
            onClick={checkout}
            className="w-full border border-zinc-700 text-zinc-400 font-semibold rounded-xl py-3 text-sm"
          >
            退店する
          </button>
        </div>
      </div>
    )
  }

  /* ─── グループ人数入力 ─── */
  if (step === 'group') {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
          <button onClick={() => setStep('idle')} className="p-2 -ml-2 mr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-base font-bold">グループ人数</h1>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-10">
          <div className="text-center">
            <p className="text-zinc-400 text-sm">{selectedStore}</p>
            <p className="text-white font-bold text-lg mt-1">グループの人数を入力</p>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => setGroupSize(n => Math.max(1, n - 1))}
              className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white text-3xl font-bold"
            >
              −
            </button>
            <span className="text-white font-bold text-6xl w-20 text-center">{groupSize}</span>
            <button
              onClick={() => setGroupSize(n => Math.min(20, n + 1))}
              className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center text-white text-3xl font-bold"
            >
              +
            </button>
          </div>
          <p className="text-zinc-500 -mt-6">名</p>

          <button onClick={checkin} className="w-full bg-white text-black font-bold rounded-xl py-4 text-base">
            チェックイン
          </button>
        </div>
      </div>
    )
  }

  /* ─── QRスキャン画面 ─── */
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <h1 className="text-lg font-bold">チェックイン</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
        <div className="relative" style={{ width: 200, height: 200 }}>
          <span className="qr-corner absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-white rounded-tl-lg" style={{ animationDelay: '0s' }} />
          <span className="qr-corner absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-white rounded-tr-lg" style={{ animationDelay: '0.375s' }} />
          <span className="qr-corner absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-white rounded-bl-lg" style={{ animationDelay: '0.75s' }} />
          <span className="qr-corner absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-white rounded-br-lg" style={{ animationDelay: '1.125s' }} />
          <div className="absolute border border-zinc-800 rounded-lg" style={{ inset: 16 }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.2">
              <rect x="3" y="3" width="5" height="5" rx="0.5" /><rect x="3" y="16" width="5" height="5" rx="0.5" />
              <rect x="16" y="3" width="5" height="5" rx="0.5" />
              <line x1="3" y1="10" x2="8" y2="10" /><line x1="10" y1="3" x2="10" y2="8" />
              <line x1="10" y1="10" x2="15" y2="10" /><line x1="10" y1="16" x2="10" y2="21" />
              <line x1="16" y1="10" x2="21" y2="10" /><line x1="16" y1="16" x2="21" y2="16" />
              <line x1="16" y1="21" x2="21" y2="21" />
            </svg>
          </div>
        </div>

        <div className="text-center">
          <p className="text-zinc-300 text-sm">カメラでQRコードをスキャンしてください</p>
          <p className="text-zinc-600 text-xs mt-1">店内に設置されたQRコードにカメラを向けてください</p>
        </div>

        <div className="w-full">
          <label className="text-xs text-zinc-500 block mb-2 text-center">または店舗を選択してデモを実行</label>
          <select
            value={selectedStore}
            onChange={e => setSelectedStore(e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none"
          >
            {stores.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
          </select>
        </div>

        <button
          onClick={() => setStep('group')}
          disabled={!selectedStore}
          className="w-full bg-white text-black font-semibold rounded-xl py-4 text-base disabled:opacity-60"
        >
          スキャン成功（デモ）
        </button>
        <p className="text-zinc-600 text-xs text-center -mt-4">※ プロトタイプ用デモボタンです</p>
      </div>
    </div>
  )
}
