'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { mockRankingUsers } from '@/lib/mock-data'
import { MemberRank, Gender } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

type DbProfile = {
  member_id: string
  nickname: string
  birthday: string | null
  gender: Gender
  member_rank: MemberRank
  mileage: number
  rating: number
  seating_hours: number
}

const RANK_COLORS: Record<MemberRank, string> = {
  BRONZE:   'from-amber-700 to-amber-500',
  SILVER:   'from-zinc-500 to-zinc-300',
  GOLD:     'from-yellow-600 to-yellow-400',
  PLATINUM: 'from-cyan-700 to-cyan-500',
  DIAMOND:  'from-purple-700 to-purple-500',
}

const RANK_LABELS: Record<MemberRank, string> = {
  BRONZE:   'BRONZE',
  SILVER:   'SILVER',
  GOLD:     'GOLD',
  PLATINUM: 'PLATINUM',
  DIAMOND:  'DIAMOND',
}

const RANK_BADGE_COLORS: Record<MemberRank, string> = {
  BRONZE:   'bg-amber-700 text-white',
  SILVER:   'bg-zinc-500 text-white',
  GOLD:     'bg-yellow-500 text-black',
  PLATINUM: 'bg-cyan-700 text-white',
  DIAMOND:  'bg-purple-700 text-white',
}

const RANKS: MemberRank[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

type RankCondition = {
  rating: number | null
  hours: { male: number; female: number }
}
const RANK_CONDITIONS: Record<MemberRank, RankCondition> = {
  BRONZE:   { rating: null,  hours: { male: 0,  female: 0  } },
  SILVER:   { rating: null,  hours: { male: 2,  female: 2  } },
  GOLD:     { rating: 3.1,   hours: { male: 10, female: 13 } },
  PLATINUM: { rating: 3.3,   hours: { male: 25, female: 45 } },
  DIAMOND:  { rating: 3.5,   hours: { male: 45, female: 90 } },
}

type BadgeLevel = { label: string; requirement: number }
type BadgeCategory = { category: string; icon: string; levels: BadgeLevel[]; current: number }

const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    category: '来店回数',
    icon: '🏠',
    current: 8,
    levels: [
      { label: '初回来店', requirement: 1 },
      { label: '三回来店', requirement: 3 },
      { label: '十回来店', requirement: 10 },
      { label: '三十回来店', requirement: 30 },
      { label: '五十回来店', requirement: 50 },
      { label: '百回来店', requirement: 100 },
    ],
  },
  {
    category: 'ボトルキープ',
    icon: '🍾',
    current: 2,
    levels: [
      { label: 'ボトル初注文', requirement: 1 },
      { label: 'ボトル5本', requirement: 5 },
      { label: 'ボトル10本', requirement: 10 },
    ],
  },
  {
    category: 'シャンパン',
    icon: '🥂',
    current: 0,
    levels: [
      { label: 'シャンパン初注文', requirement: 1 },
      { label: 'シャンパン5本', requirement: 5 },
    ],
  },
  {
    category: 'プロフィール',
    icon: '👤',
    current: 1,
    levels: [
      { label: 'プロフィール完成', requirement: 1 },
    ],
  },
  {
    category: 'お気に入り',
    icon: '⭐',
    current: 2,
    levels: [
      { label: 'お気に入り3店舗', requirement: 3 },
      { label: '全店舗登録', requirement: 8 },
    ],
  },
]

function calcAge(birthday: string | null): number | null {
  if (!birthday) return null
  const today = new Date()
  const birth = new Date(birthday)
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return age
}

