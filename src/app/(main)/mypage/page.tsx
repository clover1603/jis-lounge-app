'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MemberRank, Gender } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { MOCK_JOURNEY, RANK_ACCENT } from '@/lib/mock-member-journey'
import { MOCK_JILEAGE_BALANCE, MOCK_TICKETS_COUNT, MOCK_ACHIEVEMENTS } from '@/lib/mock-member-engagement'
import { getNextChallenge, getActiveCount, CATEGORY_LABEL } from '@/lib/mock-challenges'

type DbProfile = {
  member_id: string
  nickname: string
  birthday: string | null
  gender: Gender
  member_rank: MemberRank
  mileage: number
  rating: number
  seating_hours: number
  photos: string[]
}


function calcAge(birthday: string | null): number | null {
  if (!birthday) return null
  const today = new Date()
  const birth = new Date(birthday)
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return age
}

type RankingUser = { rank: number; userId: string; nickname: string; value: number }
type RankingMetric = 'amount' | 'hours'
type RankingPeriod = 'daily' | 'monthly' | 'total'

export default function MyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [rankingUsers, setRankingUsers] = useState<RankingUser[]>([])
  const [rankingMetric, setRankingMetric] = useState<RankingMetric>('amount')
  const [rankingPeriod, setRankingPeriod] = useState<RankingPeriod>('monthly')
  const [rankingLoading, setRankingLoading] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadRanking(metric: RankingMetric, period: RankingPeriod) {
    setRankingLoading(true)
    const supabase = createClient()
    const { data } = await supabase.rpc('get_ranking', { p_metric: metric, p_period: period })
    setRankingUsers((data ?? []).map((u: { rank: number; user_id: string; nickname: string; value: number }) => ({
      rank: Number(u.rank),
      userId: u.user_id,
      nickname: u.nickname,
      value: Number(u.value),
    })))
    setRankingLoading(false)
  }

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setCurrentUserId(user.id)
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
      await loadRanking('amount', 'monthly')
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const user = profile ? {
    nickname: profile.nickname,
    age: calcAge(profile.birthday),
    memberId: profile.member_id,
    gender: profile.gender ?? 'male',
    rank: (profile.member_rank ?? 'BRONZE') as MemberRank,
    mileage: profile.mileage ?? 0,
    rating: profile.rating ?? 3.0,
    seatingHours: profile.seating_hours ?? 0,
  } : { nickname: 'ゲスト', age: null, memberId: '---', gender: 'male' as Gender, rank: 'BRONZE' as MemberRank, mileage: 0, rating: 3.0, seatingHours: 0 }



  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <h1 className="text-lg font-bold">マイページ</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-6 pb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden">
            {profile?.photos?.[0]
              ? <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
              : user.nickname[0]
            }
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-lg">{user.nickname}</p>
            <p className="text-zinc-400 text-sm">{user.age}歳</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-zinc-500">{user.memberId}</span>
              <span className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </span>
            </div>
          </div>
          <Link href="/mypage/edit" className="bg-zinc-800 text-white text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-700">
            プロフィール
          </Link>
        </div>

        {/* ── Jレージ残高 ── */}
        <Link href="/mypage/jileage" className="mx-4 mb-4 bg-zinc-900 rounded-2xl p-4 flex items-center gap-4 border border-zinc-800 hover:bg-zinc-800/60 transition-colors">
          <div className="w-10 h-10 rounded-xl bg-indigo-900/60 flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs text-zinc-500">Jレージ</p>
            <p className="text-2xl font-bold text-indigo-300">{MOCK_JILEAGE_BALANCE.toLocaleString()}<span className="text-sm font-normal text-zinc-400 ml-1">pt</span></p>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>

        {/* ── チャレンジ概要カード ── */}
        {(() => {
          const next = getNextChallenge()
          if (!next) return null
          const pct = Math.min(100, Math.round((next.current / next.target) * 100))
          const remaining = next.target - next.current
          return (
            <Link href="/mypage/challenges" className="mx-4 mb-4 block bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-4 hover:bg-zinc-800/60 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">{CATEGORY_LABEL[next.category]}</span>
                  <span className="text-xs text-zinc-500">チャレンジ {getActiveCount()}件進行中</span>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
              <p className="text-sm font-semibold text-white mb-1">{next.title}</p>
              <p className="text-xs text-zinc-500 mb-3">{next.description}</p>
              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-1.5">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500 tabular-nums">{next.current}<span className="text-zinc-700">/{next.target}{next.unit}</span></span>
                {remaining <= Math.ceil(next.target * 0.3) && remaining > 0
                  ? <span className="text-xs text-white font-semibold">あと{remaining}{next.unit}</span>
                  : <span className="text-xs text-zinc-600">{pct}%</span>
                }
              </div>
            </Link>
          )
        })()}

        {/* ── 継続機能サマリーカード ── */}
        <div className="mx-4 mb-4 space-y-3">

          {/* 来店チャレンジ */}
          <Link href="/mypage/journey" className="flex items-center justify-between bg-zinc-900 rounded-2xl border border-zinc-800 px-4 py-4 hover:bg-zinc-800/60 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-white">今月のミッション</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  今月 {MOCK_JOURNEY.totalVisitsThisMonth}回来店 · {MOCK_JOURNEY.monthlyMissions.filter(m => m.completed).length}/{MOCK_JOURNEY.monthlyMissions.length} 達成
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.round((MOCK_JOURNEY.monthlyMissions.filter(m=>m.completed).length / MOCK_JOURNEY.monthlyMissions.length) * 100)}%` }} />
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          </Link>

          {/* 2x2グリッド: ステータス / 実績 / ラッキーくじ / トロフィー */}
          <div className="grid grid-cols-2 gap-3">

            {/* 会員ステータス */}
            <Link href="/mypage/status" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 hover:bg-zinc-800/60 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">会員ステータス</p>
              <p className="text-xs mt-1" style={{ color: RANK_ACCENT[user.rank] }}>{user.rank}</p>
            </Link>

            {/* 実績・コレクション */}
            <Link href="/mypage/achievements" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 hover:bg-zinc-800/60 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 6 2 18 2 18 9" />
                  <path d="M6 18H4a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-2" />
                  <rect x="6" y="18" width="12" height="4" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">実績</p>
              <p className="text-xs text-zinc-500 mt-1">{MOCK_ACHIEVEMENTS.filter(a => a.isUnlocked).length}/{MOCK_ACHIEVEMENTS.length} 解除</p>
            </Link>

            {/* ラッキーくじ */}
            <Link href="/mypage/lucky-draw" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 hover:bg-zinc-800/60 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">ラッキーくじ</p>
              <p className="text-xs text-zinc-500 mt-1">抽選券 {MOCK_TICKETS_COUNT}枚</p>
            </Link>

            {/* トロフィー */}
            <Link href="/mypage/trophy" className="bg-zinc-900 rounded-2xl border border-zinc-800 p-4 hover:bg-zinc-800/60 transition-colors">
              <div className="w-9 h-9 rounded-xl bg-zinc-800 flex items-center justify-center mb-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9h18v2a9 9 0 0 1-18 0V9z" />
                  <path d="M12 20v-9" />
                  <path d="M9 20h6" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">トロフィー</p>
              <p className="text-xs text-zinc-500 mt-1">{MOCK_JOURNEY.visitedStoreIds.length}店舗 利用済み</p>
            </Link>

          </div>
        </div>

        <div className="mx-4 mb-4">
          <h2 className="text-sm font-bold mb-3">ランキング</h2>

          {/* 会計 / 相席時間 */}
          <div className="flex mb-2 rounded-xl bg-zinc-800 p-1">
            {(['amount', 'hours'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setRankingMetric(m); loadRanking(m, rankingPeriod) }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-colors ${rankingMetric === m ? 'bg-white text-black' : 'text-zinc-400'}`}
              >
                {m === 'amount' ? '会計' : '相席時間'}
              </button>
            ))}
          </div>

          {/* 日別 / 月別 / 累計 */}
          <div className="flex mb-3 gap-1.5">
            {(['daily', 'monthly', 'total'] as const).map((p) => (
              <button
                key={p}
                onClick={() => { setRankingPeriod(p); loadRanking(rankingMetric, p) }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${rankingPeriod === p ? 'border-white text-white bg-white/10' : 'border-zinc-700 text-zinc-500'}`}
              >
                {p === 'daily' ? '日別' : p === 'monthly' ? '月別' : '累計'}
              </button>
            ))}
          </div>

          <div className="bg-zinc-900 rounded-2xl overflow-hidden">
            {rankingLoading ? (
              <div className="flex justify-center py-8">
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
              </div>
            ) : rankingUsers.length === 0 ? (
              <p className="text-center text-zinc-600 text-xs py-8">データなし</p>
            ) : rankingUsers.map((u) => (
              <div key={u.rank} className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800 last:border-0 ${u.userId === currentUserId ? 'bg-zinc-800/60' : ''}`}>
                <span className={`text-sm font-bold w-6 text-center flex-shrink-0 ${u.rank <= 3 ? 'text-yellow-400' : 'text-zinc-500'}`}>{u.rank}</span>
                <span className="flex-1 text-sm truncate">{u.nickname}</span>
                <span className="text-yellow-400 text-xs font-bold flex-shrink-0">
                  {rankingMetric === 'amount' ? `¥${u.value.toLocaleString()}` : `${u.value.toFixed(1)}h`}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-6 bg-zinc-900 rounded-2xl overflow-hidden">
          {[
            { label: 'デジタル会員証', href: '/mypage/membercard' },
            { label: 'プロフィール編集', href: '/mypage/edit' },
            { label: '設定', href: '/mypage/settings' },
          ].map((item) => (
            <Link key={item.label} href={item.href} className="flex items-center justify-between px-4 py-4 border-b border-zinc-800 last:border-0">
              <span className="text-sm">{item.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
          <button className="flex items-center justify-between px-4 py-4 w-full border-t border-zinc-800" onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}>
            <span className="text-sm text-red-400">ログアウト</span>
          </button>
        </div>
      </div>
    </div>
  )
}
