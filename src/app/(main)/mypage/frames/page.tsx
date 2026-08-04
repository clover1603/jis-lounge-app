'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  loadState,
  saveState,
  equipFrame,
  type EngagementState,
} from '@/lib/engagement-storage'
import {
  PROFILE_FRAMES,
  FRAME_RARITY_LABEL,
  type FrameRarity,
} from '@/lib/mock-lucky-draw'

// ─── helpers ────────────────────────────────────────────────────────────────

const RARITY_TEXT: Record<FrameRarity, string> = {
  standard: 'スタンダード',
  rare: 'レア',
  legend: 'レジェンド',
}

const RARITY_CHIP: Record<FrameRarity, string> = {
  standard: 'bg-zinc-700 text-zinc-300',
  rare:     'bg-blue-900/70 text-blue-300',
  legend:   'bg-amber-900/70 text-amber-300',
}

// ─── component ──────────────────────────────────────────────────────────────

export default function FrameCollectionPage() {
  const [state, setState] = useState<EngagementState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setState(loadState())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setToastVisible(true)
    const t = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 300)
    }, 2000)
    return () => clearTimeout(t)
  }, [])

  const handleEquip = useCallback(
    (frameId: string) => {
      if (!state) return
      const next = equipFrame(state, frameId)
      saveState(next)
      setState(next)
      showToast('フレームを装備しました')
    },
    [state, showToast],
  )

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-700 border-t-amber-400 animate-spin" />
      </div>
    )
  }

  const ownedSet = new Set(state.ownedFrameIds)
  const equippedId = state.equippedFrameId
  const ownedCount = PROFILE_FRAMES.filter(f => ownedSet.has(f.id)).length
  const totalCount = PROFILE_FRAMES.length

  return (
    <>
      <style>{`
        @keyframes goldPulse {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(251,191,36,0.55), 0 0 20px 4px rgba(251,191,36,0.2); }
          50%       { box-shadow: 0 0 16px 6px rgba(251,191,36,0.85), 0 0 36px 8px rgba(251,191,36,0.35); }
        }
        @keyframes toastSlide {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .legend-glow {
          animation: goldPulse 2.2s ease-in-out infinite;
        }
        .toast-enter {
          animation: toastSlide 0.22s ease-out forwards;
        }
        .toast-exit {
          opacity: 0;
          transition: opacity 0.28s ease;
        }
        @media (prefers-reduced-motion: reduce) {
          .legend-glow { animation: none; box-shadow: 0 0 12px 4px rgba(251,191,36,0.55); }
          .toast-enter { animation: none; opacity: 1; }
        }
      `}</style>

      <div className="min-h-screen bg-zinc-950 text-zinc-100 pb-28">

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-800/60">
          <div className="mx-auto max-w-[430px] px-4 h-14 flex items-center gap-3">
            <Link
              href="/mypage/customize"
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              aria-label="戻る"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M12.5 5L7.5 10L12.5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            <h1 className="flex-1 text-base font-semibold tracking-wide truncate">
              フレームコレクション
            </h1>
            {/* Equipped indicator */}
            {equippedId && equippedId !== 'frame_none' && (() => {
              const ef = PROFILE_FRAMES.find(f => f.id === equippedId)
              return ef ? (
                <span className="flex items-center gap-1.5 text-xs text-amber-400 font-medium bg-amber-950/50 border border-amber-800/50 rounded-full px-2.5 py-1 whitespace-nowrap">
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor" aria-hidden="true">
                    <circle cx="5" cy="5" r="5"/>
                  </svg>
                  装備中: {ef.label}
                </span>
              ) : null
            })()}
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="mx-auto max-w-[430px] px-4 pt-5">

          {/* collection count bar */}
          <div className="mb-5 flex items-center justify-between">
            <p className="text-sm text-zinc-400">
              <span className="text-zinc-100 font-semibold tabular-nums">{ownedCount}</span>
              <span className="text-zinc-500 mx-1">/</span>
              <span className="tabular-nums">{totalCount}</span>
              <span className="ml-1">種類コレクション済み</span>
            </p>
            <Link
              href="/mypage/lucky-draw"
              className="text-xs text-amber-400 hover:text-amber-300 font-medium flex items-center gap-1 transition-colors"
            >
              くじを引く
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                <path d="M4.5 2.5L8 6L4.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          {/* progress bar */}
          <div className="mb-6 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(ownedCount / totalCount) * 100}%` }}
            />
          </div>

          {/* frame grid */}
          <div className="grid grid-cols-2 gap-3">
            {PROFILE_FRAMES.map(frame => {
              const owned   = ownedSet.has(frame.id)
              const active  = equippedId === frame.id
              const isLegend = frame.rarity === 'legend'

              return (
                <div
                  key={frame.id}
                  className={[
                    'relative rounded-2xl bg-zinc-900 border p-4 flex flex-col items-center gap-3 transition-opacity',
                    owned ? 'border-zinc-700/60' : 'border-zinc-800/40 opacity-50',
                    active ? 'border-amber-600/70 bg-zinc-800/80' : '',
                  ].join(' ')}
                >
                  {/* rarity chip */}
                  <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full ${RARITY_CHIP[frame.rarity]}`}>
                    {RARITY_TEXT[frame.rarity]}
                  </span>

                  {/* active badge */}
                  {active && (
                    <span className="absolute top-2.5 right-2.5 text-[10px] font-bold text-amber-300 bg-amber-900/50 border border-amber-700/50 rounded-full px-1.5 py-0.5">
                      装備中
                    </span>
                  )}

                  {/* avatar with gradient frame border */}
                  <div className="relative mt-5">
                    <div
                      className={[
                        'w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold text-zinc-300 select-none',
                        isLegend && owned && !reducedMotion ? 'legend-glow' : '',
                        isLegend && owned && reducedMotion ? 'legend-glow' : '',
                      ].join(' ')}
                      style={{
                        background: `linear-gradient(#18181b, #18181b) padding-box, ${frame.cssGradient} border-box`,
                        border: '3px solid transparent',
                        ...(isLegend && owned
                          ? { boxShadow: `0 0 12px 3px ${frame.glowColor}` }
                          : {}),
                      }}
                      aria-hidden="true"
                    >
                      {owned ? 'あ' : (
                        /* lock icon */
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" className="text-zinc-600" aria-hidden="true">
                          <rect x="4" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6"/>
                          <path d="M7 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                  </div>

                  {/* label */}
                  <p className="text-xs font-medium text-center text-zinc-200 leading-tight">
                    {frame.label}
                  </p>

                  {/* action button */}
                  {owned ? (
                    active ? (
                      <div className="w-full flex items-center justify-center gap-1 rounded-lg bg-amber-900/30 border border-amber-700/40 py-1.5 text-xs font-semibold text-amber-400">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                          <path d="M2 6.5L4.8 9L10 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                        </svg>
                        装備中
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEquip(frame.id)}
                        className="w-full rounded-lg bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700/60 py-1.5 text-xs font-semibold text-zinc-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                      >
                        装備する
                      </button>
                    )
                  ) : (
                    <Link
                      href="/mypage/lucky-draw"
                      className="w-full text-center rounded-lg bg-zinc-800/60 border border-zinc-700/40 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-400 transition-colors"
                    >
                      {frame.rarity === 'legend' ? '✦ くじで入手' : 'くじで入手'}
                    </Link>
                  )}
                </div>
              )
            })}
          </div>

          {/* bottom CTA */}
          <div className="mt-8 rounded-2xl bg-zinc-900 border border-zinc-800/60 p-5 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-zinc-100">
                フレームを増やそう
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                チケットを使ってくじを引くと<br/>
                新しいフレームが手に入ります
              </p>
            </div>
            <Link
              href="/mypage/lucky-draw"
              className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black text-xs font-bold rounded-xl px-4 py-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-300"
            >
              くじを引く
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none" aria-hidden="true">
                <path d="M5 3L9 6.5L5 10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

        </main>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={[
            'fixed bottom-24 left-1/2 -translate-x-1/2 z-50',
            'bg-zinc-800 border border-zinc-700/60 text-zinc-100',
            'text-sm font-medium rounded-2xl px-5 py-3 shadow-xl',
            'flex items-center gap-2 whitespace-nowrap',
            toastVisible ? 'toast-enter' : 'toast-exit',
          ].join(' ')}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="text-amber-400" aria-hidden="true">
            <path d="M2.5 7.5L6 11L12.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {toast}
        </div>
      )}
    </>
  )
}
