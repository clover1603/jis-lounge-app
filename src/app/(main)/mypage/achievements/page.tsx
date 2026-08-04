'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MOCK_ACHIEVEMENTS,
  AGE_GROUPS,
  VISITED_STORE_IDS,
  ALL_STORE_IDS_MAP,
} from '@/lib/mock-member-engagement'
import type { Achievement } from '@/lib/mock-member-engagement'

// ─── 定数 ────────────────────────────────────────────────────────

type Tab = '実績' | '店舗' | '年齢帯コレクション'
type CategoryFilter = 'すべて' | '来店' | '注文' | '店舗' | '評価' | '期間限定' | '隠し'

const TABS: Tab[] = ['実績', '店舗', '年齢帯コレクション']

const CATEGORY_FILTERS: { label: CategoryFilter; value: Achievement['category'] | null }[] = [
  { label: 'すべて',   value: null        },
  { label: '来店',     value: 'visit'     },
  { label: '注文',     value: 'order'     },
  { label: '店舗',     value: 'store'     },
  { label: '評価',     value: 'evaluation'},
  { label: '期間限定', value: 'seasonal'  },
  { label: '隠し',     value: 'hidden'    },
]

const RARITY_BADGE: Record<Achievement['rarity'], string> = {
  normal:  'bg-zinc-700 text-zinc-300',
  rare:    'bg-yellow-900/60 text-yellow-400 border border-yellow-700/50',
  special: 'bg-purple-900/60 text-purple-300 border border-purple-700/50',
}
const RARITY_LABEL: Record<Achievement['rarity'], string> = {
  normal:  'NORMAL',
  rare:    'RARE',
  special: 'SPECIAL',
}

// ─── サブコンポーネント ───────────────────────────────────────────

function AchievementCard({
  achievement,
  onClick,
}: {
  achievement: Achievement
  onClick: () => void
}) {
  const isHiddenLocked = achievement.isHidden && !achievement.isUnlocked

  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-2xl border border-zinc-800 bg-zinc-900 p-4 flex items-start gap-3 active:scale-[0.98] transition-transform"
    >
      {/* アイコン */}
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
          achievement.isUnlocked
            ? 'bg-yellow-500/20 text-yellow-400'
            : 'bg-zinc-800 text-zinc-600'
        }`}
      >
        {achievement.isUnlocked ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        )}
      </div>

      {/* テキスト */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-semibold text-sm ${achievement.isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
            {isHiddenLocked ? '???' : achievement.title}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${RARITY_BADGE[achievement.rarity]}`}>
            {RARITY_LABEL[achievement.rarity]}
          </span>
          {achievement.isLimited && achievement.limitedUntil && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-900/60 text-orange-300 border border-orange-700/50">
              〜{achievement.limitedUntil}
            </span>
          )}
        </div>
        <p className={`text-xs mt-0.5 ${achievement.isUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>
          {isHiddenLocked ? '???' : achievement.description}
        </p>
        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="text-[10px] text-zinc-600 mt-1">{achievement.unlockedAt} 解除</p>
        )}
      </div>
    </button>
  )
}

function DetailModal({
  achievement,
  onClose,
}: {
  achievement: Achievement
  onClose: () => void
}) {
  const isHiddenLocked = achievement.isHidden && !achievement.isUnlocked

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-zinc-900 border border-zinc-800 p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ハンドル */}
        <div className="w-10 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />

        {/* アイコン */}
        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
            achievement.isUnlocked
              ? 'bg-yellow-500/20 text-yellow-400'
              : 'bg-zinc-800 text-zinc-600'
          }`}
        >
          {achievement.isUnlocked ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          )}
        </div>

        {/* タイトル */}
        <h2 className="text-center text-lg font-bold text-white mb-1">
          {isHiddenLocked ? '???' : achievement.title}
        </h2>
        <p className="text-center text-sm text-zinc-400 mb-4">
          {isHiddenLocked ? '特定の行動で解除される隠し実績' : achievement.description}
        </p>

        {/* バッジ群 */}
        <div className="flex justify-center gap-2 flex-wrap mb-4">
          <span className={`text-xs px-2 py-0.5 rounded font-bold ${RARITY_BADGE[achievement.rarity]}`}>
            {RARITY_LABEL[achievement.rarity]}
          </span>
          {achievement.isLimited && achievement.limitedUntil && (
            <span className="text-xs px-2 py-0.5 rounded bg-orange-900/60 text-orange-300 border border-orange-700/50">
              期間限定 〜{achievement.limitedUntil}
            </span>
          )}
          {achievement.isHidden && (
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              隠し実績
            </span>
          )}
        </div>

        {/* 解除日 */}
        {achievement.isUnlocked && achievement.unlockedAt && (
          <p className="text-center text-xs text-zinc-500">解除日: {achievement.unlockedAt}</p>
        )}

        {!achievement.isUnlocked && (
          <p className="text-center text-xs text-zinc-600 mt-1">未解除</p>
        )}

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

// ─── タブコンテンツ ───────────────────────────────────────────────

