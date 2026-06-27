'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { mockMessages, mockChatMessages } from '@/lib/mock-data'
import { ChatMessage } from '@/lib/types'

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function ChatPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const thread = mockMessages.find((m) => m.userId === userId)
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
  const [input, setInput] = useState('')

  function send() {
    if (!input.trim()) return
    const newMsg: ChatMessage = {
      id: `c${Date.now()}`,
      senderId: 'me',
      content: input.trim(),
      createdAt: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, newMsg])
    setInput('')
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
            {thread?.nickname[0] ?? '?'}
          </div>
          <span className="font-semibold text-sm">{thread?.nickname ?? 'ユーザー'}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === 'me'
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0 self-end">
                  {thread?.nickname[0] ?? '?'}
                </div>
              )}
              <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-zinc-800 text-white rounded-bl-sm'}`}>
                  {msg.content}
                </div>
                <span className="text-[10px] text-zinc-600 mt-1">{formatTime(msg.createdAt)}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="border-t border-zinc-800 bg-black px-4 py-3 pb-safe flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder="メッセージを入力..."
          className="flex-1 bg-zinc-900 text-white rounded-full px-4 py-2.5 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
        />
        <button onClick={send} className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
    </div>
  )
}