export default function MyPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<DbProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'rank' | 'badge'>('rank')
  const [showRankInfo, setShowRankInfo] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      setProfile(data)
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

  const rankIdx = RANKS.indexOf(user.rank)
  const nextRank = RANKS[rankIdx + 1] as MemberRank | undefined
  const nextCond = nextRank ? RANK_CONDITIONS[nextRank] : null
  const requiredHours = nextCond ? (user.gender === 'male' ? nextCond.hours.male : nextCond.hours.female) : 0
  const ratingProgress = nextCond?.rating ? Math.min(100, (user.rating / nextCond.rating) * 100) : 100
  const hoursProgress = nextCond ? Math.min(100, (user.seatingHours / requiredHours) * 100) : 100

  const totalEarned = BADGE_CATEGORIES.reduce((sum, cat) => {
    return sum + cat.levels.filter(l => cat.current >= l.requirement).length
  }, 0)
  const totalBadges = BADGE_CATEGORIES.reduce((sum, cat) => sum + cat.levels.length, 0)

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <h1 className="text-lg font-bold">マイページ</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pt-6 pb-4 flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-zinc-700 flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {user.nickname[0]}
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

        <div className="mx-4 mb-4 bg-zinc-900 rounded-2xl p-4 flex items-center gap-4">
          <span className="text-2xl">🐷</span>
          <div>
            <p className="text-xs text-zinc-500">マイレージ</p>
            <p className="text-2xl font-bold text-yellow-400">{user.mileage.toLocaleString()}<span className="text-sm font-normal text-zinc-400 ml-1">pt</span></p>
          </div>
        </div>

        <div className="mx-4 mb-4 flex rounded-xl overflow-hidden border border-zinc-800">
          {[['rank', '会員ランク'], ['badge', '称号']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'rank' | 'badge')}
              className={`flex-1 py-2.5 text-xs font-semibold transition-colors ${activeTab === key ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'rank' && (
          <div className="mx-4 mb-4">
            {/* ランクカード */}
            <div className={`rounded-2xl bg-gradient-to-br ${RANK_COLORS[user.rank]} p-6 mb-4 relative`}>
              <button
                onClick={() => setShowRankInfo(true)}
                className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold"
              >?</button>
              <p className="text-4xl font-black tracking-widest text-center text-white mb-4">
                {RANK_LABELS[user.rank]}
              </p>

              {/* 評価点 */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>相手からの評価</span>
                  <span>{user.rating.toFixed(1)}点 {nextCond?.rating ? `/ ${nextCond.rating}点以上` : ''}</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: `${ratingProgress}%` }} />
                </div>
              </div>

              {/* 相席時間 */}
              <div>
                <div className="flex justify-between text-xs text-white/70 mb-1">
                  <span>総相席時間</span>
                  <span>{user.seatingHours}時間 {nextCond ? `/ ${requiredHours}時間以上` : ''}</span>
                </div>
                <div className="w-full h-2 bg-white/20 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: `${hoursProgress}%` }} />
                </div>
              </div>

              {nextRank && (
                <p className="text-white/60 text-xs text-center mt-3">
                  次のランク: <span className="text-white font-bold">{RANK_LABELS[nextRank]}</span>
                </p>
              )}
            </div>

            {/* ランク進行ライン */}
            <div className="flex items-center justify-between px-1 mb-2">
              {RANKS.map((r, i) => (
                <div key={r} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold border-2
                      ${r === user.rank ? 'border-white bg-white text-black scale-110' : rankIdx > i ? 'border-white bg-white/20 text-white' : 'border-zinc-700 bg-zinc-900 text-zinc-600'}`}>
                      {r.slice(0, 2)}
                    </div>
                    <span className={`text-[9px] ${rankIdx >= i ? 'text-white' : 'text-zinc-600'}`}>{r}</span>
                  </div>
                  {i < RANKS.length - 1 && (
                    <div className={`h-0.5 w-6 mx-0.5 mb-4 ${rankIdx > i ? 'bg-white' : 'bg-zinc-700'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ランク条件モーダル */}
        {showRankInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
              <h2 className="text-lg font-bold text-center mb-4">会員ランク</h2>
              <p className="text-zinc-400 text-sm mb-4">
                「相手からの評価」と「相席時間」を元に算出され、毎日午前中に更新されます。
              </p>
              <div className="space-y-4 mb-4">
                {[...RANKS].reverse().map(r => {
                  const cond = RANK_CONDITIONS[r]
                  return (
                    <div key={r}>
                      <p className={`font-bold text-sm mb-1 bg-gradient-to-r ${RANK_COLORS[r]} bg-clip-text text-transparent`}>
                        ①{r === 'BRONZE' ? 'BRONZE（アプリ登録）' : r}
                      </p>
                      {cond.rating && (
                        <p className="text-zinc-300 text-xs">男性：{cond.rating}点以上 & {cond.hours.male}時間以上</p>
                      )}
                      {cond.rating && (
                        <p className="text-zinc-300 text-xs">女性：{cond.rating}点以上 & {cond.hours.female}時間以上</p>
                      )}
                      {!cond.rating && r !== 'BRONZE' && (
                        <p className="text-zinc-300 text-xs">男女：{cond.hours.male}時間以上</p>
                      )}
                      {r === 'BRONZE' && (
                        <p className="text-zinc-300 text-xs">男女：公式アプリ登録</p>
                      )}
                    </div>
                  )
                })}
              </div>
              <p className="text-zinc-500 text-xs mb-4">
                ※相手からの評価＝過去365日間における相席相手からの評価の平均点。良い5.0点、普通3.0点、悪い1.0点で計算。評価数が3組未満の場合は一律3.0点。
              </p>
              <p className="text-zinc-500 text-xs mb-6">
                ※相席時間＝過去365日間の累計相席時間。VIP席は2倍カウント。
              </p>
              <button
                onClick={() => setShowRankInfo(false)}
                className="w-full py-3 text-center text-white font-bold border-t border-zinc-700"
              >OK</button>
            </div>
          </div>
        )}

        {activeTab === 'badge' && (
          <div className="mx-4 mb-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-400">獲得済み称号</p>
              <span className="text-sm font-bold text-yellow-400">{totalEarned}<span className="text-zinc-500">/{totalBadges}</span></span>
            </div>
            <div className="space-y-4">
              {BADGE_CATEGORIES.map((cat) => {
                const earnedLevels = cat.levels.filter(l => cat.current >= l.requirement)
                const nextLevel = cat.levels.find(l => cat.current < l.requirement)
                const progress = nextLevel
                  ? Math.round((cat.current / nextLevel.requirement) * 100)
                  : 100

                return (
                  <div key={cat.category} className="bg-zinc-900 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{cat.icon}</span>
                      <span className="text-sm font-bold text-white">{cat.category}</span>
                      <span className="ml-auto text-xs text-zinc-500">{earnedLevels.length}/{cat.levels.length}</span>
                    </div>

                    {/* 達成済みバッジ */}
                    {earnedLevels.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {earnedLevels.map(l => (
                          <div key={l.label} className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500 rounded-full px-2 py-1">
                            <span className="text-xs">🏅</span>
                            <span className="text-[10px] font-semibold text-yellow-400">{l.label}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 次のレベル（進行中） */}
                    {nextLevel && (
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-zinc-400">次の称号: <span className="text-white font-semibold">{nextLevel.label}</span></span>
                          <span className="text-zinc-500">{cat.current}/{nextLevel.requirement}</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-700 rounded-full">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {!nextLevel && (
                      <p className="text-xs text-yellow-400 font-semibold">✨ 全レベル達成！</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="mx-4 mb-4">
          <h2 className="text-sm font-bold mb-3">ランキング</h2>
          <div className="bg-zinc-900 rounded-2xl overflow-hidden">
            {mockRankingUsers.map((u) => (
              <div key={u.rank} className={`flex items-center gap-3 px-4 py-3 border-b border-zinc-800 last:border-0 ${u.nickname === 'あなた' ? 'bg-zinc-800' : ''}`}>
                <span className={`text-sm font-bold w-6 text-center ${u.rank <= 3 ? 'text-yellow-400' : 'text-zinc-500'}`}>{u.rank}</span>
                <span className="flex-1 text-sm">{u.nickname}</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${RANK_BADGE_COLORS[u.memberRank]}`}>{RANK_LABELS[u.memberRank]}</span>
                <span className="text-yellow-400 text-xs font-bold">{u.mileage.toLocaleString()}pt</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-4 mb-6 bg-zinc-900 rounded-2xl overflow-hidden">
          {[
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
