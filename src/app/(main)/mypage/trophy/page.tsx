'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_JOURNEY, STORE_NAMES } from '@/lib/mock-member-journey'
import type { Achievement, AchievementCategory } from '@/lib/mock-member-journey'

// ─── 称号バッジデータ（既存マイページから統合） ─────────────────

type BadgeLevel = { label: string; requirement: number }
type BadgeCategory = { id: string; name: string; levels: BadgeLevel[]; current: number }

const BADGE_CATEGORIES: BadgeCategory[] = [
  { id: 'visit',    name: '来店回数',     current: 8,  levels: [{ label: '初回来店', requirement: 1 }, { label: '3回来店', requirement: 3 }, { label: '10回来店', requirement: 10 }, { label: '30回来店', requirement: 30 }, { label: '100回来店', requirement: 100 }] },
  { id: 'bottle',   name: 'ボトルキープ', current: 2,  levels: [{ label: 'ボトル初注文', requirement: 1 }, { label: 'ボトル5本', requirement: 5 }, { label: 'ボトル10本', requirement: 10 }] },
  { id: 'champagne',name: 'シャンパン',   current: 0,  levels: [{ label: 'シャンパン初注文', requirement: 1 }, { label: 'シャンパン5本', requirement: 5 }] },
  { id: 'profile',  name: 'プロフィール', current: 1,  levels: [{ label: 'プロフィール完成', requirement: 1 }] },
  { id: 'store',    name: '店舗開拓',     current: 3,  levels: [{ label: '3店舗利用', requirement: 3 }, { label: '5店舗利用', requirement: 5 }, { label: '全店舗制覇', requirement: 8 }] },
]

const ALL_STORE_IDS = Object.keys(STORE_NAMES)

type Tab = 'badge' | 'achievement' | 'store'

// ─── サブコンポーネント ──────────────────────────────────────────

function BadgeLevelItem({ level, earned, isNext, current, target }: {
  level: BadgeLevel; earned: boolean; isNext: boolean; current: number; target: number
}) {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0)
  return (
    <div className={`rounded-xl border px-4 py-3 ${earned ? 'border-yellow-500/40 bg-yellow-500/5' : 'border-zinc-800 bg-zinc-900/50'}`}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          {earned ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          )}
          <span className={`text-sm font-semibold ${earned ? 'text-white' : 'text-zinc-500'}`}>{level.label}</span>
        </div>
        <span className="text-xs tabular-nums text-zinc-500">{current}/{target}</span>
      </div>
      {!earned && isNext && (
        <>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-zinc-400 rounded-full" style={{ width: `${pct}%` }} />
          </div>
          {target - current === 1 && (
            <p className="text-xs text-yellow-400 mt-1">あと1で達成</p>
          )}
        </>
      )}
    </div>
  )
}

