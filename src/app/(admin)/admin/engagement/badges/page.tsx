'use client'

import { useState, useMemo } from 'react'
import { PROFILE_BADGES } from '@/lib/mock-lucky-draw'
import type { BadgeRarity } from '@/lib/mock-lucky-draw'

// ─── ロール ─────────────────────────────────────────────────────────

type Role = 'hq' | 'store' | 'viewer'

const ROLE_LABELS: Record<Role, string> = {
  hq: '本部管理者',
  store: '店舗管理者',
  viewer: '閲覧者',
}

// ─── モック統計データ ────────────────────────────────────────────────

const MOCK_STATS: Record<string, { holders: number; equipRate: number }> = {
  badge_first_visit: { holders: 1847, equipRate: 89 },
  badge_regular:     { holders:  952, equipRate: 73 },
  badge_challenger:  { holders:  634, equipRate: 61 },
  badge_lucky:       { holders:  287, equipRate: 85 },
  badge_night_owl:   { holders:  198, equipRate: 45 },
  badge_collector:   { holders:  143, equipRate: 78 },
  badge_legend:      { holders:   23, equipRate: 96 },
  badge_birthday:    { holders:  512, equipRate: 67 },
}

// ─── レアリティ表示 ──────────────────────────────────────────────────

const RARITY_LABEL: Record<BadgeRarity, string> = {
  standard: 'スタンダード',
  rare:     'レア',
  legend:   'レジェンド',
}

const RARITY_CHIP: Record<BadgeRarity, string> = {
  standard: 'bg-zinc-100 text-zinc-600',
  rare:     'bg-blue-50 text-blue-700',
  legend:   'bg-amber-50 text-amber-700',
}

type RarityFilter = 'all' | BadgeRarity

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
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

// ─── EquipRate バー ──────────────────────────────────────────────────

function EquipBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-emerald-400"
          style={{ width: `${rate}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-zinc-600">{rate}%</span>
    </div>
  )
}

// ─── ページ ────────────────────────────────────────────────────────

export default function BadgesAdminPage() {
  const [role, setRole] = useState<Role>('hq')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [search, setSearch] = useState('')
  const [publicStatus, setPublicStatus] = useState<Record<string, boolean>>(
    Object.fromEntries(PROFILE_BADGES.map((b) => [b.id, true]))
  )
  const [toast, setToast] = useState<string | null>(null)

  const isHQ = role === 'hq'

  // 統計サマリー
  const totalBadges = PROFILE_BADGES.length
  const rarePlusBadges = PROFILE_BADGES.filter((b) => b.rarity === 'rare' || b.rarity === 'legend').length
  const estimatedHolders = Object.values(MOCK_STATS).reduce((sum, s) => sum + s.holders, 0)

  // フィルタリング
  const filtered = useMemo(() => {
    return PROFILE_BADGES.filter((badge) => {
      if (rarityFilter !== 'all' && badge.rarity !== rarityFilter) return false
      if (search.trim()) {
        const q = search.trim().toLowerCase()
        if (
          !badge.label.toLowerCase().includes(q) &&
          !badge.description.toLowerCase().includes(q) &&
          !badge.acquisitionHint.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [rarityFilter, search])

  function toggleStatus(id: string) {
    if (!isHQ) return
    const next = !publicStatus[id]
    setPublicStatus((prev) => ({ ...prev, [id]: next }))
    showToast(next ? `「${PROFILE_BADGES.find(b => b.id === id)?.label}」を公開に設定しました` : `「${PROFILE_BADGES.find(b => b.id === id)?.label}」を非公開に設定しました`)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ヘッダー */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-zinc-800">バッジ管理</h1>
            <p className="text-sm text-zinc-500 mt-0.5">プロフィールに装備できるバッジの設定・公開状態の管理</p>
          </div>

          {/* ロール切替 */}
          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-sm flex-shrink-0">
            {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  role === r
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-800'
                }`}
              >
                {ROLE_LABELS[r]}
              </button>
            ))}
          </div>
        </div>

        {/* 非HQパーミッションバナー */}
        {!isHQ && (
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {role === 'store'
              ? '店舗管理者は閲覧のみ可能です。公開／非公開の変更は本部管理者が行います。'
              : '閲覧者はすべての操作が制限されています。'}
          </div>
        )}

        {/* 統計サマリー */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">総バッジ数</p>
            <p className="text-2xl font-bold text-zinc-900 tabular-nums mt-1">{totalBadges}</p>
            <p className="text-xs text-zinc-400 mt-0.5">種類</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">レア以上</p>
            <p className="text-2xl font-bold text-blue-700 tabular-nums mt-1">{rarePlusBadges}</p>
            <p className="text-xs text-zinc-400 mt-0.5">種類</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm">
            <p className="text-xs text-zinc-400 font-medium">推定総所持数</p>
            <p className="text-2xl font-bold text-zinc-900 tabular-nums mt-1">{estimatedHolders.toLocaleString()}</p>
            <p className="text-xs text-zinc-400 mt-0.5">件（延べ）</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="flex flex-wrap items-center gap-3">
          {/* レアリティフィルター */}
          <div className="flex items-center gap-1">
            {(['all', 'standard', 'rare', 'legend'] as RarityFilter[]).map((r) => (
              <button
                key={r}
                onClick={() => setRarityFilter(r)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  rarityFilter === r
                    ? 'bg-zinc-900 text-white'
                    : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {r === 'all' ? 'すべて' : RARITY_LABEL[r as BadgeRarity]}
              </button>
            ))}
          </div>

          {/* 検索 */}
          <div className="relative flex-1 min-w-[180px] max-w-xs">
            <svg
              width="14" height="14"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="バッジを検索…"
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>
        </div>

        {/* テーブル */}
        <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
                <th className="px-4 py-3 font-medium">バッジ</th>
                <th className="px-4 py-3 font-medium">レア度</th>
                <th className="px-4 py-3 font-medium">説明・取得方法</th>
                <th className="px-4 py-3 font-medium text-right">所持会員数</th>
                <th className="px-4 py-3 font-medium">装備率</th>
                <th className="px-4 py-3 font-medium">公開状態</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-400">
                    該当するバッジがありません
                  </td>
                </tr>
              ) : (
                filtered.map((badge, i) => {
                  const stats = MOCK_STATS[badge.id] ?? { holders: 0, equipRate: 0 }
                  const isPublic = publicStatus[badge.id] ?? true
                  const isLast = i === filtered.length - 1

                  return (
                    <tr
                      key={badge.id}
                      className={`hover:bg-zinc-50 transition-colors ${isLast ? '' : 'border-b border-zinc-50'}`}
                    >
                      {/* バッジ表示 */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span
                            style={{ fontSize: '2rem', lineHeight: 1 }}
                            role="img"
                            aria-label={badge.label}
                          >
                            {badge.emoji}
                          </span>
                          <div>
                            <p className="font-semibold text-zinc-800 leading-snug">{badge.label}</p>
                            <p className="text-xs text-zinc-400 font-mono mt-0.5">{badge.id}</p>
                          </div>
                        </div>
                      </td>

                      {/* レア度 */}
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${RARITY_CHIP[badge.rarity]}`}>
                          {RARITY_LABEL[badge.rarity]}
                        </span>
                      </td>

                      {/* 説明・取得方法 */}
                      <td className="px-4 py-3 max-w-[240px]">
                        <p className="text-zinc-700 leading-snug">{badge.description}</p>
                        <p className="text-xs text-zinc-400 mt-0.5">{badge.acquisitionHint}</p>
                      </td>

                      {/* 所持会員数 */}
                      <td className="px-4 py-3 text-right">
                        <span className="tabular-nums text-zinc-700 font-medium">
                          {stats.holders.toLocaleString()}
                        </span>
                        <span className="text-xs text-zinc-400 ml-0.5">人</span>
                      </td>

                      {/* 装備率 */}
                      <td className="px-4 py-3">
                        <EquipBar rate={stats.equipRate} />
                      </td>

                      {/* 公開状態トグル */}
                      <td className="px-4 py-3">
                        {isHQ ? (
                          <button
                            onClick={() => toggleStatus(badge.id)}
                            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 ${
                              isPublic ? 'bg-emerald-500' : 'bg-zinc-200'
                            }`}
                            role="switch"
                            aria-checked={isPublic}
                            aria-label={`${badge.label}の公開状態`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                                isPublic ? 'translate-x-4' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        ) : (
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              isPublic
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-zinc-100 text-zinc-500'
                            }`}
                          >
                            {isPublic ? '公開' : '非公開'}
                          </span>
                        )}
                        <span className={`ml-2 text-xs ${isPublic ? 'text-emerald-600' : 'text-zinc-400'}`}>
                          {isPublic ? '公開' : '非公開'}
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-right text-xs text-zinc-400">{filtered.length} 件</p>

      </div>

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
