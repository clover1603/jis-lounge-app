'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { MemberRank } from '@/lib/types'
import {
  RANK_GRADIENT, RANK_ACCENT, RANK_BENEFITS, ALL_RANKS,
  MOCK_RANK_PROGRESS,
} from '@/lib/mock-member-journey'

const RANK_CONDITIONS: Record<MemberRank, { hours: { male: number; female: number }; rating: number | null }> = {
  BRONZE:   { hours: { male: 0,  female: 0  }, rating: null },
  SILVER:   { hours: { male: 2,  female: 2  }, rating: null },
  GOLD:     { hours: { male: 10, female: 13 }, rating: 3.1  },
  PLATINUM: { hours: { male: 25, female: 45 }, rating: 3.3  },
  DIAMOND:  { hours: { male: 45, female: 90 }, rating: 3.5  },
}

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = Math.min(100, max > 0 ? (value / max) * 100 : 0)
  return (
    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

function RequirementRow({ label, current, required, unit, color, met }: {
  label: string; current: number; required: number; unit: string; color: string; met: boolean
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-zinc-400">{label}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums" style={{ color }}>{current}{unit}</span>
          <span className="text-zinc-600">/ {required}{unit}以上</span>
          {met && (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
        </div>
      </div>
      <ProgressBar value={current} max={required} color={color} />
    </div>
  )
}

export default function RankPage() {
  const router = useRouter()
  const [rank, setRank] = useState<MemberRank>(MOCK_RANK_PROGRESS.currentRank)
  const [seatingHours, setSeatingHours] = useState(MOCK_RANK_PROGRESS.seatingHours)
  const [rating, setRating] = useState(MOCK_RANK_PROGRESS.rating)
  const [gender, setGender] = useState<'male' | 'female'>('male')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      supabase
        .from('profiles')
        .select('member_rank, seating_hours, rating, gender')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) return
          if (data.member_rank) setRank(data.member_rank as MemberRank)
          if (data.seating_hours != null) setSeatingHours(Number(data.seating_hours))
          if (data.rating != null) setRating(Number(data.rating))
          if (data.gender) setGender(data.gender as 'male' | 'female')
        })
    })
  }, [])

  const rankIdx = ALL_RANKS.indexOf(rank)
  const nextRank = ALL_RANKS[rankIdx + 1] as MemberRank | undefined
  const nextCond = nextRank ? RANK_CONDITIONS[nextRank] : null
  const requiredHours = nextCond ? (gender === 'male' ? nextCond.hours.male : nextCond.hours.female) : seatingHours
  const hoursMet = !nextCond || seatingHours >= requiredHours
  const ratingMet = !nextCond?.rating || rating >= nextCond.rating
  const accentColor = RANK_ACCENT[rank]

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">会員ランク</h1>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">

        {/* ランクヒーローカード */}
        <div
          className={`rounded-3xl bg-gradient-to-br ${RANK_GRADIENT[rank]} p-px shadow-2xl`}
          style={{ boxShadow: `0 0 40px ${accentColor}44` }}
        >
          <div className="bg-zinc-950/75 rounded-3xl p-6 backdrop-blur-sm">
            <p className="text-xs tracking-widest text-zinc-400 uppercase mb-1">Current Rank</p>
            <p className="text-4xl font-black tracking-widest mb-1" style={{ color: accentColor }}>{rank}</p>
            <p className="text-zinc-500 text-xs">JIS.bar 会員ランク</p>

            {nextRank && (
              <div className="mt-5 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-zinc-400">次のランクまで</span>
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
                <p className="text-white/40 text-[10px] mt-1.5 text-right">
                  相席時間 {seatingHours}h / {requiredHours}h
                </p>
              </div>
            )}
            {!nextRank && (
              <p className="text-xs mt-4 pt-4 border-t border-white/10" style={{ color: accentColor }}>
                最高ランクに到達しています
              </p>
            )}
          </div>
        </div>

        {/* 達成条件 */}
        {nextRank && nextCond && (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <p className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">
              {nextRank} への達成条件
            </p>
            <div className="space-y-4">
              <RequirementRow
                label="総相席時間"
                current={seatingHours}
                required={requiredHours}
                unit="h"
                color={accentColor}
                met={hoursMet}
              />
              {nextCond.rating && (
                <RequirementRow
                  label="評価スコア"
                  current={rating}
                  required={nextCond.rating}
                  unit="点"
                  color={accentColor}
                  met={ratingMet}
                />
              )}
            </div>
            {hoursMet && ratingMet ? (
              <p className="text-xs text-center mt-4 font-semibold" style={{ color: accentColor }}>
                条件達成中 — 翌日更新で昇格予定
              </p>
            ) : (
              <p className="text-zinc-600 text-xs text-center mt-4">
                ※ 評価は毎日午前中に更新されます
              </p>
            )}
          </div>
        )}

        {/* 現在ランクの特典 */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-3 tracking-wider uppercase">{rank} 特典</p>
          <ul className="space-y-2.5">
            {RANK_BENEFITS[rank].map((b, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: accentColor }} />
                <p className="text-sm text-zinc-300">{b}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* ランク一覧タイムライン */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">ランク一覧</p>
          <div className="space-y-0">
            {[...ALL_RANKS].reverse().map((r, i, arr) => {
              const isCurrent = r === rank
              const isAchieved = ALL_RANKS.indexOf(r) <= rankIdx
              const accent = RANK_ACCENT[r]
              const cond = RANK_CONDITIONS[r]
              const hrs = gender === 'male' ? cond.hours.male : cond.hours.female
              return (
                <div key={r} className="flex gap-3">
                  {/* タイムラインライン */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1"
                      style={{
                        borderColor: isAchieved ? accent : '#3f3f46',
                        backgroundColor: isCurrent ? accent : isAchieved ? `${accent}33` : 'transparent',
                      }}
                    />
                    {i < arr.length - 1 && (
                      <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: isAchieved ? accent + '44' : '#27272a', minHeight: 24 }} />
                    )}
                  </div>
                  {/* コンテンツ */}
                  <div className="pb-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold" style={{ color: isAchieved ? accent : '#52525b' }}>{r}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${accent}22`, color: accent }}>
                          現在
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-600">
                      {r === 'BRONZE' ? 'アプリ登録で取得' : `相席${hrs}h以上${cond.rating ? ` / 評価${cond.rating}点以上` : ''}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-zinc-700 text-xs text-center pb-2">
          ※ ランクは実際のプロフィールデータを反映 ｜ その他の値はデモ表示
        </p>
      </div>
    </div>
  )
}