function AchievementCard({ achievement, onClick }: { achievement: Achievement; onClick: () => void }) {
  const unlocked = achievement.isUnlocked
  return (
    <button onClick={onClick} className={`w-full text-left rounded-2xl border p-4 transition-colors ${unlocked ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800/60 bg-zinc-900/40'}`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${unlocked ? 'bg-yellow-500/10' : 'bg-zinc-800'}`}>
          {unlocked ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-zinc-600'}`}>{achievement.title}</p>
          <p className={`text-xs mt-0.5 ${unlocked ? 'text-zinc-400' : 'text-zinc-700'}`}>{unlocked ? achievement.description : '???'}</p>
          {unlocked && achievement.unlockedAt && (
            <p className="text-[10px] text-zinc-600 mt-1">
              {new Date(achievement.unlockedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })} 解除
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

function AchievementModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const unlocked = achievement.isUnlocked
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div className="w-full max-w-[430px] bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800" onClick={e => e.stopPropagation()}>
        <div className="w-8 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${unlocked ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-zinc-800'}`}>
          {unlocked ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
        <h2 className={`text-lg font-bold text-center mb-1 ${unlocked ? 'text-white' : 'text-zinc-500'}`}>{unlocked ? achievement.title : '未解除'}</h2>
        <p className={`text-sm text-center mb-4 ${unlocked ? 'text-zinc-400' : 'text-zinc-700'}`}>{unlocked ? achievement.description : 'この実績はまだ解除されていません'}</p>
        {unlocked && achievement.unlockedAt && (
          <p className="text-xs text-center text-zinc-600 mb-5">
            解除日: {new Date(achievement.unlockedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <button onClick={onClose} className="w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl text-sm">閉じる</button>
      </div>
    </div>
  )
}

// ─── メインページ ────────────────────────────────────────────────

export default function TrophyPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('badge')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const data = MOCK_JOURNEY

  // 称号タブ: 全バッジ数
  const totalBadgeEarned = BADGE_CATEGORIES.reduce((sum, cat) => sum + cat.levels.filter(l => cat.current >= l.requirement).length, 0)
  const totalBadge = BADGE_CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0)

  // 実績タブ
  const unlockedCount = data.achievements.filter(a => a.isUnlocked).length
  const totalCount = data.achievements.length

  const tabs: { key: Tab; label: string; count: string }[] = [
    { key: 'badge',        label: '称号',     count: `${totalBadgeEarned}/${totalBadge}` },
    { key: 'achievement',  label: '実績',     count: `${unlockedCount}/${totalCount}` },
    { key: 'store',        label: '訪問店舗', count: `${data.visitedStoreIds.length}/${ALL_STORE_IDS.length}` },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">トロフィー</h1>
      </header>

      {/* サマリー */}
      <div className="mx-4 mt-5 grid grid-cols-3 gap-3">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-2xl border p-3 text-center transition-colors ${activeTab === t.key ? 'border-zinc-600 bg-zinc-800' : 'border-zinc-800 bg-zinc-900/50'}`}
          >
            <p className="text-lg font-black text-white tabular-nums">{t.count.split('/')[0]}<span className="text-zinc-600 text-sm font-normal">/{t.count.split('/')[1]}</span></p>
            <p className="text-[11px] text-zinc-500 mt-0.5">{t.label}</p>
          </button>
        ))}
      </div>

      {/* タブ */}
      <div className="mx-4 mt-4 flex rounded-xl overflow-hidden border border-zinc-800">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === t.key ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

        {/* 称号タブ */}
        {activeTab === 'badge' && (
          <div className="space-y-4">
            {BADGE_CATEGORIES.map(cat => {
              const earned = cat.levels.filter(l => cat.current >= l.requirement)
              const nextLevel = cat.levels.find(l => cat.current < l.requirement)
              return (
                <div key={cat.id} className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-white">{cat.name}</p>
                    <span className="text-xs text-zinc-500 tabular-nums">{earned.length}/{cat.levels.length}</span>
                  </div>
                  <div className="space-y-2">
                    {cat.levels.map(level => (
                      <BadgeLevelItem
                        key={level.label}
                        level={level}
                        earned={cat.current >= level.requirement}
                        isNext={level === nextLevel}
                        current={cat.current}
                        target={level.requirement}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 実績タブ */}
        {activeTab === 'achievement' && (
          <div className="space-y-2">
            {data.achievements.map(a => (
              <AchievementCard key={a.id} achievement={a} onClick={() => setSelectedAchievement(a)} />
            ))}
          </div>
        )}

        {/* 訪問店舗タブ */}
        {activeTab === 'store' && (
          <div className="grid grid-cols-2 gap-3">
            {ALL_STORE_IDS.map(id => {
              const visited = data.visitedStoreIds.includes(id)
              const name = STORE_NAMES[id]
              return (
                <div
                  key={id}
                  className={`rounded-2xl border p-4 flex items-center gap-3 ${visited ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800/50 bg-zinc-900/30'}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${visited ? 'bg-white/10' : 'bg-zinc-800'}`}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={visited ? '#fff' : '#3f3f46'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${visited ? 'text-white' : 'text-zinc-600'}`}>{name}</p>
                    <p className={`text-xs mt-0.5 ${visited ? 'text-zinc-400' : 'text-zinc-700'}`}>{visited ? '訪問済み' : '未訪問'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <p className="text-zinc-700 text-xs text-center pb-2">
          ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
        </p>
      </div>

      {selectedAchievement && (
        <AchievementModal achievement={selectedAchievement} onClose={() => setSelectedAchievement(null)} />
      )}
    </div>
  )
}
