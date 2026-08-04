'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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
} from '@/lib/mock-lucky-draw'

// ─── Constants ────────────────────────────────────────────────────────────────

const ANIM_DURATION_STANDARD = 10000
const ANIM_DURATION_SHORT = 3000
const SKIP_APPEAR_DELAY = 1000

// ─── Types ────────────────────────────────────────────────────────────────────

type DrawPhase = 'idle' | 'animating' | 'result'
type ForcedRarity = 'none' | 'miss' | 'normal' | 'rare' | 'legend'

// ─── Rarity helpers ──────────────────────────────────────────────────────────

const RARITY_BORDER: Record<string, string> = {
  miss:   'border-zinc-700',
  normal: 'border-zinc-500',
  rare:   'border-purple-500',
  legend: 'border-amber-400',
}

const RARITY_BG: Record<string, string> = {
  miss:   'bg-zinc-900',
  normal: 'bg-zinc-900',
  rare:   'bg-purple-950/60',
  legend: 'bg-amber-950/40',
}

const RARITY_LABEL: Record<string, string> = {
  miss:   'はずれ',
  normal: 'ノーマル',
  rare:   'レア',
  legend: 'レジェンド',
}

const RARITY_BADGE_CLASS: Record<string, string> = {
  miss:   'bg-zinc-800 text-zinc-500',
  normal: 'bg-zinc-700 text-zinc-300',
  rare:   'bg-purple-900 text-purple-300',
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
    case 'ticket_ten':     return 'チケット 10連'
    case 'jileage_single': return 'Jレージ 1回'
    case 'jileage_ten':    return 'Jレージ 10連'
  }
}

// ─── RewardCard ──────────────────────────────────────────────────────────────

