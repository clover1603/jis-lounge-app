'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_TITLES, MOCK_STREAK, MOCK_STATUS_SUMMARY } from '@/lib/mock-member-engagement'
import type { MemberTitle } from '@/lib/mock-member-engagement'
import { MOCK_RANK_PROGRESS, RANK_ACCENT, ALL_RANKS } from '@/lib/mock-member-journey'

// inline-style gradients (RANK_GRADIENT from the lib exports Tailwind class strings)
const RANK_GRADIENT_STYLE: Record<string, string> = {
  BRONZE:   'linear-gradient(135deg, #92400e, #78350f)',
  SILVER:   'linear-gradient(135deg, #52525b, #27272a)',
  GOLD:     'linear-gradient(135deg, #a16207, #78350f)',
  PLATINUM: 'linear-gradient(135deg, #1e3a5f, #0f172a)',
  DIAMOND:  'linear-gradient(135deg, #1e1b4b, #0f172a)',
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function CheckIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export default function StatusPage() {
  const router = useRouter()
  const rank = MOCK_STATUS_SUMMARY.rank
  const accentColor = RANK_ACCENT[rank]
  const { seatingHours, requiredHours, rating, nextRank } = MOCK_RANK_PROGRESS
  const rankIdx = ALL_RANKS.indexOf(rank)

  const initialSelected = MOCK_TITLES.find(t => t.isSelected)?.id ?? MOCK_TITLES[0].id
  const [selectedTitleId, setSelectedTitleId] = useState<string>(initialSelected)
  const [committed, setCommitted] = useState<string>(initialSelected)
  const [toast, setToast] = useState<string | null>(null)

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  function handleChange() {
    setCommitted(selectedTitleId)
    showToast('称号を変更しました（デモ）')
  }

  const { visitStreak, visitStreakBest, ratingStreak, ratingStreakBest, ratingStreakReward, ratingStreakCap } = MOCK_STREAK

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Toast */}
      {toast && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-white text-sm px-5 py-3 rounded-2xl shadow-xl border border-zinc-700 pointer-events-none">
          {toast}
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">会員ステータス</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* ランクヒーローカード */}
        <div
          className="rounded-2xl p-6 shadow-2xl"
          style={{
            background: RANK_GRADIENT_STYLE[rank] ?? RANK_GRADIENT_STYLE.SILVER,
            boxShadow: `0 0 40px ${accentColor}44`,
          }}
        >
          <p className="text-xs tracking-widest text-white/50 uppercase mb-1">Current Rank</p>
          <p className="text-4xl font-black tracking-widest mb-1" style={{ color: accentColor }}>{rank}</p>
          <p className="text-white/40 text-xs mb-5">JIS.bar 会員ランク</p>

          <div className="flex gap-6 mb-5">
            <div>
              <p className="text-xs text-white/50 mb-0.5">総相席時間</p>
              <p className="text-lg font-bold text-white">{seatingHours}<span className="text-sm font-normal text-white/60">h</span></p>
            </div>
            <div>
              <p className="text-xs text-white/50 mb-0.5">評価スコア</p>
              <p className="text-lg font-bold text-white">{rating}<span className="text-sm font-normal text-white/60">点</span></p>
            </div>
          </div>

          {nextRank ? (
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-white/50">次のランクまで</span>
                <span className="font-semibold" style={{ color: RANK_ACCENT[nextRank] }}>{nextRank}</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (seatingHours / requiredHours) * 100)}%`,
                    backgroundColor: accentColor,
                  }}
                />
              </div>
              <p className="text-white/30 text-[10px] mt-1.5 text-right">
                {seatingHours}h / {requiredHours}h
              </p>
            </div>
          ) : (
            <p className="text-xs pt-4 border-t border-white/10" style={{ color: accentColor }}>
              最高ランクに到達しています
            </p>
          )}
        </div>

        {/* 称号セレクター */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">表示称号</p>
          <div className="space-y-2">
            {MOCK_TITLES.map((t: MemberTitle) => {
              const isSelected = selectedTitleId === t.id
              return (
                <button
                  key={t.id}
                  disabled={!t.isEarned}
                  onClick={() => t.isEarned && setSelectedTitleId(t.id)}
                  className={[
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
                    t.isEarned ? 'cursor-pointer' : 'cursor-default opacity-40',
                    isSelected
                      ? 'border-zinc-500 bg-zinc-800'
                      : 'border-zinc-800 bg-zinc-900/50',
                  ].join(' ')}
                >
                  {/* Radio dot */}
                  <span
                    className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                    style={{
                      borderColor: isSelected ? accentColor : '#52525b',
                      backgroundColor: isSelected ? accentColor : 'transparent',
                    }}
                  >
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-black" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{t.title}</p>
                    <p className="text-xs text-zinc-600 truncate">{t.description}</p>
                  </div>
                  {!t.isEarned && (
                    <span className="text-zinc-600 flex-shrink-0">
                      <LockIcon />
                    </span>
                  )}
                  {t.isEarned && committed === t.id && selectedTitleId !== t.id && (
                    <span className="text-xs text-zinc-500">現在</span>
                  )}
                  {t.isEarned && committed === t.id && selectedTitleId === t.id && (
                    <CheckIcon color={accentColor} />
                  )}
                </button>
              )
            })}
          </div>
          <button
            onClick={handleChange}
            disabled={selectedTitleId === committed}
            className="mt-4 w-full py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-30"
            style={{
              backgroundColor: accentColor,
              color: '#000',
            }}
          >
            変更する
          </button>
        </div>

        {/* 連続記録 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">連続記録</p>
          <div className="space-y-5">

            {/* 来店ストリーク */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-white">
                  来店 <span style={{ color: accentColor }}>{visitStreak}</span> か月連続
                </p>
                <p className="text-xs text-zinc-500">ベスト {visitStreakBest} か月</p>
              </div>
              <ProgressBar value={visitStreak} max={visitStreakBest} color={accentColor} />
            </div>

            {/* 評価ストリーク */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-white">
                  評価 <span style={{ color: accentColor }}>{ratingStreak}</span> 回連続
                </p>
                <p className="text-xs text-zinc-500">ベスト {ratingStreakBest} 回</p>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-zinc-400">評価ボーナス</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${accentColor}22`, color: accentColor }}>
                  +{ratingStreakReward}pt
                </span>
                <span className="text-xs text-zinc-600">（上限 {ratingStreakCap}pt）</span>
              </div>
              <ProgressBar value={ratingStreak} max={ratingStreakBest} color={accentColor} />
            </div>

          </div>
        </div>

        <p className="text-zinc-700 text-xs text-center pb-2">※ UIデモ表示</p>
      </div>
    </div>
  )
}
