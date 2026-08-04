'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { PROFILE_BADGES, BADGE_MAP } from '@/lib/mock-lucky-draw'
import { loadState, saveState, toggleBadge, EngagementState } from '@/lib/engagement-storage'

const RARITY_LABEL: Record<string, string> = {
  common: 'コモン',
  rare: 'レア',
  epic: 'エピック',
  legendary: 'レジェンド',
}

const RARITY_COLOR: Record<string, string> = {
  common: 'text-zinc-400 bg-zinc-800',
  rare: 'text-blue-400 bg-blue-950',
  epic: 'text-purple-400 bg-purple-950',
  legendary: 'text-amber-400 bg-amber-950',
}

export default function BadgesPage() {
  const [state, setState] = useState<EngagementState | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [toastVisible, setToastVisible] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    setState(loadState())
  }, [])

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setToastVisible(true)
    const timer = setTimeout(() => {
      setToastVisible(false)
      setTimeout(() => setToast(null), 300)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const handleToggle = useCallback((badgeId: string) => {
    if (!state) return
    const equipped = state.equippedBadgeIds ?? []
    const isEquipped = equipped.includes(badgeId)

    if (!isEquipped && equipped.length >= 3) {
      showToast('バッジは3つまでしか装備できません')
      return
    }

    const next = toggleBadge(state, badgeId)
    saveState(next)
    setState(next)

    const badge = BADGE_MAP[badgeId]
    if (isEquipped) {
      showToast(`${badge?.emoji ?? ''} ${badge?.label ?? badgeId} を外しました`)
    } else {
      showToast(`${badge?.emoji ?? ''} ${badge?.label ?? badgeId} を装備しました！`)
    }
  }, [state, showToast])

  if (!state) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-zinc-500 text-sm">読み込み中...</div>
      </div>
    )
  }

  const ownedIds = new Set(state.ownedBadgeIds ?? [])
  const equippedIds: string[] = state.equippedBadgeIds ?? []

  const equippedSlots: (typeof PROFILE_BADGES[0] | null)[] = [
    equippedIds[0] ? (BADGE_MAP[equippedIds[0]] ?? null) : null,
    equippedIds[1] ? (BADGE_MAP[equippedIds[1]] ?? null) : null,
    equippedIds[2] ? (BADGE_MAP[equippedIds[2]] ?? null) : null,
  ]

  return (
    <div className="min-h-screen bg-black text-white flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-black/90 backdrop-blur border-b border-zinc-800 flex items-center gap-3 px-4 py-3">
        <Link
          href="/mypage/customize"
          className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-zinc-800 transition-colors"
          aria-label="戻る"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h1 className="text-base font-bold tracking-wide">バッジコレクション</h1>
      </header>

      <main className="flex-1 px-4 pt-4 pb-24 space-y-6">
        {/* Equipped Badges Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">
              装備中のバッジ{' '}
              <span className="text-amber-400 font-bold">({equippedIds.length}/3)</span>
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {equippedSlots.map((badge, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                {badge ? (
                  <div className="relative w-full aspect-square rounded-xl border-2 border-amber-500 bg-zinc-900 flex flex-col items-center justify-center gap-1 p-2">
                    <span className="text-3xl leading-none">{badge.emoji}</span>
                    <span className="text-[10px] text-zinc-300 text-center leading-tight line-clamp-1">{badge.label}</span>
                    <button
                      onClick={() => handleToggle(badge.id)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-zinc-700 border border-zinc-600 flex items-center justify-center hover:bg-red-900 transition-colors"
                      aria-label={`${badge.label}を外す`}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full aspect-square rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex items-center justify-center text-zinc-600 text-xl">
                    +
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-zinc-800" />

        {/* Collection Grid */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">コレクション</h2>
          <div className="grid grid-cols-3 gap-3">
            {PROFILE_BADGES.map((badge) => {
              const owned = ownedIds.has(badge.id)
              const equipped = equippedIds.includes(badge.id)
              const canEquip = equippedIds.length < 3
              const rarityColor = RARITY_COLOR[badge.rarity] ?? RARITY_COLOR.common
              const rarityLabel = RARITY_LABEL[badge.rarity] ?? badge.rarity

              return (
                <div
                  key={badge.id}
                  className={[
                    'relative flex flex-col items-center gap-1.5 rounded-xl border p-3',
                    owned
                      ? equipped
                        ? 'border-amber-500 bg-amber-950/20'
                        : 'border-zinc-700 bg-zinc-900'
                      : 'border-zinc-800 bg-zinc-900/40 opacity-40',
                  ].join(' ')}
                >
                  {/* Emoji */}
                  <span className="text-3xl leading-none select-none">{badge.emoji}</span>

                  {/* Label */}
                  <span className="text-[10px] text-zinc-300 text-center leading-tight line-clamp-2 w-full">
                    {badge.label}
                  </span>

                  {/* Rarity */}
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${rarityColor}`}>
                    {rarityLabel}
                  </span>

                  {/* Owned state actions */}
                  {owned && (
                    <>
                      {equipped ? (
                        <button
                          onClick={() => handleToggle(badge.id)}
                          className={[
                            'w-full text-[10px] font-bold py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white',
                            reducedMotion ? '' : 'transition-colors',
                          ].join(' ')}
                        >
                          装備中
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggle(badge.id)}
                          disabled={!canEquip}
                          className={[
                            'w-full text-[10px] font-bold py-1 rounded-lg',
                            canEquip
                              ? 'bg-zinc-700 hover:bg-zinc-600 text-white'
                              : 'bg-zinc-800 text-zinc-600 cursor-not-allowed',
                            reducedMotion ? '' : 'transition-colors',
                          ].join(' ')}
                        >
                          装備
                        </button>
                      )}
                    </>
                  )}

                  {/* Not owned overlay */}
                  {!owned && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl">
                      <span className="text-[10px] text-zinc-500 font-bold">未解放</span>
                      {badge.acquisitionHint && (
                        <span className="text-[9px] text-zinc-600 text-center mt-0.5 px-1 leading-tight">
                          {badge.acquisitionHint}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        {/* CTA for unowned badges */}
        <div className="flex justify-center pt-2">
          <Link
            href="/mypage/lucky-draw"
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-600 to-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-900/30 hover:from-amber-500 hover:to-amber-400 transition-colors"
          >
            くじを引く
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </main>

      {/* Toast */}
      {toast && (
        <div
          className={[
            'fixed bottom-6 left-1/2 -translate-x-1/2 z-50',
            'bg-zinc-800 border border-zinc-700 text-white text-sm font-medium',
            'px-4 py-2.5 rounded-full shadow-xl whitespace-nowrap',
            reducedMotion
              ? toastVisible ? 'opacity-100' : 'opacity-0'
              : toastVisible
                ? 'opacity-100 translate-y-0 transition-all duration-200'
                : 'opacity-0 translate-y-2 transition-all duration-300',
          ].join(' ')}
          role="status"
          aria-live="polite"
        >
          {toast}
        </div>
      )}
    </div>
  )
}
