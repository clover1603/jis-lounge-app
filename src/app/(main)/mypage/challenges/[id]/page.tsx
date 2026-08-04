'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ALL_CHALLENGES,
  CATEGORY_LABEL,
  REWARD_ICON_PATH,
} from '@/lib/mock-challenges'

// ─── helpers ─────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

function periodLabel(type: string) {
  if (type === 'daily')      return '本日中'
  if (type === 'weekly')     return '今週中'
  if (type === 'monthly')    return '今月中'
  if (type === 'cumulative') return '累計'
  if (type === 'permanent')  return '累計'
  if (type === 'event')      return '期間限定'
  return '期間限定'
}

// ─── BigProgressBar ──────────────────────────────────────────────

function BigProgressBar({
  current,
  target,
  unit,
  completed,
}: {
  current: number
  target: number
  unit: string
  completed: boolean
}) {
  const pct     = Math.min(100, target > 0 ? Math.round((current / target) * 100) : 0)
  const remaining = target - current
  const isClose   = remaining > 0 && remaining / target < 0.3

  return (
    <div className="space-y-3">
      <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            completed ? 'bg-emerald-500' : 'bg-white'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between">
        {completed ? (
          <span className="text-sm text-emerald-400 font-semibold">
            {current} / {target} {unit} 達成
          </span>
        ) : (
          <span className="text-sm text-zinc-400 tabular-nums">
            {current} / {target} {unit}
            {isClose && (
              <span className="ml-2 text-amber-400 font-semibold">
                あと{remaining}{unit}
              </span>
            )}
          </span>
        )}
        <span className="text-xs text-zinc-600 tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}

// ─── InfoCard ────────────────────────────────────────────────────

function InfoCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-2">
      <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">{label}</p>
      {children}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────

export default function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router  = useRouter()
  const challenge = ALL_CHALLENGES.find(c => c.id === id)

  if (!challenge) {
    return (
      <div className="flex flex-col min-h-screen bg-black">
        <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
          <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className="text-base font-bold text-white">チャレンジ詳細</h1>
        </header>
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-8 text-center">
          <p className="text-zinc-400 text-sm">チャレンジが見つかりません</p>
          <button
            onClick={() => router.back()}
            className="text-xs text-zinc-500 underline underline-offset-4"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  const completed = challenge.status === 'completed'
  const pLabel    = periodLabel(challenge.periodType)

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-white truncate">{challenge.title}</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-10 space-y-4">

        {/* Completed banner */}
        {completed && (
          <div className="mt-4 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span className="text-sm font-semibold text-emerald-400">達成済み</span>
          </div>
        )}

        {/* Hero */}
        <div className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-5 space-y-4 ${completed ? '' : 'mt-4'}`}>
          {/* Category + period */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-medium bg-zinc-700 text-zinc-300 rounded-full px-2.5 py-1">
              {CATEGORY_LABEL[challenge.category]}
            </span>
            <span className="text-[10px] font-medium bg-zinc-800 text-zinc-500 rounded-full px-2.5 py-1">
              {pLabel}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-white leading-snug">{challenge.title}</h2>

          {/* Description */}
          <p className="text-sm text-zinc-400 leading-relaxed">{challenge.description}</p>

          {/* Note */}
          {challenge.note && (
            <p className="text-xs text-zinc-600 leading-relaxed">{challenge.note}</p>
          )}

          {/* Big progress bar */}
          <BigProgressBar
            current={challenge.current}
            target={challenge.target}
            unit={challenge.unit}
            completed={completed}
          />
        </div>

        {/* 達成条件カード */}
        <InfoCard label="達成条件">
          <p className="text-sm text-white leading-relaxed">{challenge.description}</p>
          <div className="flex items-center gap-4 pt-1">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              <span className="text-xs text-zinc-500">{pLabel}</span>
            </div>
            {challenge.endAt && (
              <div className="flex items-center gap-1.5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-xs text-zinc-500">期限: {formatDate(challenge.endAt)}</span>
              </div>
            )}
          </div>
        </InfoCard>

        {/* 報酬カード */}
        <InfoCard label="報酬">
          <div className="flex items-center gap-3 pt-1">
            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d={REWARD_ICON_PATH[challenge.rewardType]} />
              </svg>
            </div>
            <p className="text-base font-semibold text-white">{challenge.rewardLabel}</p>
          </div>
        </InfoCard>

        {/* Action button */}
        {!completed && challenge.actionHref && (
          <div className="pt-2">
            <Link
              href={challenge.actionHref}
              className="block w-full bg-white text-black text-center font-semibold rounded-2xl py-4 text-sm active:scale-[0.98] transition-transform"
            >
              {challenge.actionLabel ?? '次のアクションへ'}
            </Link>
          </div>
        )}

        <p className="text-zinc-700 text-xs text-center pt-4">
          ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
        </p>
      </div>
    </div>
  )
}
