'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const AVATAR_COLORS = [
  'bg-rose-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-blue-500', 'bg-violet-500', 'bg-pink-500',
]
function avatarColor(name: string) {
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

type Conversation = {
  userId: string
  nickname: string
  lastMessage: string
  createdAt: string
  unread: number
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadConversations() }, [])

  async function loadConversations() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: msgs } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, content, read, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })

    if (!msgs || msgs.length === 0) { setLoading(false); return }

    // 会話相手ごとに最新メッセージをまとめる
    const seen = new Set<string>()
    const threads: { otherId: string; lastMessage: string; createdAt: string; unread: number }[] = []
    for (const m of msgs) {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id
      if (seen.has(otherId)) continue
      seen.add(otherId)
      const unread = msgs.filter(x => x.sender_id === otherId && x.receiver_id === user.id && !x.read).length
      threads.push({ otherId, lastMessage: m.content, createdAt: m.created_at, unread })
    }

    const otherIds = threads.map(t => t.otherId)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, nickname')
      .in('id', otherIds)

    const profileMap: Record<string, string> = {}
    for (const p of (profiles ?? [])) profileMap[p.id] = p.nickname

    setConversations(threads.map(t => ({
      userId: t.otherId,
      nickname: profileMap[t.otherId] ?? 'ユーザー',
      lastMessage: t.lastMessage,
      createdAt: t.createdAt,
      unread: t.unread,
    })))
    setLoading(false)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold">メッセージ</h1>
      </header>

      <div className="flex-1 overflow-y-auto pb-16">
        {loading && <p className="text-center text-zinc-500 mt-16">読み込み中...</p>}
        {!loading && conversations.length === 0 && (
          <p className="text-center text-zinc-500 mt-16">メッセージはありません。</p>
        )}
        {conversations.map((c) => (
          <Link
            key={c.userId}
            href={`/messages/${c.userId}`}
            className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            <div className={`w-12 h-12 rounded-full ${avatarColor(c.nickname)} flex items-center justify-center text-base font-bold flex-shrink-0 text-white`}>
              {c.nickname[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <span className="font-semibold text-sm">{c.nickname}</span>
                <span className="text-xs text-zinc-500">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm text-zinc-400 truncate">{c.lastMessage}</p>
            </div>
            {c.unread > 0 && (
              <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0 text-white">
                {c.unread}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