function AchievementsTab() {
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('すべて')
  const [selected, setSelected] = useState<Achievement | null>(null)

  const filtered = MOCK_ACHIEVEMENTS.filter((a) => {
    if (categoryFilter === 'すべて') return true
    const cat = CATEGORY_FILTERS.find((c) => c.label === categoryFilter)
    return a.category === cat?.value
  })

  return (
    <>
      {/* カテゴリフィルター */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar px-4">
        {CATEGORY_FILTERS.map(({ label }) => (
          <button
            key={label}
            onClick={() => setCategoryFilter(label)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              categoryFilter === label
                ? 'bg-white text-black'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 実績カード一覧 */}
      <div className="flex flex-col gap-3 px-4">
        {filtered.map((a) => (
          <AchievementCard key={a.id} achievement={a} onClick={() => setSelected(a)} />
        ))}
      </div>

      {/* 詳細モーダル */}
      {selected && (
        <DetailModal achievement={selected} onClose={() => setSelected(null)} />
      )}
    </>
  )
}

function StoresTab() {
  const storeEntries = Object.entries(ALL_STORE_IDS_MAP)

  return (
    <div className="grid grid-cols-2 gap-3 px-4">
      {storeEntries.map(([id, name]) => {
        const visited = VISITED_STORE_IDS.includes(id)
        return (
          <div
            key={id}
            className={`rounded-2xl border p-4 flex flex-col items-center gap-2 ${
              visited
                ? 'border-zinc-700 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-950 opacity-50'
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                visited ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-600'
              }`}
            >
              {visited ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              )}
            </div>
            <span className={`text-sm font-semibold text-center ${visited ? 'text-white' : 'text-zinc-600'}`}>
              {name}
            </span>
            {visited && (
              <span className="text-[10px] text-indigo-400 font-medium">訪問済み</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function AgeGroupsTab() {
  const AGE_GROUP_ICONS: Record<string, string> = {
    '20-22': '🌸',
    '23-25': '✨',
    '26-29': '🌙',
    '30+':   '👑',
  }

  return (
    <div className="flex flex-col gap-3 px-4">
      {AGE_GROUPS.map((group) => (
        <div
          key={group.id}
          className={`rounded-2xl border p-4 flex items-center gap-4 ${
            group.isUnlocked
              ? 'border-zinc-700 bg-zinc-900'
              : 'border-zinc-800 bg-zinc-950 opacity-50'
          }`}
        >
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
              group.isUnlocked ? 'bg-pink-500/20' : 'bg-zinc-800'
            }`}
          >
            {group.isUnlocked ? (
              AGE_GROUP_ICONS[group.id]
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${group.isUnlocked ? 'text-white' : 'text-zinc-600'}`}>
                {group.label}
              </span>
              {group.isUnlocked && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-900/50 text-pink-300 border border-pink-700/40">
                  解除済み
                </span>
              )}
            </div>
            <p className={`text-xs mt-0.5 ${group.isUnlocked ? 'text-zinc-400' : 'text-zinc-600'}`}>
              {group.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── メインページ ─────────────────────────────────────────────────

export default function AchievementsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('実績')

  // サマリー計算
  const unlockedCount = MOCK_ACHIEVEMENTS.filter((a) => a.isUnlocked).length
  const totalCount    = MOCK_ACHIEVEMENTS.length
  const visitedCount  = VISITED_STORE_IDS.length
  const totalStores   = Object.keys(ALL_STORE_IDS_MAP).length
  const ageGroupUnlocked = AGE_GROUPS.filter((g) => g.isUnlocked).length
  const ageGroupTotal    = AGE_GROUPS.length

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* ヘッダー */}
      <div className="flex items-center gap-3 px-4 pt-12 pb-4">
        <button onClick={() => router.back()} className="text-zinc-400 hover:text-white transition-colors">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <h1 className="text-lg font-bold">実績・コレクション</h1>
      </div>

      {/* サマリー行 */}
      <div className="grid grid-cols-3 gap-2 px-4 mb-5">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-center">
          <p className="text-[10px] text-zinc-500 mb-1">解除済み</p>
          <p className="text-base font-bold text-white">
            {unlockedCount}<span className="text-zinc-500 text-xs font-normal">/{totalCount}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-center">
          <p className="text-[10px] text-zinc-500 mb-1">店舗制覇</p>
          <p className="text-base font-bold text-white">
            {visitedCount}<span className="text-zinc-500 text-xs font-normal">/{totalStores}</span>
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-3 text-center">
          <p className="text-[10px] text-zinc-500 mb-1">年齢帯</p>
          <p className="text-base font-bold text-white">
            {ageGroupUnlocked}<span className="text-zinc-500 text-xs font-normal">/{ageGroupTotal}</span>
          </p>
        </div>
      </div>

      {/* タブ行 */}
      <div className="flex gap-1 px-4 mb-5">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-white text-black'
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* タブコンテンツ */}
      <div className="flex flex-col gap-3">
        {activeTab === '実績'           && <AchievementsTab />}
        {activeTab === '店舗'           && <StoresTab />}
        {activeTab === '年齢帯コレクション' && <AgeGroupsTab />}
      </div>

      {/* フッターノート */}
      <p className="text-center text-[10px] text-zinc-700 mt-8 px-4">
        ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
      </p>
    </div>
  )
}
