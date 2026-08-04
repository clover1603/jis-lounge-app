'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  loadState,
  type EngagementState,
  type DrawRarity,
  type DrawType,
  type StoredDraw,
} from '@/lib/engagement-storage'
import { BADGE_MAP, type DrawReward } from '@/lib/mock-lucky-draw'

// ─── Types ──────────────────────────────────────────────────────────

type Tab = 'draw' | 'jileage'

interface JileageEvent {
  date: string
  label: string
  amount: number
}

// ─── Static mock data ────────────────────────────────────────────────

const MOCK_JILEAGE_EVENTS: JileageEvent[] = [
  { date: '2026-08-04', label: 'ログインチェック', amount: 10 },
  { date: '2026-08-04', label: '掲示板チェック', amount: 10 },
  { date: '2026-08-03', label: 'チャレンジ完了「初来店チャレンジ」', amount: 20 },
  { date: '2026-08-01', label: 'プロフィール完成', amount: 30 },
]

// ─── Helpers ─────────────────────────────────────────────────────────

const DRAW_TYPE_LABEL: Record<DrawType, string> = {
  ticket_single: '抽選券1回',
  ticket_ten: '抽選券10連',
  jileage_single: 'Jレ1回',
  jileage_ten: 'Jレ10連',
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function countRarities(rarities: DrawRarity[]): Record<string, number> {
  const counts: Record<string, number> = { normal: 0, rare: 0, legend: 0 }
  for (const r of rarities) {
    if (r !== 'miss' && r in counts) counts[r]++
  }
  return counts
}

// Minimal reward label lookup — rewardIds in StoredDraw match DrawReward.id
// We use BADGE_MAP fallback, otherwise just show the id
function getRewardLabel(rewardId: string): { emoji: string; label: string } {
  if (rewardId === 'miss') return { emoji: '💨', label: 'はずれ' }
  const badge = BADGE_MAP[rewardId]
  if (badge) return { emoji: badge.emoji, label: badge.label }
  // Frame/title ids: derive label from id
  return { emoji: '🎁', label: rewardId.replace(/_/g, ' ') }
}

// ─── Sub-components ───────────────────────────────────────────────────

function StatusBar({ state }: { state: EngagementState }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-zinc-800 border-b border-zinc-700">
      <div className="flex items-center gap-1.5 bg-zinc-700 rounded-full px-3 py-1">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <rect
            x="3"
            y="7"
            width="18"
            height="13"
            rx="2"
            stroke="#a78bfa"
            strokeWidth="2"
          />
          <path
            d="M7 7V5a5 5 0 0 1 10 0v2"
            stroke="#a78bfa"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-xs font-semibold text-violet-300">
          {state.tickets}枚
        </span>
      </div>

      <div className="flex items-center gap-1.5 bg-zinc-700 rounded-full px-3 py-1">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" stroke="#fbbf24" strokeWidth="2" />
          <text
            x="12"
            y="16"
            textAnchor="middle"
            fontSize="10"
            fill="#fbbf24"
            fontWeight="bold"
          >
            J
          </text>
        </svg>
        <span className="text-xs font-semibold text-amber-300">
          {state.jileage.toLocaleString()}pt
        </span>
      </div>
    </div>
  )
}

