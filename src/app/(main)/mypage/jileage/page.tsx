'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_JILEAGE_BALANCE, JILEAGE_EXCHANGE_ITEMS } from '@/lib/mock-member-engagement'
import type { JileageExchangeItem } from '@/lib/mock-member-engagement'

type Category = 'all' | 'food' | 'app' | 'limited'

const CATEGORY_LABELS: { id: Category; label: string }[] = [
  { id: 'all',     label: 'すべて' },
  { id: 'food',    label: '飲食' },
  { id: 'app',     label: 'アプリ内特典' },
  { id: 'limited', label: '期間限定' },
]

function matchesCategory(item: JileageExchangeItem, cat: Category): boolean {
  if (cat === 'all') return true
  if (cat === 'food') return item.category === 'merchandise'
  if (cat === 'app') return ['lucky_ticket', 'card_theme', 'title', 'decoration'].includes(item.category)
  if (cat === 'limited') return item.category === 'seasonal_badge' || !!item.limitedUntil
  return true
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()}まで`
}

export default function JileagePage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState<Category>('all')
  const [selectedItem, setSelectedItem] = useState<JileageExchangeItem | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleConfirmExchange() {
    setSelectedItem(null)
    showToast('交換しました（デモ）')
  }

  const filtered = JILEAGE_EXCHANGE_ITEMS.filter(item => matchesCategory(item, activeCategory))

  return (
    <div className="flex flex-col min-h-screen bg-black">

      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-white text-sm px-5 py-3 rounded-2xl shadow-xl border border-zinc-700 pointer-events-none">
          {toast}
        </div>
      )}

      {/* Confirmation Modal */}
      {selectedItem && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          onClick={() => setSelectedItem(null)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-t-3xl p-6 pb-10"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-6" />
            <p className="text-xs text-zinc-500 mb-1 tracking-wider uppercase">交換確認</p>
            <p className="text-lg font-bold text-white mb-1">{selectedItem.title}</p>
            <p className="text-sm text-zinc-400 mb-5">{selectedItem.description}</p>
            <div className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3 mb-5">
              <span className="text-sm text-zinc-400">交換コスト</span>
              <span className="text-lg font-black text-purple-400">{selectedItem.cost.toLocaleString()}<span className="text-sm font-normal ml-0.5">pt</span></span>
            </div>
            <p className="text-xs text-zinc-600 text-center mb-6">交換後は取り消しできません</p>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedItem(null)}
                className="flex-1 py-3 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmExchange}
                className="flex-1 py-3 rounded-xl bg-purple-600 text-sm font-bold text-white"
              >
                交換する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">Jレージ</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* 残高カード */}
        <div
          className="rounded-2xl p-6 text-white"
          style={{ background: 'linear-gradient(135deg, #2e1065, #1e1b4b, #0f172a)' }}
        >
          <p className="text-xs text-white/50 mb-3 tracking-wider uppercase">Jレージ残高</p>
          <div className="flex items-end gap-1 mb-1">
            <span className="text-5xl font-black tabular-nums">{MOCK_JILEAGE_BALANCE.toLocaleString()}</span>
            <span className="text-xl font-semibold text-white/60 mb-1">pt</span>
          </div>
          <p className="text-xs text-white/30 mt-3">来店や評価提出でポイントが貯まります</p>
        </div>

        {/* 獲得方法 */}
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-xs text-zinc-300">来店 <span className="font-bold text-purple-400">+10pt</span></span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5" />
              <path d="M17.5 2.5a2.121 2.121 0 0 1 3 3L12 14l-4 1 1-4 7.5-7.5z" />
            </svg>
            <span className="text-xs text-zinc-300">評価提出 <span className="font-bold text-purple-400">+5pt</span></span>
          </div>
        </div>

        {/* 交換アイテム */}
        <div>
          <p className="text-xs text-zinc-500 mb-3 tracking-wider uppercase">景品・特典と交換</p>

          {/* カテゴリフィルター */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            {CATEGORY_LABELS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveCategory(id)}
                className={[
                  'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold border transition-all',
                  activeCategory === id
                    ? 'bg-purple-600 border-purple-600 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400',
                ].join(' ')}
              >
                {label}
              </button>
            ))}
          </div>

          {/* アイテムカード一覧 */}
          <div className="space-y-3">
            {filtered.map(item => (
              <div
                key={item.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      {item.isNew && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-600 text-white flex-shrink-0">NEW</span>
                      )}
                      {item.limitedUntil && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-amber-900/60 text-amber-400 border border-amber-800 flex-shrink-0">
                          {formatDate(item.limitedUntil)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500">{item.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-lg font-black text-purple-400 tabular-nums">{item.cost.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-600 -mt-0.5">pt</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedItem(item)}
                  disabled={!item.isAvailable || MOCK_JILEAGE_BALANCE < item.cost}
                  className="w-full py-2.5 rounded-xl border border-purple-700 text-purple-400 text-sm font-semibold transition-all disabled:opacity-30 disabled:border-zinc-700 disabled:text-zinc-600 active:bg-purple-900/30"
                >
                  {MOCK_JILEAGE_BALANCE < item.cost ? 'ポイント不足' : '交換する'}
                </button>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="text-zinc-600 text-sm text-center py-8">該当するアイテムがありません</p>
            )}
          </div>
        </div>

        <p className="text-zinc-700 text-xs text-center pb-2">※ UIデモ表示 ｜ 実データはPhase 2で連携予定</p>
      </div>
    </div>
  )
}
