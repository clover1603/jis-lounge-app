'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MOCK_TICKETS_COUNT,
  MOCK_REWARDS_POOL,
  MOCK_DRAW_HISTORY,
  MOCK_TICKET_CONDITIONS,
  RARITY_COLOR,
  RARITY_LABEL,
} from '@/lib/mock-member-engagement'
import type { LuckyDrawReward, DrawRarity } from '@/lib/mock-member-engagement'

type DrawStage = 'idle' | 'spinning' | 'reveal' | 'done'

const RARITY_GLOW_CSS: Record<DrawRarity, string> = {
  STANDARD: '0 0 40px #a1a1aa66, 0 0 80px #a1a1aa33',
  GOLD:     '0 0 50px #eab30899, 0 0 100px #eab30844',
  SPECIAL:  '0 0 60px #a855f799, 0 0 120px #a855f744',
}

const RARITY_ORB_GRADIENT: Record<DrawRarity, string> = {
  STANDARD: 'conic-gradient(from 0deg, #71717a, #d4d4d8, #71717a, #a1a1aa, #71717a)',
  GOLD:     'conic-gradient(from 0deg, #78350f, #eab308, #ca8a04, #fef08a, #eab308, #78350f)',
  SPECIAL:  'conic-gradient(from 0deg, #581c87, #a855f7, #7c3aed, #e879f9, #a855f7, #581c87)',
}