function DrawHistoryRow({ draw }: { draw: StoredDraw }) {
  const [expanded, setExpanded] = useState(false)
  const counts = countRarities(draw.rarities)
  const total = draw.rewardIds.length

  const rarityBadge = (label: string, count: number, color: string) =>
    count > 0 ? (
      <span
        key={label}
        className={`text-xs px-1.5 py-0.5 rounded font-medium ${color}`}
      >
        {label} {count}
      </span>
    ) : null

  return (
    <div className="bg-zinc-800 rounded-xl overflow-hidden">
      <button
        className="w-full text-left px-4 py-3 flex items-start gap-3 active:bg-zinc-700 transition-colors"
        onClick={() => setExpanded(v => !v)}
        aria-expanded={expanded}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-white">
              {DRAW_TYPE_LABEL[draw.drawType]}
            </span>
            <span className="text-xs text-zinc-400">
              {formatDateTime(draw.drawnAt)}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-zinc-500">{total}回</span>
            {rarityBadge('ノーマル', counts.normal, 'bg-zinc-700 text-zinc-300')}
            {rarityBadge('レア', counts.rare, 'bg-blue-900/60 text-blue-300')}
            {rarityBadge('レジェンド', counts.legend, 'bg-amber-900/60 text-amber-300')}
          </div>
        </div>
        {/* chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className={`shrink-0 mt-0.5 text-zinc-500 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          aria-hidden="true"
        >
          <path
            d="M6 9l6 6 6-6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {expanded && (
        <div className="border-t border-zinc-700 px-4 py-2 space-y-1.5">
          {draw.rewardIds.map((rid, i) => {
            const rarity = draw.rarities[i] ?? 'miss'
            const { emoji, label } = getRewardLabel(rid)
            const isDup = false // stored history doesn't track per-item dup flag; omit
            const rarityColor =
              rarity === 'legend'
                ? 'text-amber-400'
                : rarity === 'rare'
                ? 'text-blue-400'
                : rarity === 'normal'
                ? 'text-zinc-300'
                : 'text-zinc-600'

            return (
              <div
                key={`${rid}-${i}`}
                className="flex items-center gap-2 text-sm"
              >
                <span className="text-base leading-none">{emoji}</span>
                <span className={`flex-1 truncate ${rarityColor}`}>{label}</span>
                {rarity !== 'miss' && (
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                      rarity === 'legend'
                        ? 'bg-amber-900/50 text-amber-300'
                        : rarity === 'rare'
                        ? 'bg-blue-900/50 text-blue-300'
                        : 'bg-zinc-700 text-zinc-400'
                    }`}
                  >
                    {rarity === 'legend'
                      ? 'LEGEND'
                      : rarity === 'rare'
                      ? 'RARE'
                      : 'NORMAL'}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function DrawHistoryTab({ state }: { state: EngagementState }) {
  const history = [...state.drawHistory]

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="px-4 py-4 space-y-3">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              className="text-zinc-700"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="7"
                width="18"
                height="13"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M7 7V5a5 5 0 0 1 10 0v2"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            <p className="text-zinc-500 text-sm">まだくじを引いていません</p>
          </div>
        ) : (
          history.map(draw => <DrawHistoryRow key={draw.id} draw={draw} />)
        )}
      </div>

      <div className="px-4 pb-6">
        <Link
          href="/mypage/lucky-draw"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-violet-600 active:bg-violet-700 transition-colors text-white text-sm font-semibold"
        >
          くじを引く
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M9 18l6-6-6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </div>
  )
}

function JileageHistoryTab({ state }: { state: EngagementState }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {/* Total */}
      <div className="mx-4 mt-4 mb-3 bg-zinc-800 rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm text-zinc-400">現在のJレージ</span>
        <span className="text-xl font-bold text-amber-300">
          {state.jileage.toLocaleString()}
          <span className="text-sm font-normal text-amber-400 ml-1">pt</span>
        </span>
      </div>

      <div className="px-4 space-y-2 pb-6">
        {MOCK_JILEAGE_EVENTS.map((ev, i) => (
          <div
            key={i}
            className="bg-zinc-800 rounded-xl px-4 py-3 flex items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{ev.label}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{ev.date}</p>
            </div>
            <span
              className={`text-sm font-bold shrink-0 ${
                ev.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {ev.amount >= 0 ? '+' : ''}
              {ev.amount}pt
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────

export default function RewardsPage() {
  const [state, setState] = useState<EngagementState | null>(null)
  const [activeTab, setActiveTab] = useState<Tab>('draw')

  useEffect(() => {
    setState(loadState())
  }, [])

  if (!state) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-zinc-600 border-t-violet-400 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col max-w-[430px] mx-auto">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 pt-safe-top pb-3 pt-4 border-b border-zinc-800">
        <Link
          href="/mypage"
          className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 active:bg-zinc-700 transition-colors shrink-0"
          aria-label="戻る"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M15 18l-6-6 6-6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
        <h1 className="text-base font-bold text-white">報酬履歴</h1>
      </header>

      {/* Status bar */}
      <StatusBar state={state} />

      {/* Tab switcher */}
      <div className="flex gap-0 border-b border-zinc-800 bg-zinc-900">
        {(
          [
            { key: 'draw', label: 'くじ履歴' },
            { key: 'jileage', label: 'Jレージ履歴' },
          ] as { key: Tab; label: string }[]
        ).map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
              activeTab === tab.key
                ? 'text-white'
                : 'text-zinc-500 active:text-zinc-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'draw' ? (
        <DrawHistoryTab state={state} />
      ) : (
        <JileageHistoryTab state={state} />
      )}
    </div>
  )
}