function RewardCard({
  result,
  index,
  reduced,
  isNew,
}: {
  result: SingleDrawResult
  index: number
  reduced: boolean
  isNew: boolean
}) {
  const { reward, isDuplicate, duplicateJileage } = result
  const isLegend = reward.rarity === 'legend'
  const isRare   = reward.rarity === 'rare'
  const delay    = reduced ? 0 : index * 100

  return (
    <div
      className={`relative rounded-xl border-2 ${RARITY_BORDER[reward.rarity]} ${RARITY_BG[reward.rarity]}
        flex flex-col items-center justify-center p-3 gap-1 overflow-hidden min-h-[90px]`}
      style={{
        animation: reduced ? 'none' : `prizeReveal 0.45s ease-out ${delay}ms both`,
        boxShadow:
          isLegend ? '0 0 24px rgba(251,191,36,0.45)'
          : isRare  ? '0 0 16px rgba(168,85,247,0.4)'
          : 'none',
      }}
    >
      {/* legend pulse ring */}
      {isLegend && !reduced && (
        <div className="absolute inset-0 rounded-xl" style={{ animation: 'goldPulse 2s ease-in-out infinite' }} />
      )}

      {/* NEW badge */}
      {isNew && !isDuplicate && reward.rarity !== 'miss' && (
        <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full tracking-wide z-10">
          NEW
        </span>
      )}

      <span className="text-3xl leading-none select-none relative z-10">{reward.emoji}</span>
      <span className="text-xs text-zinc-200 font-medium text-center leading-tight relative z-10">
        {reward.rarity === 'miss' ? 'はずれ +1J' : reward.label}
      </span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full relative z-10 ${RARITY_BADGE_CLASS[reward.rarity]}`}>
        {RARITY_LABEL[reward.rarity]}
      </span>

      {/* duplicate overlay */}
      {isDuplicate && reward.rarity !== 'miss' && (
        <div className="absolute inset-0 rounded-xl bg-black/75 flex flex-col items-center justify-center gap-0.5 z-20">
          <span className="text-[10px] text-zinc-400">すでに所持</span>
          <span className="text-xs text-amber-400 font-bold">+{duplicateJileage}J</span>
        </div>
      )}
    </div>
  )
}

// ─── CTASection ──────────────────────────────────────────────────────────────

function CTASection({ results }: { results: SingleDrawResult[] }) {
  const hasFrame  = results.some(r => !r.isDuplicate && r.reward.category === 'frame' && r.reward.rarity !== 'miss')
  const hasBadge  = results.some(r => !r.isDuplicate && r.reward.category === 'badge' && r.reward.rarity !== 'miss')
  const hasTitle  = results.some(r => !r.isDuplicate && r.reward.category === 'title_word' && r.reward.rarity !== 'miss')
  const jileageGained = results.reduce((sum, r) => {
    if (r.reward.rarity === 'miss') return sum + 1
    if (r.isDuplicate) return sum + r.duplicateJileage
    return sum
  }, 0)

  if (!hasFrame && !hasBadge && !hasTitle) return null

  return (
    <div className="mt-5 flex flex-col gap-2 w-full">
      <p className="text-xs text-zinc-500 text-center">獲得したアイテムを設定する</p>
      {hasFrame && (
        <Link
          href="/mypage/frames"
          className="w-full py-3 rounded-xl bg-zinc-800 text-sm font-semibold text-white text-center
            active:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>🖼</span> フレームを設定する
        </Link>
      )}
      {hasBadge && (
        <Link
          href="/mypage/badges"
          className="w-full py-3 rounded-xl bg-zinc-800 text-sm font-semibold text-white text-center
            active:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>🏅</span> バッジを設定する
        </Link>
      )}
      {hasTitle && (
        <Link
          href="/mypage/titles/edit"
          className="w-full py-3 rounded-xl bg-zinc-800 text-sm font-semibold text-white text-center
            active:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>✨</span> 称号を設定する
        </Link>
      )}
      {jileageGained > 0 && (
        <p className="text-xs text-amber-400 text-center">Jレージ +{jileageGained}J を獲得しました</p>
      )}
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LuckyDrawPage() {
  const router = useRouter()
  const [state, setState]         = useState<EngagementState | null>(null)
  const [phase, setPhase]         = useState<DrawPhase>('idle')
  const [results, setResults]     = useState<SingleDrawResult[]>([])
  const [showSkip, setShowSkip]   = useState(false)
  const [reduced, setReduced]     = useState(false)

  // dev panel
  const [devMode, setDevMode]     = useState(false)
  const [shortAnim, setShortAnim] = useState(false) // false = 10s standard
  const [forcedRarity, setForcedRarity] = useState<ForcedRarity>('none')
  const tapCountRef = useRef(0)
  const tapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const timerRef     = useRef<ReturnType<typeof setTimeout> | null>(null)
  const skipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setState(loadState())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    // ?dev=1 でも開発パネルを有効化
    if (typeof window !== 'undefined' && window.location.search.includes('dev=1')) {
      setDevMode(true)
    }
  }, [])

  function handleTitleTap() {
    tapCountRef.current += 1
    if (tapTimerRef.current) clearTimeout(tapTimerRef.current)
    tapTimerRef.current = setTimeout(() => { tapCountRef.current = 0 }, 1500)
    if (tapCountRef.current >= 7) {
      tapCountRef.current = 0
      setDevMode(v => !v)
    }
  }

  const clearTimers = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    if (skipTimerRef.current) clearTimeout(skipTimerRef.current)
  }, [])

  const advanceToResult = useCallback(() => {
    clearTimers()
    setShowSkip(false)
    setPhase('result')
  }, [clearTimers])

  const animDuration = (reduced || shortAnim) ? ANIM_DURATION_SHORT : ANIM_DURATION_STANDARD

  const startDraw = useCallback(
    (
      drawFn: (owned: string[]) => SingleDrawResult[],
      costType: 'ticket1' | 'ticket10' | 'jileage500' | 'jileage5000',
      drawType: StoredDraw['drawType'],
    ) => {
      if (!state || phase === 'animating') return

      let next = { ...state }
      if (costType === 'ticket1')     next = { ...next, tickets: next.tickets - 1 }
      else if (costType === 'ticket10')    next = { ...next, tickets: next.tickets - 10 }
      else if (costType === 'jileage500')  next = { ...next, jileage: next.jileage - 500 }
      else if (costType === 'jileage5000') next = { ...next, jileage: next.jileage - 5000 }

      const owned = [...next.ownedFrameIds, ...next.ownedBadgeIds]
      let drawResults: SingleDrawResult[]

      if (forcedRarity !== 'none') {
        // dev: force rarity
        const { executeSingleDraw: _sd } = require('@/lib/mock-lucky-draw')
        // Fake a result with forced rarity by overriding pickRarity inline
        const forcedMap: Record<ForcedRarity, () => SingleDrawResult[]> = {
          none: () => drawFn(owned),
          miss:   () => [{ reward: { id: 'miss', category: 'miss', label: 'はずれ', rarity: 'miss', emoji: '💨' }, isDuplicate: false, duplicateJileage: 0 }],
          normal: () => [executeSingleDraw(owned)].map(r => r.reward.rarity === 'normal' ? r : { reward: { id: 'frame_silver', category: 'frame', label: 'シルバーフレーム', rarity: 'normal', emoji: '🪞', refId: 'frame_silver' }, isDuplicate: owned.includes('frame_silver'), duplicateJileage: owned.includes('frame_silver') ? 10 : 0 }),
          rare:   () => [{ reward: { id: 'frame_aurora', category: 'frame', label: 'オーロラフレーム', rarity: 'rare', emoji: '🌌', refId: 'frame_aurora' }, isDuplicate: owned.includes('frame_aurora'), duplicateJileage: owned.includes('frame_aurora') ? 100 : 0 }],
          legend: () => [{ reward: { id: 'frame_legend_gold', category: 'frame', label: 'レジェンドゴールドフレーム', rarity: 'legend', emoji: '👑', refId: 'frame_legend_gold' }, isDuplicate: owned.includes('frame_legend_gold'), duplicateJileage: owned.includes('frame_legend_gold') ? 500 : 0 }],
        }
        drawResults = forcedMap[forcedRarity]()
      } else {
        drawResults = drawFn(owned)
      }

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

      skipTimerRef.current = setTimeout(() => setShowSkip(true), SKIP_APPEAR_DELAY)
      timerRef.current     = setTimeout(() => advanceToResult(), animDuration)
    },
    [state, phase, reduced, forcedRarity, advanceToResult, animDuration],
  )

  const closeResult = useCallback(() => {
    setPhase('idle')
    setResults([])
    setShowSkip(false)
  }, [])

  function devAddTickets() {
    if (!state) return
    const next = { ...state, tickets: state.tickets + 5 }
    saveState(next); setState(next)
  }
  function devAddJileage() {
    if (!state) return
    const next = { ...state, jileage: state.jileage + 5000 }
    saveState(next); setState(next)
  }
  function devReset() {
    if (!state) return
    const { getDefaultState } = require('@/lib/engagement-storage')
    const def = getDefaultState()
    saveState(def); setState(def)
  }

  if (!state) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const canTicket1  = state.tickets >= 1  && phase !== 'animating'
  const canTicket10 = state.tickets >= 10 && phase !== 'animating'
  const canJileage1 = state.jileage >= 500  && phase !== 'animating'
  const canJileage10= state.jileage >= 5000 && phase !== 'animating'
  const recentHistory = state.drawHistory.slice(0, 3)

  // newItemIds で NEW 判定
  const newIds = new Set(state.newItemIds)

  return (
    <>
      <style>{`
        @keyframes orbFloat {
          0%,100%{transform:translateY(0) scale(1)}
          50%{transform:translateY(-14px) scale(1.06)}
        }
        @keyframes goldPulse {
          0%,100%{opacity:0.65;box-shadow:0 0 20px rgba(251,191,36,0.35)}
          50%{opacity:1;box-shadow:0 0 70px rgba(251,191,36,1)}
        }
        @keyframes rarePulse {
          0%,100%{box-shadow:0 0 16px rgba(168,85,247,0.3)}
          50%{box-shadow:0 0 48px rgba(168,85,247,0.8)}
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
        @keyframes legendBurst {
          0%{transform:scale(0.8);opacity:0}
          40%{transform:scale(1.15);opacity:1}
          70%{transform:scale(0.97)}
          100%{transform:scale(1)}
        }
        .shimmer-text {
          background: linear-gradient(90deg, #fbbf24 0%, #fef3c7 40%, #fbbf24 60%, #d97706 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2.5s linear infinite;
        }
        .rare-shimmer-text {
          background: linear-gradient(90deg, #a855f7 0%, #e9d5ff 40%, #a855f7 60%, #7c3aed 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 2s linear infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .shimmer-text, .rare-shimmer-text { animation: none; }
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
          {/* 7回タップで開発パネル解放 */}
          <h1
            className="text-lg font-bold tracking-wide select-none cursor-default"
            onClick={handleTitleTap}
          >
            ラッキーくじ
          </h1>
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
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">チケットで引く</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={!canTicket1}
              onClick={() => startDraw(o => [executeSingleDraw(o)], 'ticket1', 'ticket_single')}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed enabled:active:scale-95
                bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg enabled:shadow-amber-900/50"
            >
              <span className="text-xl">🎫</span>
              <span>1回引く</span>
              <span className="text-xs text-amber-200 font-normal">チケット 1枚</span>
            </button>
            <button
              disabled={!canTicket10}
              onClick={() => startDraw(executeTenDraws, 'ticket10', 'ticket_ten')}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed enabled:active:scale-95
                bg-gradient-to-br from-yellow-500 to-amber-700 text-white shadow-lg enabled:shadow-yellow-900/50"
            >
              <span className="text-xl">🎫🎫</span>
              <span>10連引く</span>
              <span className="text-xs text-yellow-100 font-normal">チケット 10枚</span>
            </button>
          </div>

          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-2">Jレージで引く</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              disabled={!canJileage1}
              onClick={() => startDraw(o => [executeSingleDraw(o)], 'jileage500', 'jileage_single')}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed enabled:active:scale-95
                bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-lg enabled:shadow-blue-950/60"
            >
              <span className="text-xl">💎</span>
              <span>1回引く</span>
              <span className="text-xs text-blue-200 font-normal">500J</span>
            </button>
            <button
              disabled={!canJileage10}
              onClick={() => startDraw(executeTenDraws, 'jileage5000', 'jileage_ten')}
              className="relative rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all
                disabled:opacity-40 disabled:cursor-not-allowed enabled:active:scale-95
                bg-gradient-to-br from-indigo-600 to-violet-900 text-white shadow-lg enabled:shadow-violet-950/60"
            >
              <span className="text-xl">💎💎</span>
              <span>10連引く</span>
              <span className="text-xs text-indigo-200 font-normal">5,000J</span>
            </button>
          </div>
        </div>

        {/* Rates info */}
        <div className="mx-4 mt-5 rounded-xl bg-zinc-900/60 border border-zinc-800 px-4 py-3">
          <p className="text-xs text-zinc-500 mb-2 font-semibold">排出率</p>
          <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-600">はずれ</span>
              <span className="text-zinc-400 font-bold">50%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-zinc-400">ノーマル</span>
              <span className="text-zinc-200 font-bold">35%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-purple-400">レア</span>
              <span className="text-purple-300 font-bold">10%</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-amber-400">レジェンド</span>
              <span className="text-amber-300 font-bold">5%</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-700 mt-2">※ はずれの場合も1Jレージを付与</p>
        </div>

        {/* Recent history */}
        {recentHistory.length > 0 && (
          <div className="mx-4 mt-5">
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-2">最近の履歴</p>
            <div className="flex flex-col gap-2">
              {recentHistory.map((draw) => {
                const legendCount = draw.rarities.filter(r => r === 'legend').length
                const rareCount   = draw.rarities.filter(r => r === 'rare').length
                const normalCount = draw.rarities.filter(r => r === 'normal').length
                const missCount   = draw.rarities.filter(r => r === 'miss').length
                return (
                  <div key={draw.id} className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-zinc-300 font-medium">{drawTypeLabel(draw.drawType)}</span>
                      <span className="text-[10px] text-zinc-600">{formatDate(draw.drawnAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap justify-end">
                      {legendCount > 0 && <span className="bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded-full">L×{legendCount}</span>}
                      {rareCount   > 0 && <span className="bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded-full">R×{rareCount}</span>}
                      {normalCount > 0 && <span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full">N×{normalCount}</span>}
                      {missCount   > 0 && <span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">×{missCount}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            <Link href="/mypage/rewards" className="block text-xs text-zinc-500 text-right mt-2 underline underline-offset-2">
              全履歴を見る
            </Link>
          </div>
        )}

        {/* Dev panel — 社内レビュー専用 */}
        {devMode && (
          <div className="mx-4 mt-6 rounded-xl border-2 border-dashed border-amber-700/60 bg-amber-950/20 p-4">
            <p className="text-xs font-bold text-amber-500 mb-3">🛠 社内レビュー専用パネル（本番ユーザー非表示）</p>
            <div className="flex flex-wrap gap-2 mb-3">
              <label className="flex items-center gap-1.5 text-xs text-zinc-300">
                <input
                  type="checkbox"
                  checked={shortAnim}
                  onChange={e => setShortAnim(e.target.checked)}
                  className="rounded"
                />
                短縮演出 3秒（通常10秒）
              </label>
            </div>
            <div className="mb-3">
              <p className="text-xs text-zinc-400 mb-1.5">強制排出レア度</p>
              <div className="flex flex-wrap gap-1.5">
                {(['none', 'miss', 'normal', 'rare', 'legend'] as ForcedRarity[]).map(r => (
                  <button
                    key={r}
                    onClick={() => setForcedRarity(r)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                      forcedRarity === r
                        ? 'bg-amber-600 text-white'
                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                    }`}
                  >
                    {r === 'none' ? 'ランダム' : RARITY_LABEL[r]}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={devAddTickets} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">
                チケット +5
              </button>
              <button onClick={devAddJileage} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">
                Jレージ +5000
              </button>
              <button onClick={devReset} className="text-xs bg-red-950 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900">
                localStorage初期化
              </button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">
              タイトルを7回タップでパネル非表示 / URL ?dev=1 で再表示
            </p>
          </div>
        )}
      </div>

      {/* ── Animation overlay ─────────────────────────────────────── */}
      {phase === 'animating' && (
        <div
          className="fixed inset-0 z-50 bg-black/97 flex flex-col items-center justify-center"
          style={{ animation: 'fadeInUp 0.3s ease-out both' }}
        >
          {showSkip && (
            <button
              onClick={advanceToResult}
              className="absolute top-12 right-5 px-4 py-1.5 rounded-full bg-zinc-800/90 text-zinc-300 text-sm font-medium
                active:bg-zinc-700 transition-colors border border-zinc-700"
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
              animation: 'orbFloat 2.5s ease-in-out infinite, goldPulse 2.5s ease-in-out infinite',
            }}
          />

          <p className="mt-8 text-base font-bold shimmer-text" aria-live="polite">
            くじを引いています…
          </p>
          <p className="text-xs text-zinc-600 mt-2">
            {shortAnim ? '約3秒後に結果表示' : '約10秒後に結果表示'}
          </p>
        </div>
      )}

      {/* ── Result overlay ────────────────────────────────────────── */}
      {phase === 'result' && results.length > 0 && (() => {
        const hasLegend = results.some(r => r.reward.rarity === 'legend')
        const hasRare   = results.some(r => r.reward.rarity === 'rare' && !r.isDuplicate)
        return (
          <div className="fixed inset-0 z-50 bg-black/97 flex flex-col overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-[430px] mx-auto px-4 pt-12 pb-8 min-h-full">
              <h2
                className={`text-xl font-bold mb-6 ${hasLegend ? 'shimmer-text' : hasRare ? 'rare-shimmer-text' : 'text-white'}`}
                style={{
                  animation: reduced ? 'none'
                    : hasLegend ? 'legendBurst 0.6s ease-out both'
                    : 'fadeInUp 0.3s ease-out both',
                }}
              >
                {results.length === 1 ? '結果' : '10連結果'}
              </h2>

              {/* Legend special banner */}
              {hasLegend && (
                <div
                  className="mb-4 w-full py-2 text-center text-sm font-bold text-amber-300 rounded-xl"
                  style={{
                    background: 'linear-gradient(90deg, #92400e, #d97706, #fbbf24, #d97706, #92400e)',
                    animation: reduced ? 'none' : 'shimmer 3s linear infinite',
                    backgroundSize: '200% auto',
                  }}
                >
                  🏆 LEGEND 獲得！ 🏆
                </div>
              )}

              {/* Single result */}
              {results.length === 1 && (
                <div className="w-44 aspect-square">
                  <RewardCard
                    result={results[0]}
                    index={0}
                    reduced={reduced}
                    isNew={results[0].reward.refId ? newIds.has(results[0].reward.refId) : false}
                  />
                </div>
              )}

              {/* 10-draw grid */}
              {results.length > 1 && (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {results.map((r, i) => (
                    <RewardCard
                      key={i}
                      result={r}
                      index={i}
                      reduced={reduced}
                      isNew={r.reward.refId ? newIds.has(r.reward.refId) : false}
                    />
                  ))}
                </div>
              )}

              <CTASection results={results} />

              <button
                onClick={closeResult}
                className="mt-6 w-full max-w-xs py-3.5 rounded-2xl bg-zinc-800 text-zinc-200 font-bold text-base
                  active:bg-zinc-700 transition-colors"
                style={{
                  animation: reduced ? 'none' : `fadeInUp 0.4s ease-out ${results.length * 100 + 300}ms both`,
                }}
              >
                閉じる
              </button>
            </div>
          </div>
        )
      })()}
    </>
  )
}
