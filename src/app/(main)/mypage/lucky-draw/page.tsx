'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  loadState,
  saveState,
  type EngagementState,
  type StoredDraw,
} from '@/lib/engagement-storage'
import {
  executeSingleDraw,
  executeTenDraws,
  applyDrawResults,
  type SingleDrawResult,
  type DrawReward,
} from '@/lib/mock-lucky-draw'

// ─── Types ───────────────────────────────────────────────────────────────────

type DrawPhase = 'idle' | 'animating' | 'result'

// ─── Rarity helpers ──────────────────────────────────────────────────────────

const RARITY_BORDER: Record<string, string> = {
  miss:   'border-zinc-700',
  normal: 'border-zinc-600',
  rare:   'border-blue-500',
  legend: 'border-amber-400',
}

const RARITY_LABEL: Record<string, string> = {
  miss:   'はずれ',
  normal: 'ノーマル',
  rare:   'レア',
  legend: 'レジェンド',
}

const RARITY_BADGE_CLASS: Record<string, string> = {
  miss:   'bg-zinc-700 text-zinc-400',
  normal: 'bg-zinc-600 text-zinc-200',
  rare:   'bg-blue-900 text-blue-300',
  legend: 'bg-amber-900 text-amber-300',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${mm}/${dd} ${hh}:${min}`
}

function drawTypeLabel(type: StoredDraw['drawType']): string {
  switch (type) {
    case 'ticket_single':  return 'チケット 1回'
    case 'ticket_ten':     return 'チケット 10回'
    case 'jileage_single': return 'Jレージ 1回'
    case 'jileage_ten':    return 'Jレージ 10回'
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function RewardCard({
  result,
  index,
  reduced,
}: {
  result: SingleDrawResult
  index: number
  reduced: boolean
}) {
  const { reward, isDuplicate, duplicateJileage } = result
  const isLegend = reward.rarity === 'legend'
  const delay = reduced ? 0 : index * 100

  return (
    <div
      className={`relative rounded-xl border-2 ${RARITY_BORDER[reward.rarity]} bg-zinc-900 flex flex-col items-center justify-center p-3 gap-1 overflow-hidden`}
      style={{
        animation: reduced
          ? 'none'
          : `prizeReveal 0.45s ease-out both`,
        animationDelay: `${delay}ms`,
        boxShadow:
          reward.rarity === 'legend'
            ? '0 0 20px rgba(251,191,36,0.4)'
            : reward.rarity === 'rare'
            ? '0 0 12px rgba(59,130,246,0.35)'
            : 'none',
      }}
    >
      {/* legend pulse ring */}
      {isLegend && (
        <div
          className="absolute inset-0 rounded-xl"
          style={{ animation: 'goldPulse 2s ease-in-out infinite' }}
        />
      )}

      <span className="text-3xl leading-none select-none">{reward.emoji}</span>
      <span className="text-xs text-zinc-200 font-medium text-center leading-tight">
        {reward.rarity === 'miss' ? 'はずれ' : reward.label}
      </span>
      <span
        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${RARITY_BADGE_CLASS[reward.rarity]}`}
      >
        {RARITY_LABEL[reward.rarity]}
      </span>

      {/* duplicate overlay */}
      {isDuplicate && reward.rarity !== 'miss' && (
        <div className="absolute inset-0 rounded-xl bg-black/70 flex flex-col items-center justify-center gap-0.5">
          <span className="text-[10px] text-zinc-400">すでに所持</span>
          <span className="text-xs text-amber-400 font-bold">+{duplicateJileage}J</span>
        </div>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LuckyDrawPage() {
  const router = useRouter()
  const [state, setState] = useState<EngagementState | null>(null)
  const [phase, setPhase] = useState<DrawPhase>('idle')
  const [results, setResults] = useState<SingleDrawResult[]>([])
  const [showSkip, setShowSkip] = useState(false)
  const [reduced, setReduced] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setState(loadState())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
  }, [])

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current)
  }, [])

  const advanceToResult = useCallback(() => {
    clearTimers()
    setShowSkip(false)
    setPhase('result')
  }, [clearTimers])

  const startDraw = useCallback(
    (
      drawFn: (owned: string[]) => SingleDrawResult[],
      costType: 'ticket1' | 'ticket10' | 'jileage200' | 'jileage1800',
      drawType: StoredDraw['drawType'],
    ) => {
      if (!state) return

      // deduct cost
      let next = { ...state }
      if (costType === 'ticket1') next = { ...next, tickets: next.tickets - 1 }
      else if (costType === 'ticket10') next = { ...next, tickets: next.tickets - 10 }
      else if (costType === 'jileage200') next = { ...next, jileage: next.jileage - 200 }
      else if (costType === 'jileage1800') next = { ...next, jileage: next.jileage - 1800 }

      const owned = [...next.ownedFrameIds, ...next.ownedBadgeIds]
      const drawResults = drawFn(owned)
      setResults(drawResults)

      const applied = applyDrawResults(next, drawResults, drawType)
      saveState(applied)
      setState(applied)

      if (reduced) {
        setPhase('result')
        return
      }

      setPhase('animating')
      setShowSkip(false)

      skipTimerRef.current = setTimeout(() => setShowSkip(true), 1000)
      timerRef.current = setTimeout(() => advanceToResult(), 3000)
    },
    [state, reduced, advanceToResult],
  )

  const closeResult = useCallback(() => {
    setPhase('idle')
    setResults([])
    setShowSkip(false)
  }, [])

  if (!state) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const canTicket1 = state.tickets >= 1
  const canTicket10 = state.tickets >= 10
  const canJileage1 = state.jileage >= 200
  const canJileage10 = state.jileage >= 1800
  const recentHistory = state.drawHistory.slice(0, 3)

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%,100%{transform:translateY(0) scale(1)}
          50%{transform:translateY(-12px) scale(1.04)}
        }
        @keyframes goldPulse {
          0%,100%{opacity:0.7;box-shadow:0 0 20px rgba(251,191,36,0.4)}
          50%{opacity:1;box-shadow:0 0 60px rgba(251,191,36,0.9)}
        }
        @keyframes fadeInUp {
          from{opacity:0;transform:translateY(20px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes prizeReveal {
          0%{opacity:0;transform:scale(0.5) rotate(-10deg)}
          60%{transform:scale(1.1) rotate(2deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        @keyframes spin {
          to{transform:rotate(360deg)}
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fbbf24 0%, #fef3c7 40%, #fbbf24 60%, #d97706 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-text { animation: none; }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-white max-w-[430px] mx-auto flex flex-col pb-10">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button
            onClick={() => router.push('/mypage')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 active:bg-zinc-700 transition-colors"
            aria-label="戻る"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-300">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-bold tracking-wide">ラッキーくじ</h1>
        </header>

        {/* Balance card */}
        <div className="mx-4 mb-6 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex gap-4">
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 font-medium">チケット</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">🎫</span>
              <span className="text-2xl font-bold text-white tabular-nums">{state.tickets}</span>
              <span className="text-sm text-zinc-400">枚</span>
            </div>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 font-medium">Jレージ</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">💎</span>
              <span className="text-2xl font-bold text-amber-400 tabular-nums">{state.jileage.toLocaleString()}</span>
              <span className="text-sm text-zinc-400">J</span>
            </div>
          </div>
        </div>

        {/* Draw buttons */}
        <div className="mx-4 flex flex-col gap-3">
          {/* Ticket section */}
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">チケットで引く</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={!canTicket1}
              onClick={() => startDraw(
                (owned) => [executeSingleDraw(owned)],
                'ticket1',
                'ticket_single',
              )}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:active:scale-95
                bg-gradient-to-br from-amber-600 to-amber-800 text-white
                shadow-lg enabled:shadow-amber-900/50"
            >
              <span className="text-xl">🎫</span>
              <span>1回引く</span>
              <span className="text-xs text-amber-200 font-normal">チケット 1枚</span>
            </button>
            <button
              disabled={!canTicket10}
              onClick={() => startDraw(
                executeTenDraws,
                'ticket10',
                'ticket_ten',
              )}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:active:scale-95
                bg-gradient-to-br from-yellow-500 to-amber-700 text-white
                shadow-lg enabled:shadow-yellow-900/50"
            >
              <span className="text-xl">🎫🎫</span>
              <span>10回引く</span>
              <span className="text-xs text-yellow-100 font-normal">チケット 10枚</span>
            </button>
          </div>

          {/* Jileage section */}
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-2">Jレージで引く</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={!canJileage1}
              onClick={() => startDraw(
                (owned) => [executeSingleDraw(owned)],
                'jileage200',
                'jileage_single',
              )}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:active:scale-95
                bg-gradient-to-br from-blue-700 to-indigo-900 text-white
                shadow-lg enabled:shadow-blue-950/60"
            >
              <span className="text-xl">💎</span>
              <span>1回引く</span>
              <span className="text-xs text-blue-200 font-normal">200J</span>
            </button>
            <button
              disabled={!canJileage10}
              onClick={() => startDraw(
                executeTenDraws,
                'jileage1800',
                'jileage_ten',
              )}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed
                enabled:active:scale-95
                bg-gradient-to-br from-indigo-600 to-violet-900 text-white
                shadow-lg enabled:shadow-violet-950/60"
            >
              <span className="text-xl">💎💎</span>
              <span>10回引く</span>
              <span className="text-xs text-indigo-200 font-normal">1800J</span>
            </button>
          </div>
        </div>

        {/* Rates info */}
        <div className="mx-4 mt-5 rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-500 mb-2 font-semibold">排出率</p>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-500">はずれ</span>
              <span className="text-zinc-300 font-bold">50%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-400">ノーマル</span>
              <span className="text-zinc-200 font-bold">35%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-blue-400">レア</span>
              <span className="text-blue-300 font-bold">10%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-amber-400">レジェンド</span>
              <span className="text-amber-300 font-bold">5%</span>
            </div>
          </div>
        </div>

        {/* Recent history */}
        {recentHistory.length > 0 && (
          <div className="mx-4 mt-5">
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-2">最近の履歴</p>
            <div className="flex flex-col gap-2">
              {recentHistory.map((draw) => {
                const legendCount = draw.rarities.filter(r => r === 'legend').length
                const rareCount = draw.rarities.filter(r => r === 'rare').length
                const normalCount = draw.rarities.filter(r => r === 'normal').length
                const missCount = draw.rarities.filter(r => r === 'miss').length
                return (
                  <div
                    key={draw.id}
                    className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-zinc-300 font-medium">{drawTypeLabel(draw.drawType)}</span>
                      <span className="text-[10px] text-zinc-600">{formatDate(draw.drawnAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap justify-end">
                      {legendCount > 0 && (
                        <span className="bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded-full">
                          レジェンド×{legendCount}
                        </span>
                      )}
                      {rareCount > 0 && (
                        <span className="bg-blue-900 text-blue-300 px-1.5 py-0.5 rounded-full">
                          レア×{rareCount}
                        </span>
                      )}
                      {normalCount > 0 && (
                        <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full">
                          ノーマル×{normalCount}
                        </span>
                      )}
                      {missCount > 0 && (
                        <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">
                          はずれ×{missCount}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Animation overlay ─────────────────────────────────────── */}
      {phase === 'animating' && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center"
          style={{ animation: 'fadeInUp 0.3s ease-out both' }}
        >
          {/* SKIP button */}
          {showSkip && (
            <button
              onClick={advanceToResult}
              className="absolute top-12 right-5 px-4 py-1.5 rounded-full bg-zinc-800 text-zinc-300 text-sm font-medium
                active:bg-zinc-700 transition-colors"
              style={{ animation: 'fadeInUp 0.25s ease-out both' }}
            >
              SKIP
            </button>
          )}

          {/* Gold orb */}
          <div
            className="w-36 h-36 rounded-full"
            style={{
              background: 'radial-gradient(circle at 35% 35%, #fef3c7 0%, #fbbf24 30%, #d97706 65%, #92400e 100%)',
              animation: 'orbFloat 2s ease-in-out infinite, goldPulse 2s ease-in-out infinite',
            }}
          />

          <p
            className="mt-8 text-base font-bold shimmer-text"
            aria-live="polite"
          >
            くじを引いています…
          </p>
        </div>
      )}

      {/* ── Result overlay ────────────────────────────────────────── */}
      {phase === 'result' && results.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/97 flex flex-col overflow-y-auto">
          <div className="flex flex-col items-center w-full max-w-[430px] mx-auto px-4 pt-12 pb-8 min-h-full">
            <h2
              className="text-xl font-bold mb-6 shimmer-text"
              style={{ animation: reduced ? 'none' : 'fadeInUp 0.3s ease-out both' }}
            >
              {results.length === 1 ? '結果' : '10連結果'}
            </h2>

            {/* Single result */}
            {results.length === 1 && (
              <div className="w-44 aspect-square">
                <RewardCard result={results[0]} index={0} reduced={reduced} />
              </div>
            )}

            {/* 10-draw grid: 2 columns × 5 rows */}
            {results.length > 1 && (
              <div className="grid grid-cols-2 gap-3 w-full">
                {results.map((r, i) => (
                  <RewardCard key={i} result={r} index={i} reduced={reduced} />
                ))}
              </div>
            )}

            <button
              onClick={closeResult}
              className="mt-8 w-full max-w-xs py-3.5 rounded-2xl bg-zinc-800 text-zinc-200 font-bold text-base
                active:bg-zinc-700 transition-colors"
              style={{
                animation: reduced
                  ? 'none'
                  : `fadeInUp 0.4s ease-out ${results.length * 100 + 300}ms both`,
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </>
  )
}
