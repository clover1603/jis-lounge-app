'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  loadState,
  saveState,
  canClaimTicket1,
  canClaimTicket2,
  claimDailyReward,
  completeDaily,
  getDailyCount,
} from '@/lib/engagement-storage'
import type { EngagementState } from '@/lib/engagement-storage'
import {
  DAILY_CHALLENGES,
  WEEKLY_CHALLENGES,
  PERMANENT_CHALLENGES,
  EVENT_CHALLENGES,
  REWARD_ICON_PATH,
} from '@/lib/mock-challenges'
import type { Challenge } from '@/lib/mock-challenges'

// ─── Types ───────────────────────────────────────────────────────

type TabKey = 'daily' | 'weekly' | 'permanent' | 'event'

const TABS: { key: TabKey; label: string }[] = [
  { key: 'daily',     label: 'デイリー' },
  { key: 'weekly',    label: 'ウィークリー' },
  { key: 'permanent', label: '恒久' },
  { key: 'event',     label: 'イベント' },
]

// ─── ProgressBar ─────────────────────────────────────────────────

function ProgressBar({
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
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
  return (
    <div className="space-y-1">
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${completed ? 'bg-zinc-600' : 'bg-amber-400'}`}
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

function ChallengeCard({
  challenge,
  isCompleted,
  onComplete,
  showPeriod,
}: {
  challenge: Challenge
  isCompleted: boolean
  onComplete?: () => void
  showPeriod?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-zinc-800 bg-zinc-900 p-4 space-y-3 ${
        isCompleted ? 'opacity-60' : ''
      }`}
    >
      {/* top row */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-semibold leading-snug flex-1 ${isCompleted ? 'text-zinc-400' : 'text-white'}`}>
          {challenge.title}
        </p>
        {isCompleted ? (
          <span className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 rounded-full px-2 py-0.5">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            達成
          </span>
        ) : (
          <span className="flex-shrink-0 text-[10px] font-semibold text-zinc-500 bg-zinc-800 rounded-full px-2 py-0.5">
            進行中
          </span>
        )}
      </div>

      {/* description */}
      <p className="text-xs text-zinc-500">{challenge.description}</p>

      {/* event period */}
      {showPeriod && (
        <p className="text-[10px] text-zinc-600">
          {showPeriod}
        </p>
      )}

      {/* progress */}
      {isCompleted ? (
        <div className="flex items-center gap-2">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span className="text-xs text-zinc-600">クリア済み</span>
        </div>
      ) : (
        <ProgressBar
          current={challenge.current}
          target={challenge.target}
          unit={challenge.unit}
          completed={false}
        />
      )}

      {/* reward */}
      <div className="flex items-center gap-1.5">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d={REWARD_ICON_PATH[challenge.rewardType]} />
        </svg>
        <span className="text-xs text-zinc-500">{challenge.rewardLabel}</span>
      </div>

      {/* action button (active only) */}
      {!isCompleted && onComplete && (
        <button
          onClick={onComplete}
          className="w-full text-xs font-semibold bg-white text-black rounded-xl py-2 active:opacity-80 transition-opacity"
        >
          達成
        </button>
      )}
    </div>
  )
}

// ─── TicketRewardRow ─────────────────────────────────────────────

function TicketRewardRow({
  label,
  canClaim,
  claimed,
  onClaim,
}: {
  label: string
  canClaim: boolean
  claimed: boolean
  onClaim: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-zinc-300">{label}</span>
      {claimed ? (
        <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800 rounded-full px-3 py-1">
          受け取り済み
        </span>
      ) : canClaim ? (
        <button
          onClick={onClaim}
          className="text-[10px] font-semibold bg-amber-400 text-black rounded-full px-3 py-1 active:opacity-80 transition-opacity"
        >
          受け取る
        </button>
      ) : (
        <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-800 rounded-full px-3 py-1">
          {label.startsWith('2') ? '2件達成で解放' : '3件達成で解放'}
        </span>
      )}
    </div>
  )
}

// ─── Toast ───────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div
      aria-live="polite"
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-white text-xs font-semibold rounded-full px-5 py-2.5 shadow-lg transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
    >
      {message}
    </div>
  )
}

// ─── DailyTab ────────────────────────────────────────────────────

function DailyTab({
  state,
  onChange,
  onToast,
}: {
  state: EngagementState
  onChange: (s: EngagementState) => void
  onToast: (msg: string) => void
}) {
  const completedIds = state.dailyProgress.completedChallengeIds
  const count = getDailyCount(state)

  const handleComplete = useCallback(
    (challengeId: string) => {
      const next = completeDaily(state, challengeId)
      saveState(next)
      onChange(next)
    },
    [state, onChange],
  )

  const handleClaim = useCallback(
    (tier: 1 | 2) => {
      const next = claimDailyReward(state, tier)
      saveState(next)
      onChange(next)
      onToast('抽選券を受け取りました！')
    },
    [state, onChange, onToast],
  )

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {DAILY_CHALLENGES.map(c => {
          const isDone = completedIds.includes(c.id)
          return (
            <ChallengeCard
              key={c.id}
              challenge={{ ...c, status: isDone ? 'completed' : 'active', current: isDone ? c.target : c.current }}
              isCompleted={isDone}
              onComplete={isDone ? undefined : () => handleComplete(c.id)}
            />
          )
        })}
      </div>

      {/* Ticket reward section */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 space-y-1">
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          チケット報酬
        </p>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-3">
          <div
            className="h-full bg-amber-400 rounded-full transition-all"
            style={{ width: `${Math.min(100, Math.round((count / 3) * 100))}%` }}
          />
        </div>
        <p className="text-[10px] text-zinc-600 mb-2 tabular-nums">{count} / 3 件達成</p>
        <div className="divide-y divide-zinc-800">
          <TicketRewardRow
            label="2件達成 → 抽選券×1"
            canClaim={canClaimTicket1(state)}
            claimed={state.dailyProgress.ticket1Claimed}
            onClaim={() => handleClaim(1)}
          />
          <TicketRewardRow
            label="3件達成 → 抽選券×1"
            canClaim={canClaimTicket2(state)}
            claimed={state.dailyProgress.ticket2Claimed}
            onClaim={() => handleClaim(2)}
          />
        </div>
      </div>
    </div>
  )
}

// ─── WeeklyTab ───────────────────────────────────────────────────

function WeeklyTab() {
  const [completedIds, setCompletedIds] = useState<string[]>([])

  const handleComplete = (id: string) => {
    setCompletedIds(prev => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <div className="space-y-3">
      {WEEKLY_CHALLENGES.map(c => {
        const isDone = completedIds.includes(c.id)
        const periodLabel = c.endAt ? `〜 ${c.endAt}` : undefined
        return (
          <ChallengeCard
            key={c.id}
            challenge={{ ...c, status: isDone ? 'completed' : 'active' }}
            isCompleted={isDone}
            onComplete={isDone ? undefined : () => handleComplete(c.id)}
            showPeriod={periodLabel}
          />
        )
      })}
    </div>
  )
}

// ─── PermanentTab ────────────────────────────────────────────────

function PermanentTab() {
  return (
    <div className="space-y-3">
      {PERMANENT_CHALLENGES.map(c => (
        <ChallengeCard
          key={c.id}
          challenge={c}
          isCompleted={c.status === 'completed'}
        />
      ))}
    </div>
  )
}

// ─── EventTab ────────────────────────────────────────────────────

function EventTab() {
  const [completedIds, setCompletedIds] = useState<string[]>([])

  const handleComplete = (id: string) => {
    setCompletedIds(prev => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <div className="space-y-3">
      {EVENT_CHALLENGES.map(c => {
        const isDone = completedIds.includes(c.id)
        const period =
          c.startAt && c.endAt
            ? `${c.startAt} 〜 ${c.endAt}`
            : c.endAt
            ? `〜 ${c.endAt}`
            : undefined
        return (
          <ChallengeCard
            key={c.id}
            challenge={{ ...c, status: isDone ? 'completed' : c.status }}
            isCompleted={isDone}
            onComplete={isDone ? undefined : () => handleComplete(c.id)}
            showPeriod={period}
          />
        )
      })}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [tab, setTab] = useState<TabKey>('daily')
  const [state, setState] = useState<EngagementState | null>(null)
  const [toastMsg, setToastMsg] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => {
    setState(loadState())
  }, [])

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }, [])

  if (!state) {
    return (
      <div className="flex min-h-screen bg-black items-center justify-center">
        <span className="text-zinc-600 text-sm">読み込み中…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <Link
          href="/mypage"
          className="p-2 -ml-2 mr-2"
          aria-label="マイページへ戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </Link>
        <h1 className="text-base font-bold text-white">チャレンジ</h1>
      </header>

      {/* Tab switcher */}
      <div className="px-4 pt-3 pb-2 flex gap-2 overflow-x-auto scrollbar-none">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-shrink-0 text-xs font-semibold rounded-full px-4 py-1.5 border transition-colors ${
              tab === t.key
                ? 'bg-white text-black border-white'
                : 'bg-transparent text-zinc-400 border-zinc-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28">
        {tab === 'daily' && (
          <DailyTab state={state} onChange={setState} onToast={showToast} />
        )}
        {tab === 'weekly' && <WeeklyTab />}
        {tab === 'permanent' && <PermanentTab />}
        {tab === 'event' && <EventTab />}

        <p className="text-zinc-700 text-xs text-center pt-6">
          ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
        </p>
      </div>

      {/* Bottom fixed: くじを引く */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-black/90 border-t border-zinc-800 px-4 py-3 max-w-[430px] mx-auto">
        <Link
          href="/mypage/lucky-draw"
          className="flex items-center justify-between bg-amber-400 text-black font-bold rounded-2xl px-5 py-3 active:opacity-80 transition-opacity"
        >
          <span className="text-sm">くじを引く</span>
          <div className="flex items-center gap-2">
            <span className="text-sm tabular-nums">
              抽選券 {state.tickets}枚
            </span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </Link>
      </div>

      {/* Toast */}
      <Toast message={toastMsg} visible={toastVisible} />
    </div>
  )
}
