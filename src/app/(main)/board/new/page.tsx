'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import NoPhotoSheet from '@/components/NoPhotoSheet'

const MAX_CHARS = 200

const PREFECTURE_TAGS = [
  '東京都', '大阪府', '神奈川県', '北海道', '福岡県',
  '熊本県', '兵庫県', '京都府', '埼玉県', '千葉県', '愛知県', '広島県',
]

export default function NewPostPage() {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [selectedPrefs, setSelectedPrefs] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [hasPhoto, setHasPhoto] = useState(true)
  const [showNoPhoto, setShowNoPhoto] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return
      const { data } = await supabase.from('profiles').select('photos').eq('id', user.id).single()
      setHasPhoto((data?.photos ?? []).length > 0)
    })
  }, [])

  function togglePref(pref: string) {
    setSelectedPrefs(prev => prev.includes(pref) ? prev.filter(p => p !== pref) : [...prev, pref])
  }

  async function handleSubmit() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('ログインが必要です'); setSubmitting(false); return }

    const { error: insertError } = await supabase.from('posts').insert({
      user_id: user.id,
      content: content.trim(),
      target_prefectures: selectedPrefs,
    })

    if (insertError) {
      setError('投稿に失敗しました')
      setSubmitting(false)
      return
    }

    setSubmitted(true)
    setTimeout(() => router.push('/board'), 1400)
  }

  if (submitted) {
    return (
      <div className="flex flex-col min-h-screen bg-black items-center justify-center px-8">
        <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white text-lg font-bold">投稿しました！</p>
        <p className="text-zinc-500 text-sm mt-1">掲示板に戻ります...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold flex-1">新規投稿</h1>
      </header>

      <div className="flex-1 p-4 space-y-5 pb-32">
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value.slice(0, MAX_CHARS))}
            placeholder="今夜どこかに行く方いませんか？"
            autoFocus
            className="w-full bg-zinc-900 text-white rounded-2xl p-4 text-sm leading-relaxed resize-none border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            style={{ minHeight: '200px' }}
          />
          <div className="flex justify-end mt-1.5">
            <span className={`text-xs ${content.length >= MAX_CHARS ? 'text-red-400' : 'text-zinc-500'}`}>
              {content.length} / {MAX_CHARS}文字
            </span>
          </div>
        </div>

        <div>
          <p className="text-sm text-zinc-400 mb-3">地域タグ <span className="text-zinc-600 text-xs">(複数選択可)</span></p>
          <div className="flex flex-wrap gap-2">
            {PREFECTURE_TAGS.map((pref) => {
              const selected = selectedPrefs.includes(pref)
              return (
                <button
                  key={pref}
                  onClick={() => togglePref(pref)}
                  className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    selected ? 'bg-white text-black border-white' : 'bg-transparent text-zinc-400 border-zinc-700'
                  }`}
                >
                  {pref}
                </button>
              )
            })}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="fixed left-0 right-0 px-4 pb-4 pt-3 bg-black border-t border-zinc-800" style={{ bottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
        <button
          onClick={() => !hasPhoto ? setShowNoPhoto(true) : handleSubmit()}
          disabled={!content.trim() || submitting}
          className="w-full bg-white text-black font-semibold rounded-xl py-3.5 text-sm disabled:opacity-40"
        >
          {submitting ? '投稿中...' : '投稿する'}
        </button>
        {showNoPhoto && <NoPhotoSheet onClose={() => setShowNoPhoto(false)} />}
      </div>
    </div>
  )
}
