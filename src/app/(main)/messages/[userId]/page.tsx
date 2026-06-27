'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

type Message = { id: string; sender_id: string; content: string; created_at: string }

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const otherId = params.userId as string

  const [messages, setMessages] = useState<Message[]>([])
  const [otherNickname, setOtherNickname] = useState('ユーザー')
  const [myId, setMyId] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { init() }, [otherId])

  async function init() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setMyId(user.id)

    const { data: profile } = await supabase
      .from('profiles')
      .select('nickname')
      .eq('id', otherId)
      .single()
    if (profile) setOtherNickname(profile.nickname)

    await fetchMessages(user.id, supabase)

    // 未読を既読に
    await supabase
      .from('messages')
      .update({ read: true })
      .eq('sender_id', otherId)
      .eq('receiver_id', user.id)
      .eq('read', false)
  }

  async function fetchMessages(userId: string, supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true })
    setMessages(data ?? [])
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  async function send() {
    if (!input.trim() || sending || !myId) return
    setSending(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: myId, receiver_id: otherId, content: input.trim() })
      .select()
      .single()
    if (data) setMessages(prev => [...prev, data])
    setInput('')
    setSending(false)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-bold">
            {otherNickname[0]}
          </div>
          <span className="font-semibold text-sm">{otherNickname}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 pb-20">
        {messages.map((msg) => {
          const isMe = msg.sender_id === myId
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 self-end">
                  {otherNickname[0]}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-zinc-800 text-white rounded-bl-sm'}`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-600 mt-1">{formatTime(msg.created_at)}</span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 border-t border-zinc-800 bg-black px-4 py-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="メッセージを入力..."
          className="flex-1 bg-zinc-900 text-white rounded-full px-4 py-2.5 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
        />
        <button
          onClick={send}
          disabled={!input.trim() || sending}
          className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 disabled:opacity-40"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
