'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import QRCode from 'react-qr-code'
import { createClient } from '@/lib/supabase/client'
import { MemberRank, Gender } from '@/lib/types'

type CardProfile = {
  member_id: string
  nickname: string
  birthday: string | null
  gender: Gender
  member_rank: MemberRank
  mileage: number
  photos: string[]
}

const RANK_GRADIENT: Record<MemberRank, string> = {
  BRONZE:   'from-amber-900 via-amber-700 to-amber-500',
  SILVER:   'from-zinc-700 via-zinc-500 to-zinc-300',
  GOLD:     'from-yellow-800 via-yellow-600 to-yellow-400',
  PLATINUM: 'from-cyan-900 via-cyan-700 to-cyan-400',
  DIAMOND:  'from-purple-900 via-purple-700 to-purple-400',
}

const RANK_ACCENT: Record<MemberRank, string> = {
  BRONZE:   '#d97706',
  SILVER:   '#a1a1aa',
  GOLD:     '#eab308',
  PLATINUM: '#22d3ee',
  DIAMOND:  '#a855f7',
}

const VALID_RANKS: MemberRank[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

function safeRank(value: string | null | undefined): MemberRank {
  if (value && (VALID_RANKS as string[]).includes(value)) return value as MemberRank
  return 'BRONZE'
}

function calcAge(birthday: string | null): number | null {
  if (!birthday) return null
  const today = new Date()
  const birth = new Date(birthday)
  let age = today.getFullYear() - birth.getFullYear()
  if (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate())) age--
  return age
}

export default function MemberCardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<CardProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [showQR, setShowQR] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data } = await supabase
        .from('profiles')
        .select('member_id, nickname, birthday, gender, member_rank, mileage, photos')
        .eq('id', user.id)
        .single()
      setProfile(data)
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black gap-4">
      <p className="text-zinc-400 text-sm">プロフィールを取得できませんでした</p>
      <button onClick={() => router.back()} className="text-blue-400 text-sm">戻る</button>
    </div>
  )

  const rank = safeRank(profile.member_rank)
  const age = calcAge(profile.birthday)
  const accentColor = RANK_ACCENT[rank]
  const displayNickname = profile.nickname?.trim() || '—'
  const avatarLetter = displayNickname !== '—' ? displayNickname[0] : '?'
  const validMemberId = profile.member_id?.trim() || ''

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">デジタル会員証</h1>
      </header>

      <div className="flex-1 flex flex-col items-center justify-start px-4 py-8 gap-6">

        {/* カード本体 */}
        <div
          className={`w-full max-w-sm rounded-3xl bg-gradient-to-br ${RANK_GRADIENT[rank]} p-px shadow-2xl`}
          style={{ boxShadow: `0 0 40px ${accentColor}33` }}
        >
          <div className="bg-zinc-950/80 rounded-3xl p-6 backdrop-blur-sm">
            {/* ロゴ・ランク */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-zinc-400 text-xs tracking-widest uppercase mb-0.5">JIS.bar</p>
                <p className="font-black text-xl tracking-widest" style={{ color: accentColor }}>
                  {rank}
                </p>
              </div>
              <div className="text-right">
                <p className="text-zinc-500 text-[10px] mb-0.5">MEMBER</p>
                <p className="text-white font-mono text-xs tracking-wider">
                  {validMemberId || '取得中...'}
                </p>
              </div>
            </div>

            {/* アバター＋名前 */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold flex-shrink-0 overflow-hidden border-2"
                style={{ borderColor: accentColor }}>
                {profile.photos?.[0]
                  ? <img src={profile.photos[0]} alt="" className="w-full h-full object-cover" />
                  : <span className="bg-zinc-800 w-full h-full flex items-center justify-center">{avatarLetter}</span>
                }
              </div>
              <div>
                <p className="text-white font-bold text-lg">{displayNickname}</p>
                {age && <p className="text-zinc-400 text-sm">{age}歳</p>}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="text-yellow-400 text-xs font-bold">
                    {(profile.mileage ?? 0).toLocaleString()} pt
                  </span>
                </div>
              </div>
            </div>

            {/* QRコードエリア */}
            <div
              className="w-full rounded-2xl flex flex-col items-center justify-center py-5 transition-opacity"
              style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${accentColor}44` }}
              onClick={() => validMemberId ? setShowQR(true) : undefined}
            >
              {validMemberId ? (
                <>
                  <div className="bg-white p-3 rounded-xl mb-3 cursor-pointer active:opacity-80">
                    <QRCode
                      value={validMemberId}
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <p className="text-zinc-400 text-xs">タップして拡大</p>
                </>
              ) : (
                <p className="text-zinc-500 text-sm py-4">会員番号を取得できません</p>
              )}
            </div>

            {/* 発行日 */}
            <p className="text-zinc-600 text-[10px] text-center mt-4">
              ※ このカードはJIS.bar公式アプリの会員証です
            </p>
          </div>
        </div>

        {/* デモ表記 */}
        <div className="w-full max-w-sm rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3">
          <p className="text-zinc-500 text-xs text-center">
            🔖 UI体験確認用デモ ｜ 店舗読み取り機能は今後実装予定
          </p>
        </div>

        {/* チェックインへのショートカット */}
        <button
          onClick={() => router.push('/checkin')}
          className="w-full max-w-sm bg-white text-black font-bold rounded-xl py-4 text-sm"
        >
          チェックインする
        </button>
      </div>

      {/* QRフルスクリーンモーダル */}
      {showQR && validMemberId && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center gap-6 px-8"
          onClick={() => setShowQR(false)}
        >
          <p className="text-zinc-400 text-sm">タップして閉じる</p>
          <div className="bg-white p-6 rounded-2xl">
            <QRCode
              value={validMemberId}
              size={220}
              bgColor="#ffffff"
              fgColor="#000000"
            />
          </div>
          <p className="text-white font-mono text-lg tracking-widest">{validMemberId}</p>
          <p className="text-zinc-500 text-xs">{displayNickname}</p>
        </div>
      )}
    </div>
  )
}
