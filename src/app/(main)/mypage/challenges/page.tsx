'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MOCK_CHALLENGES,
  MOCK_COMPLETED_CHALLENGES,
  CATEGORY_LABEL,
  REWARD_ICON_PATH,
  getActiveCount,
  getNextChallenge,
} from '@/lib/mock-challenges'
import type { Challenge, ChallengeCategory } from '@/lib/mock-challenges'

// ─── ChallengeProgressBar ────────────────────────────────────────

function ChallengeProgressBar({
  current,
  target,
  unit,
  completed,
}: {
  current: number
  target: number
  unit: string
  completed?: boolean
}) {
  const pct = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0)
  return (
    <div className="space-y-1.5">
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${completed ? 'bg-zinc-600' : 'bg-white'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between items-center">
        <span className="text-xs text-zinc-500 tabular-nums">
          {current}/{target} {unit}
        </span>
        <span className="text-xs text-zinc-600 tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}

// ─── ChallengeCard ───────────────────────────────────────────────

function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const completed = challenge.status === 'completed'
  const periodLabel =
    challenge.periodType === 'monthly'
      ? '今月'
      : challenge.periodType === 'cumulative'
      ? '累計'
      : '期間限定'

  return (
    <Link href={`/mypage/challenges/${challenge.id}`} className="block">
      <div
        className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3 transition-colors active:bg-zinc-800/80 ${
          completed ? 'opacity-60' : ''
        }`}
      >
        {/* Row 1: badges + status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium bg-zinc-700 text-zinc-300 rounded-full px-2 py-0.5">
              {CATEGORY_LABEL[challenge.category]}
            </span>
            <span className="text-[10px] font-medium bg-zinc-800 text-zinc-500 rounded-full px-2 py-0.5">
              {periodLabel}
            </span>
          </div>
          {completed ? (
            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              達成
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-zinc-400 bg-zinc-800 rounded-full px-2 py-0.5">
              進行中
            </span>
          )}
        </div>

        {/* Row 2: title */}
        <p className={`text-sm font-semibold leading-snug ${completed ? 'text-zinc-400' : 'text-white'}`}>
          {challenge.title}
        </p>

        {/* Row 3: description */}
        <p className="text-xs text-zinc-500 truncate">{challenge.description}</p>

        {/* Row 4: progress */}
        {completed ? (
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-xs text-zinc-600">
              {challenge.current}/{challenge.target} {challenge.unit} 達成済み
            </span>
          </div>
        ) : (
          <ChallengeProgressBar
            current={challenge.current}
            target={challenge.target}
            unit={challenge.unit}
            completed={false}
          />
        )}

        {/* Row 5: reward */}
        <div className="flex items-center gap-1.5 pt-0.5">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#71717a"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d={REWARD_ICON_PATH[challenge.rewardType]} />
          </svg>
          <span className="text-xs text-zinc-500">{challenge.rewardLabel}</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Section header ──────────────────────────────────────────────

function SectionHeader({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{label}</h2>
      <span className="text-xs text-zinc-600">{count}件</span>
    </div>
  )
}

// ─── Category tabs ───────────────────────────────────────────────

type FilterCategory = 'all' | ChallengeCategory

const FILTER_TABS: { key: FilterCategory; label: string }[] = [
  { key: 'all',     label: 'すべて' },
  { key: 'visit',   label: '来店' },
  { key: 'rating',  label: '評価' },
  { key: 'order',   label: '注文' },
  { key: 'seating', label: '相席' },
]

// ─── Page ────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterCategory>('all')

  const activeCount  = getActiveCount()
  const completedCount = MOCK_COMPLETED_CHALLENGES.length
  const recommended  = getNextChallenge()

  const filteredActive = MOCK_CHALLENGES.filter(
    c => c.status === 'active' && (filter === 'all' || c.category === filter)
  )
  const filteredCompleted = MOCK_COMPLETED_CHALLENGES.filter(
    c => filter === 'all' || c.category === filter
  )

  const showRecommended =
    filter === 'all' && recommended !== undefined

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-white">チャレンジ</h1>
      </header>

      {/* Summary strip */}
      <div className="px-4 pt-4 pb-2 flex gap-2">
        <div className="flex-1 bg-zinc-900 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-white tabular-nums">{activeCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">進行中</p>
        </div>
        <div className="flex-1 bg-zinc-900 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-white tabular-nums">{completedCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">達成済み</p>
        </div>
        <div className="flex-1 bg-zinc-900 rounded-xl px-3 py-2 text-center">
          <p className="text-lg font-black text-zinc-600 tabular-nums">—</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">今月</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-4 pt-2 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex-shrink-0 text-xs font-semibold rounded-full px-4 py-1.5 border transition-colors ${
              filter === tab.key
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-400 border-zinc-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-6">

        {/* おすすめ section */}
        {showRecommended && recommended && (
          <section>
            <SectionHeader label="おすすめ" count={1} />
            <ChallengeCard challenge={recommended} />
          </section>
        )}

        {/* 進行中 section */}
        {filteredActive.length > 0 && (
          <section>
            <SectionHeader label="進行中" count={filteredActive.length} />
            <div className="space-y-3">
              {filteredActive
                .filter(c => !showRecommended || c.id !== recommended?.id)
                .map(c => (
                  <ChallengeCard key={c.id} challenge={c} />
                ))}
            </div>
          </section>
        )}

        {/* 達成済み section */}
        {filteredCompleted.length > 0 && (
          <section>
            <SectionHeader label="達成済み" count={filteredCompleted.length} />
            <div className="space-y-3">
              {filteredCompleted.map(c => (
                <ChallengeCard key={c.id} challenge={c} />
              ))}
            </div>
          </section>
        )}

        {filteredActive.length === 0 && filteredCompleted.length === 0 && (
          <p className="text-center text-zinc-600 text-sm pt-12">
            このカテゴリのチャレンジはありません
          </p>
        )}

        <p className="text-zinc-700 text-xs text-center pt-2">
          ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
        </p>
      </div>
    </div>
  )
}
