'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MOCK_JOURNEY, STORE_NAMES, CATEGORY_LABELS,
} from '@/lib/mock-member-journey'
import type { Achievement, AchievementCategory } from '@/lib/mock-member-journey'

const ALL_STORE_IDS = Object.keys(STORE_NAMES)

function AchievementCard({ achievement, onClick }: { achievement: Achievement; onClick: () => void }) {
  const unlocked = achievement.isUnlocked
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl border p-4 transition-colors ${
        unlocked ? 'border-zinc-700 bg-zinc-900' : 'border-zinc-800/60 bg-zinc-900/40'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
          unlocked ? 'bg-white/10' : 'bg-zinc-800'
        }`}>
          {unlocked ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold ${unlocked ? 'text-white' : 'text-zinc-600'}`}>
            {achievement.title}
          </p>
          <p className={`text-xs mt-0.5 ${unlocked ? 'text-zinc-400' : 'text-zinc-700'}`}>
            {unlocked ? achievement.description : '???'}
          </p>
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

function AchievementDetailModal({ achievement, onClose }: { achievement: Achievement; onClose: () => void }) {
  const unlocked = achievement.isUnlocked
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70" onClick={onClose}>
      <div
        className="w-full max-w-[430px] bg-zinc-900 rounded-t-3xl p-6 border-t border-zinc-800"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-8 h-1 bg-zinc-700 rounded-full mx-auto mb-5" />
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${unlocked ? 'bg-yellow-500/10 border border-yellow-500/30' : 'bg-zinc-800'}`}>
          {unlocked ? (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          )}
        </div>
        <h2 className={`text-lg font-bold text-center mb-1 ${unlocked ? 'text-white' : 'text-zinc-500'}`}>
          {unlocked ? achievement.title : '未解除'}
        </h2>
        <p className={`text-sm text-center mb-4 ${unlocked ? 'text-zinc-400' : 'text-zinc-700'}`}>
          {unlocked ? achievement.description : 'この実績はまだ解除されていません'}
        </p>
        {unlocked && achievement.unlockedAt && (
          <p className="text-xs text-center text-zinc-600 mb-4">
            解除日: {new Date(achievement.unlockedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        )}
        <span className="block text-[10px] text-center text-zinc-700 mb-4">
          カテゴリ: {CATEGORY_LABELS[achievement.category]}
        </span>
        <button
          onClick={onClose}
          className="w-full py-3 bg-zinc-800 text-white font-semibold rounded-xl text-sm"
        >
          閉じる
        </button>
      </div>
    </div>
  )
}

export default function MemoryPage() {
  const router = useRouter()
  const data = MOCK_JOURNEY
  const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all')
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null)

  const unlockedCount = data.achievements.filter(a => a.isUnlocked).length
  const totalCount = data.achievements.length

  const filteredAchievements = activeCategory === 'all'
    ? data.achievements
    : data.achievements.filter(a => a.category === activeCategory)

  const categories: Array<{ key: AchievementCategory | 'all'; label: string }> = [
    { key: 'all', label: 'すべて' },
    { key: 'visit', label: '来店' },
    { key: 'order', label: '注文' },
    { key: 'store', label: '店舗' },
    { key: 'profile', label: 'プロフィール' },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">Memory</h1>
        <span className="ml-2 text-xs text-zinc-500">実績・記録</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* サマリー */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">記録サマリー</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-black text-white tabular-nums">{unlockedCount}<span className="text-zinc-600 text-sm font-normal">/{totalCount}</span></p>
              <p className="text-[11px] text-zinc-500 mt-0.5">実績解除</p>
            </div>
            <div className="border-x border-zinc-800">
              <p className="text-2xl font-black text-white tabular-nums">{data.visitedStoreIds.length}<span className="text-zinc-600 text-sm font-normal">/{ALL_STORE_IDS.length}</span></p>
              <p className="text-[11px] text-zinc-500 mt-0.5">利用店舗</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white tabular-nums">{data.continuousMonths}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">継続月数</p>
            </div>
          </div>
          <div className="mt-4 w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full"
              style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
            />
          </div>
          <p className="text-zinc-600 text-[10px] mt-1.5 text-right">実績達成率 {Math.round((unlockedCount / totalCount) * 100)}%</p>
        </div>

        {/* 店舗コレクション */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">訪問店舗</p>
          <div className="grid grid-cols-4 gap-2">
            {ALL_STORE_IDS.map(id => {
              const visited = data.visitedStoreIds.includes(id)
              const name = STORE_NAMES[id]
              const short = name.replace('JIS', '')
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xs font-bold border ${
                    visited ? 'border-zinc-600 bg-zinc-800 text-white' : 'border-zinc-800 bg-transparent text-zinc-700'
                  }`}>
                    {visited ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    )}
                  </div>
                  <p className={`text-[10px] text-center leading-tight ${visited ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    {short}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* カテゴリタブ */}
        <div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                  activeCategory === cat.key
                    ? 'bg-white text-black border-white'
                    : 'bg-transparent text-zinc-400 border-zinc-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 mt-3">
            {filteredAchievements.map(a => (
              <AchievementCard
                key={a.id}
                achievement={a}
                onClick={() => setSelectedAchievement(a)}
              />
            ))}
          </div>
        </div>

        <p className="text-zinc-700 text-xs text-center pb-2">
          ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
        </p>
      </div>

      {selectedAchievement && (
        <AchievementDetailModal
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  )
}
