'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  {
    href: '/board',
    label: '掲示板',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#71717a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'メッセージ',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#71717a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: '/stores',
    label: '店内人数',
    isCenter: true,
    icon: (_active: boolean) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/checkin',
    label: 'チェックイン',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#71717a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="5" height="5" />
        <rect x="16" y="3" width="5" height="5" />
        <rect x="3" y="16" width="5" height="5" />
        <line x1="16" y1="16" x2="16" y2="21" />
        <line x1="21" y1="16" x2="21" y2="21" />
        <line x1="16" y1="16" x2="21" y2="16" />
        <line x1="10" y1="3" x2="10" y2="8" />
        <line x1="10" y1="13" x2="10" y2="18" />
        <line x1="3" y1="11" x2="21" y2="11" />
      </svg>
    ),
  },
  {
    href: '/mypage',
    label: 'マイページ',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#fff' : '#71717a'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-900 border-t border-zinc-800 max-w-[430px] mx-auto w-full" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex items-center justify-around h-16">
      {tabs.map((tab) => {
        const active = pathname.startsWith(tab.href)
        if (tab.isCenter) {
          return (
            <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-0.5 -mt-4">
              <span className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-lg">
                {tab.icon(active)}
              </span>
              <span className="text-[10px] text-white mt-0.5">{tab.label}</span>
            </Link>
          )
        }
        return (
          <Link key={tab.href} href={tab.href} className="flex flex-col items-center gap-1 flex-1">
            {tab.icon(active)}
            <span className={`text-[10px] ${active ? 'text-white' : 'text-zinc-500'}`}>{tab.label}</span>
          </Link>
        )
      })}
      </div>
    </nav>
  )
}
