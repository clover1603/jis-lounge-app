'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500',
]

function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'たった今'
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  return `${Math.floor(h / 24)}日前`
}

function calcAge(birthday: string | null): number {
  if (!birthday) return 0
  const today = new Date()
  const birth = new Date(birthday)
  let age = today.getFullYear() - birth.getFullYear()
  if (today.getMonth() - birth.getMonth() < 0 ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) age--
  return age
}

type DisplayPost = {
  id: string
  userId: string
  nickname: string
  age: number
  targetPrefectures: string[]
  content: string
  likes: number
  liked: boolean
  createdAt: string
}

type MessageSheet = { postId: string; userId: string; nickname: string }

export default function BoardPage() {
  const [posts, setPosts] = useState<DisplayPost[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const [showFilter, setShowFilter] = useState(false)
  const [myOnly, setMyOnly] = useState(false)
  const [pendingMyOnly, setPendingMyOnly] = useState(false)

  const [messageSheet, setMessageSheet] = useState<MessageSheet | null>(null)
  const [messageText, setMessageText] = useState('')
  const [toastVisible, setToastVisible] = useState(false)

  useEffect(() => { loadPosts() }, [])

  async function loadPosts() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUserId(user?.id ?? null)

    const { data: postData } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (!postData || postData.length === 0) { setLoading(false); return }

    const userIds = [...new Set(postData.map((p: { user_id: string }) => p.user_id))]
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id, nickname, birthday')
      .in('id', userIds)

    const profileMap: Record<string, { nickname: string; birthday: string | null }> = {}
    for (const p of (profileData ?? [])) profileMap[p.id] = { nickname: p.nickname, birthday: p.birthday }

    setPosts(postData.map((p: {
      id: string; user_id: string; content: string; likes_count: number;
      target_prefectures: string[]; created_at: string
    }) => ({
      id: p.id,
      userId: p.user_id,
      nickname: profileMap[p.user_id]?.nickname ?? 'ゲスト',
      age: calcAge(profileMap[p.user_id]?.birthday ?? null),
      targetPrefectures: p.target_prefectures ?? [],
      content: p.content,
      likes: p.likes_count,
      liked: false,
      createdAt: p.created_at,
    })))
    setLoading(false)
  }

  async function toggleLike(id: string) {
    const post = posts.find(p => p.id === id)
    if (!post) return
    const newLiked = !post.liked
    const newLikes = newLiked ? post.likes + 1 : post.likes - 1
    setPosts(prev => prev.map(p => p.id === id ? { ...p, liked: newLiked, likes: newLikes } : p))
    const supabase = createClient()
    await supabase.from('posts').update({ likes_count: newLikes }).eq('id', id)
  }

  function openMessageSheet(postId: string, userId: string, nickname: string) {
    setMessageSheet({ postId, userId, nickname })
    setMessageText('')
  }

  function sendMessage() {
    setMessageSheet(null)
    setMessageText('')
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 2500)
  }

  const displayed = posts.filter(p => !myOnly || p.userId === currentUserId)

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold">掲示板</h1>
        <button
          onClick={() => { setPendingMyOnly(myOnly); setShowFilter(true) }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-800 border border-zinc-700 text-xs text-zinc-300"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          絞り込み
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 pb-24">
        {loading && <p className="text-center text-zinc-500 mt-16">読み込み中...</p>}
        {!loading && displayed.length === 0 && (
          <p className="text-center text-zinc-500 mt-16">投稿がありません。</p>
        )}
        {displayed.map((post) => (
          <div key={post.id} className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-full ${avatarColor(post.nickname)} flex items-center justify-center text-sm font-bold flex-shrink-0 text-white`}>
                {post.nickname[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-white">{post.nickname}</span>
                  {post.age > 0 && (
                    <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{post.age}歳</span>
                  )}
                </div>
                {post.targetPrefectures.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="text-xs text-zinc-600">地域:</span>
                    {post.targetPrefectures.map((pref) => (
                      <span key={pref} className="text-xs text-blue-400">{pref}</span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-zinc-200 mt-2 leading-relaxed">{post.content}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-zinc-600">{timeAgo(post.createdAt)}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1.5">
                      <svg width="18" height="18" viewBox="0 0 24 24"
                        fill={post.liked ? '#ef4444' : 'none'}
                        stroke={post.liked ? '#ef4444' : '#71717a'}
                        strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      <span className={`text-xs ${post.liked ? 'text-red-400' : 'text-zinc-500'}`}>{post.likes}</span>
                    </button>
                    {post.userId !== currentUserId && (
                      <button
                        onClick={() => openMessageSheet(post.id, post.userId, post.nickname)}
                        className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/board/new"
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg z-40"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </Link>

      {toastVisible && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-zinc-800 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-lg border border-zinc-700 pointer-events-none">
          送信しました ✓
        </div>
      )}

      {showFilter && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilter(false)} />
          <div className="relative bg-zinc-900 rounded-t-2xl p-6 z-10 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold">絞り込み</h2>
              <button onClick={() => setShowFilter(false)} className="text-zinc-400 p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm text-white">自分の投稿のみ</span>
              <button
                onClick={() => setPendingMyOnly(v => !v)}
                className={`w-12 h-6 rounded-full transition-colors relative flex-shrink-0 ${pendingMyOnly ? 'bg-blue-500' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-200 ${pendingMyOnly ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setPendingMyOnly(false)} className="flex-1 bg-zinc-800 text-zinc-300 font-semibold rounded-xl py-3 text-sm border border-zinc-700">クリア</button>
              <button onClick={() => { setMyOnly(pendingMyOnly); setShowFilter(false) }} className="flex-1 bg-white text-black font-semibold rounded-xl py-3 text-sm">検索</button>
            </div>
          </div>
        </div>
      )}

      {messageSheet && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMessageSheet(null)} />
          <div className="relative bg-zinc-900 rounded-t-2xl p-6 z-10 border-t border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-zinc-500 mb-0.5">メッセージを送る</p>
                <h2 className="text-base font-bold">{messageSheet.nickname} さんへ</h2>
              </div>
              <button onClick={() => setMessageSheet(null)} className="text-zinc-400 p-1">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="メッセージを入力..."
              autoFocus
              rows={4}
              className="w-full bg-zinc-800 text-white rounded-xl p-3 text-sm border border-zinc-700 focus:outline-none focus:border-zinc-500 resize-none placeholder:text-zinc-600"
            />
            <button
              onClick={sendMessage}
              disabled={!messageText.trim()}
              className="mt-3 w-full bg-white text-black font-semibold rounded-xl py-3 text-sm disabled:opacity-40"
            >
              送信
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
