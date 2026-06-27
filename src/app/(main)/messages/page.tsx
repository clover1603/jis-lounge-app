'use client'

import Link from 'next/link'
import { mockMessages } from '@/lib/mock-data'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'たった今'
  if (m < 60) return `${m}分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}時間前`
  return `${Math.floor(h / 24)}日前`
}

export default function MessagesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <h1 className="text-lg font-bold">メッセージ</h1>
        <button className="p-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        {mockMessages.length === 0 ? (
          <p className="text-center text-zinc-500 mt-16">メッセージはありません。</p>
        ) : (
          mockMessages.map((msg) => (
            <Link
              key={msg.id}
              href={`/messages/${msg.userId}`}
              className="flex items-center gap-3 px-4 py-4 border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
            >
              <div className="w-12 h-12 rounded-full bg-zinc-700 flex items-center justify-center text-base font-bold flex-shrink-0">
                {msg.nickname[0]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-semibold text-sm">{msg.nickname}</span>
                  <span className="text-xs text-zinc-500">{timeAgo(msg.createdAt)}</span>
                </div>
                <p className="text-sm text-zinc-400 truncate">{msg.lastMessage}</p>
              </div>
              {msg.unread > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                  {msg.unread}
                </span>
              )}
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
