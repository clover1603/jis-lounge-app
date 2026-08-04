'use client'

import { useState } from 'react'
import {
  MOCK_ADMIN_REWARDS,
  REWARD_CATEGORY_LABEL,
  type RewardCategory,
} from '@/lib/mock-engagement-admin'

// ─── カテゴリ表示順 ──────────────────────────────────────────────────

const CATEGORY_ORDER: RewardCategory[] = [
  'jileage',
  'draw_ticket',
  'coupon',
  'title_word',
  'trophy',
  'badge',
  'decoration',
]

// ─── トースト ────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
      <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

// ─── ページ ────────────────────────────────────────────────────────

export default function RewardsPage() {
  const [toast, setToast] = useState<string | null>(null)

  // 手動付与フォーム state
  const [userId, setUserId] = useState('')
  const [category, setCategory] = useState<RewardCategory>('jileage')
  const [rewardDetail, setRewardDetail] = useState('')
  const [reason, setReason] = useState('')

  // カテゴリ別グループ化
  const grouped = CATEGORY_ORDER.reduce<Record<RewardCategory, typeof MOCK_ADMIN_REWARDS>>(
    (acc, cat) => {
      acc[cat] = MOCK_ADMIN_REWARDS.filter((r) => r.category === cat)
      return acc
    },
    {} as Record<RewardCategory, typeof MOCK_ADMIN_REWARDS>,
  )

  function handleGrant() {
    if (!userId.trim() || !rewardDetail.trim() || !reason.trim()) {
      setToast('入力項目をすべて記入してください')
      setTimeout(() => setToast(null), 3000)
      return
    }
    const ok = window.confirm('付与してよいですか？')
    if (!ok) return
    setToast('付与しました（デモ）')
    setTimeout(() => setToast(null), 3000)
    setUserId('')
    setRewardDetail('')
    setReason('')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ページヘッダー */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">報酬管理</h1>
          <p className="text-sm text-zinc-500 mt-0.5">チャレンジ・くじ・Jレージ交換で付与できる報酬の一覧</p>
        </div>
        <button className="flex-shrink-0 bg-zinc-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-zinc-700 transition-colors">
          新規報酬を追加
        </button>
      </div>

      {/* カテゴリ別セクション */}
      {CATEGORY_ORDER.map((cat) => {
        const items = grouped[cat]
        if (items.length === 0) return null
        const isDecoration = cat === 'decoration'

        return (
          <section key={cat}>
            <h2 className="text-sm font-semibold text-zinc-700 border-b border-zinc-200 pb-2 mb-3">
              {REWARD_CATEGORY_LABEL[cat]}
            </h2>

            {/* プロフィール装飾 注記 */}
            {isDecoration && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 text-sm text-amber-800">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Phase 2で実装予定。現在はUIデモのみです。
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {items.map((reward) => (
                <div
                  key={reward.id}
                  className={`bg-white rounded-xl border border-zinc-200 shadow-sm p-4 flex flex-col gap-2 transition-opacity ${reward.isActive ? '' : 'opacity-60'}`}
                >
                  <p className="font-semibold text-sm text-zinc-800 leading-snug">{reward.name}</p>
                  <p className="text-xs text-zinc-500 flex-1 leading-relaxed">{reward.description}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-zinc-400">発行数 {reward.issuedCount}件</span>
                    {reward.isActive ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">有効</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-500">無効</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )
      })}

      {/* 手動付与パネル */}
      <section>
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-base font-bold text-zinc-800">手動付与</h2>
            <p className="text-xs text-zinc-400 mt-0.5">本部管理者・店舗管理者のみ操作可能（デモ表示）</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ユーザーID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600">ユーザーID</label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="例: u001"
                className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>

            {/* 報酬カテゴリ */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600">報酬カテゴリ</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as RewardCategory)}
                className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-300 bg-white"
              >
                {CATEGORY_ORDER.map((cat) => (
                  <option key={cat} value={cat}>{REWARD_CATEGORY_LABEL[cat]}</option>
                ))}
              </select>
            </div>

            {/* 付与内容 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600">付与内容</label>
              <input
                type="text"
                value={rewardDetail}
                onChange={(e) => setRewardDetail(e.target.value)}
                placeholder="例: Jレージ +100pt"
                className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300"
              />
            </div>

            {/* 付与理由 */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-600">付与理由</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="例: 運営判断による特別付与"
                className="text-sm border border-zinc-200 rounded-lg px-3 py-2 text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              onClick={handleGrant}
              className="bg-zinc-900 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-zinc-700 transition-colors"
            >
              付与する
            </button>
          </div>
        </div>
      </section>

      {/* トースト */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

    </div>
  )
}