export default function LuckyDrawPage() {
  const router = useRouter()

  const [tickets, setTickets] = useState(MOCK_TICKETS_COUNT)
  const [stage, setStage] = useState<DrawStage>('idle')
  const [result, setResult] = useState<LuckyDrawReward | null>(null)

  function handleDraw() {
    if (tickets <= 0) return
    setTickets(t => t - 1)
    setStage('spinning')

    const r = Math.random()
    const specials = MOCK_REWARDS_POOL.filter(x => x.rarity === 'SPECIAL')
    const golds    = MOCK_REWARDS_POOL.filter(x => x.rarity === 'GOLD')
    const stds     = MOCK_REWARDS_POOL.filter(x => x.rarity === 'STANDARD')
    const pick =
      r < 0.05
        ? specials[Math.floor(Math.random() * specials.length)]
        : r < 0.25
        ? golds[Math.floor(Math.random() * golds.length)]
        : stds[Math.floor(Math.random() * stds.length)]

    setResult(pick)
    setTimeout(() => setStage('reveal'), 2000)
    setTimeout(() => setStage('done'), 2400)
  }

  function handleClose() {
    setStage('idle')
    setResult(null)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ── CSS Keyframe Animations ── */}
      <style>{`
        @keyframes lotterySpinOrb {
          0%   { transform: scale(1)    rotate(0deg);   opacity: 0.6; }
          50%  { transform: scale(1.15) rotate(180deg); opacity: 1;   }
          100% { transform: scale(1)    rotate(360deg); opacity: 0.6; }
        }
        @keyframes lotteryPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1;   }
        }
        @keyframes lotteryReveal {
          0%   { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1)   translateY(0);    }
        }
        @keyframes lotterySpark {
          0%   { transform: scale(0)   rotate(0deg);   opacity: 1; }
          60%  { opacity: 0.8; }
          100% { transform: scale(1.5) rotate(720deg); opacity: 0; }
        }
        @keyframes lotteryOrbitRing {
          0%   { transform: rotate(0deg);   }
          100% { transform: rotate(360deg); }
        }
        @keyframes lotteryTextPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 1;   }
        }
        @keyframes lotteryBgBreath {
          0%, 100% { opacity: 0.15; }
          50%      { opacity: 0.35; }
        }
        @media (prefers-reduced-motion: reduce) {
          .lottery-spin    { animation: none !important; }
          .lottery-reveal  { animation: none !important; }
          .lottery-spark   { animation: none !important; }
          .lottery-orbit   { animation: none !important; }
          .lottery-pulse   { animation: none !important; }
          .lottery-bgbrth  { animation: none !important; }
        }
      `}</style>

      {/* ── Header ── */}
      <header className="flex items-center gap-3 px-4 pt-safe-top pt-4 pb-4 border-b border-white/10">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center w-9 h-9 rounded-full bg-white/10 active:bg-white/20 transition-colors"
          aria-label="戻る"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-lg font-bold tracking-wide">ラッキーくじ</h1>
      </header>

      <main className="px-4 py-6 space-y-8 max-w-lg mx-auto">

        {/* ── Section 1: 抽選券 ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">抽選券</h2>

          {/* Ticket count card */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-white/10 to-white/5 border border-white/10 p-6 mb-4">
            {/* decorative background glow */}
            <div
              className="absolute inset-0 pointer-events-none lottery-bgbrth"
              style={{
                background: 'radial-gradient(ellipse at 20% 50%, #eab30818 0%, transparent 70%)',
                animation: 'lotteryBgBreath 3s ease-in-out infinite',
              }}
            />
            <div className="relative flex items-end gap-3">
              {/* Ticket icon */}
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 9a2 2 0 0 1 0-4h20a2 2 0 0 1 0 4v2a2 2 0 0 0 0 4v2a2 2 0 0 1 0 4H2a2 2 0 0 1 0-4v-2a2 2 0 0 0 0-4V9z" />
                  <line x1="9" y1="5" x2="9" y2="19" strokeDasharray="2 2" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-white/40 mb-0.5">保有枚数</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black tabular-nums leading-none" style={{ color: tickets > 0 ? '#eab308' : '#52525b' }}>
                    {tickets}
                  </span>
                  <span className="text-xl font-semibold text-white/60">枚</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ticket conditions */}
          <div className="space-y-3">
            <p className="text-xs text-white/40 font-medium">券の獲得条件</p>
            {MOCK_TICKET_CONDITIONS.map(cond => {
              const pct = Math.min(100, Math.round((cond.current / cond.target) * 100))
              return (
                <div key={cond.id} className="rounded-xl bg-white/5 border border-white/8 px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-white/90 leading-tight">{cond.title}</span>
                    {cond.completed ? (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        完了
                      </span>
                    ) : (
                      <span className="text-xs text-white/40 tabular-nums">
                        {cond.current}/{cond.target} {cond.unit}
                      </span>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${pct}%`,
                        background: cond.completed
                          ? 'linear-gradient(90deg, #10b981, #34d399)'
                          : 'linear-gradient(90deg, #eab308, #fbbf24)',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Section 2: 抽選ボタン ── */}
        <section>
          <div className="flex flex-col items-center gap-3">
            <button
              onClick={handleDraw}
              disabled={tickets <= 0}
              className="relative w-full max-w-xs h-16 rounded-2xl font-black text-lg tracking-widest overflow-hidden transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
              style={{
                background: tickets > 0
                  ? 'linear-gradient(135deg, #78350f 0%, #eab308 50%, #ca8a04 100%)'
                  : '#27272a',
                boxShadow: tickets > 0 ? '0 0 30px #eab30866, 0 4px 24px #00000088' : 'none',
              }}
            >
              {tickets > 0 && (
                <span
                  className="absolute inset-0 rounded-2xl lottery-pulse"
                  style={{
                    background: 'linear-gradient(135deg, transparent 40%, #fef08a44 60%, transparent 70%)',
                    animation: 'lotteryPulse 2s ease-in-out infinite',
                  }}
                />
              )}
              <span className="relative flex items-center justify-center gap-2">
                {/* Sparkle SVG */}
                {tickets > 0 && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
                    <path d="M19 14l.75 2.25L22 17l-2.25.75L19 20l-.75-2.25L16 17l2.25-.75z" opacity="0.7" />
                    <path d="M5 15l.5 1.5L7 17l-1.5.5L5 19l-.5-1.5L3 17l1.5-.5z" opacity="0.5" />
                  </svg>
                )}
                くじを引く
              </span>
            </button>
            {tickets <= 0 && (
              <p className="text-xs text-white/30 text-center">抽選券がありません。条件を達成して券を獲得しましょう。</p>
            )}
          </div>
        </section>

        {/* ── Section 3: 過去の当選履歴 ── */}
        <section>
          <h2 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">過去の当選履歴</h2>
          {MOCK_DRAW_HISTORY.length === 0 ? (
            <p className="text-sm text-white/30 text-center py-6">まだ履歴がありません</p>
          ) : (
            <div className="space-y-2">
              {MOCK_DRAW_HISTORY.map(entry => {
                const color = RARITY_COLOR[entry.reward.rarity]
                return (
                  <div
                    key={entry.id}
                    className="flex items-center gap-3 rounded-xl bg-white/5 border border-white/8 px-4 py-3"
                  >
                    {/* Rarity dot */}
                    <div
                      className="flex-shrink-0 w-2.5 h-2.5 rounded-full"
                      style={{ background: color, boxShadow: `0 0 6px ${color}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{entry.reward.title}</p>
                      <p className="text-xs text-white/40">{entry.drawnAt}</p>
                    </div>
                    {/* Rarity badge */}
                    <span
                      className="flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        color,
                        borderColor: `${color}55`,
                        background: `${color}18`,
                      }}
                    >
                      {RARITY_LABEL[entry.reward.rarity]}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </main>

      {/* ── Draw Overlay ── */}
      {stage !== 'idle' && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.96)' }}
        >
          {/* Background radial ambient */}
          {result && (stage === 'reveal' || stage === 'done') && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at center, ${RARITY_COLOR[result.rarity]}22 0%, transparent 65%)`,
              }}
            />
          )}

          {/* SPINNING stage */}
          {stage === 'spinning' && (
            <div className="flex flex-col items-center gap-10">
              {/* Orb container */}
              <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
                {/* Outer orbit ring */}
                <div
                  className="absolute inset-0 rounded-full border border-yellow-400/20 lottery-orbit"
                  style={{ animation: 'lotteryOrbitRing 3s linear infinite' }}
                />
                <div
                  className="absolute rounded-full border border-yellow-400/10 lottery-orbit"
                  style={{
                    inset: 12,
                    animation: 'lotteryOrbitRing 2s linear infinite reverse',
                  }}
                />
                {/* Main spinning orb */}
                <div
                  className="lottery-spin"
                  style={{
                    width: 140,
                    height: 140,
                    borderRadius: '50%',
                    background: 'conic-gradient(from 0deg, #78350f, #eab308, #fef08a, #eab308, #78350f)',
                    animation: 'lotterySpinOrb 1s linear infinite',
                    boxShadow: '0 0 60px #eab30888, 0 0 120px #eab30844',
                  }}
                />
                {/* Inner dark core */}
                <div
                  className="absolute rounded-full bg-black/70"
                  style={{ width: 80, height: 80 }}
                />
                {/* Center star */}
                <div className="absolute">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="#eab308" style={{ filter: 'drop-shadow(0 0 8px #eab308)' }}>
                    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
                  </svg>
                </div>
              </div>

              <div
                className="text-center lottery-pulse"
                style={{ animation: 'lotteryTextPulse 1s ease-in-out infinite' }}
              >
                <p className="text-white/70 text-base font-medium tracking-widest">運命を引いています...</p>
              </div>
            </div>
          )}

          {/* REVEAL / DONE stage */}
          {(stage === 'reveal' || stage === 'done') && result && (
            <div className="relative flex flex-col items-center px-6 w-full max-w-sm">

              {/* Spark particles for GOLD / SPECIAL */}
              {(result.rarity === 'GOLD' || result.rarity === 'SPECIAL') &&
                [0, 1, 2, 3, 4, 5].map(i => {
                  const angle = (i / 6) * 360
                  const dist = 130 + (i % 2) * 30
                  const rad = (angle * Math.PI) / 180
                  const x = Math.round(Math.cos(rad) * dist)
                  const y = Math.round(Math.sin(rad) * dist)
                  return (
                    <div
                      key={i}
                      className="absolute lottery-spark pointer-events-none"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        width: 12 + (i % 3) * 4,
                        height: 12 + (i % 3) * 4,
                        marginLeft: -(6 + (i % 3) * 2),
                        marginTop: -(6 + (i % 3) * 2),
                        animation: `lotterySpark 1.2s ease-out ${i * 100}ms both`,
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill={RARITY_COLOR[result.rarity]} style={{ filter: `drop-shadow(0 0 4px ${RARITY_COLOR[result.rarity]})` }}>
                        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
                      </svg>
                    </div>
                  )
                })
              }

              {/* Result card */}
              <div
                className="lottery-reveal w-full rounded-3xl border overflow-hidden"
                style={{
                  animation: 'lotteryReveal 0.4s ease-out both',
                  borderColor: `${RARITY_COLOR[result.rarity]}44`,
                  background: `linear-gradient(145deg, #18181b, #09090b)`,
                  boxShadow: RARITY_GLOW_CSS[result.rarity],
                }}
              >
                {/* Top accent bar */}
                <div
                  style={{
                    height: 4,
                    background: result.rarity === 'SPECIAL'
                      ? 'linear-gradient(90deg, #7c3aed, #a855f7, #e879f9, #a855f7, #7c3aed)'
                      : result.rarity === 'GOLD'
                      ? 'linear-gradient(90deg, #78350f, #eab308, #fef08a, #eab308, #78350f)'
                      : 'linear-gradient(90deg, #52525b, #a1a1aa, #d4d4d8, #a1a1aa, #52525b)',
                  }}
                />

                <div className="px-6 py-8 flex flex-col items-center gap-4 text-center">
                  {/* Rarity emblem */}
                  <div
                    className="flex items-center justify-center rounded-full border"
                    style={{
                      width: 72,
                      height: 72,
                      borderColor: `${RARITY_COLOR[result.rarity]}66`,
                      background: `${RARITY_COLOR[result.rarity]}18`,
                      boxShadow: RARITY_GLOW_CSS[result.rarity],
                    }}
                  >
                    {result.rarity === 'SPECIAL' ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill={RARITY_COLOR[result.rarity]}>
                        <path d="M12 2l2 5.5L19.5 9l-5.5 2L12 17l-2-5.5L4.5 9l5.5-2zM19 14l1 3 3 1-3 1-1 3-1-3-3-1 3-1z" />
                      </svg>
                    ) : result.rarity === 'GOLD' ? (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill={RARITY_COLOR[result.rarity]}>
                        <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z" />
                        <path d="M19 15l.75 2.25L22 18l-2.25.75L19 21l-.75-2.25L16 18l2.25-.75z" opacity="0.8" />
                      </svg>
                    ) : (
                      <svg width="28" height="28" viewBox="0 0 24 24" fill={RARITY_COLOR[result.rarity]}>
                        <circle cx="12" cy="12" r="5" />
                        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.93 4.93l2.12 2.12M16.95 16.95l2.12 2.12M4.93 19.07l2.12-2.12M16.95 7.05l2.12-2.12" stroke={RARITY_COLOR[result.rarity]} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>

                  {/* Rarity label */}
                  <span
                    className="text-xs font-black tracking-[0.3em] px-4 py-1 rounded-full border"
                    style={{
                      color: RARITY_COLOR[result.rarity],
                      borderColor: `${RARITY_COLOR[result.rarity]}55`,
                      background: `${RARITY_COLOR[result.rarity]}18`,
                      letterSpacing: '0.25em',
                    }}
                  >
                    {RARITY_LABEL[result.rarity]}
                  </span>

                  {/* Reward title */}
                  <h2 className="text-2xl font-black text-white leading-tight">{result.title}</h2>

                  {/* Reward description */}
                  <p className="text-sm text-white/50 leading-relaxed">{result.description}</p>
                </div>
              </div>

              {/* Close button — shown when done */}
              {stage === 'done' && (
                <button
                  onClick={handleClose}
                  className="mt-6 px-10 py-3.5 rounded-2xl font-bold text-sm tracking-wider bg-white/10 border border-white/15 text-white/80 active:bg-white/20 transition-all"
                >
                  閉じる
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
