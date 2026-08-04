'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { AdminRole } from '@/lib/mock-engagement-admin'

// ─── ナビゲーション定義 ────────────────────────────────────────────

const NAV_ITEMS = [
  {
    href: '/admin/engagement',
    label: 'ダッシュボード',
    exact: true,
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/challenges',
    label: 'チャレンジ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/trophies',
    label: 'トロフィー',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 0 1-2-2V5h4m12 4h2a2 2 0 0 0 2-2V5h-4" />
        <path d="M6 9v2a6 6 0 0 0 12 0V9" /><path d="M9 21h6M12 17v4" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/title-words',
    label: '称号ワード',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/lucky-draw',
    label: 'ラッキーくじ',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/rewards',
    label: '報酬管理',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6m16-4H4m0 0V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/grants',
    label: '付与履歴',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
]

const ROLE_LABELS: Record<AdminRole, string> = {
  headquarters: '本部管理者',
  store:        '店舗管理者',
  viewer:       '閲覧者',
}

// ─── サイドバー ────────────────────────────────────────────────────

function Sidebar({ role, onRoleChange, onClose }: {
  role: AdminRole
  onRoleChange: (r: AdminRole) => void
  onClose?: () => void
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-white w-60 flex-shrink-0">
      {/* ロゴ */}
      <div className="flex items-center justify-between px-5 h-14 border-b border-zinc-800">
        <div>
          <p className="text-xs font-black tracking-widest text-zinc-400 uppercase">JIS.bar</p>
          <p className="text-[10px] text-zinc-600">施策管理</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 text-zinc-500 hover:text-white lg:hidden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        )}
      </div>

      {/* ロール切り替え（デモ用） */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <p className="text-[10px] text-zinc-600 mb-1.5 uppercase tracking-wider">デモ: 権限切替</p>
        <select
          value={role}
          onChange={e => onRoleChange(e.target.value as AdminRole)}
          className="w-full text-xs bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-white"
        >
          <option value="headquarters">本部管理者</option>
          <option value="store">店舗管理者</option>
          <option value="viewer">閲覧者</option>
        </select>
      </div>

      {/* ナビ */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <p className="text-[10px] text-zinc-600 px-3 mb-2 uppercase tracking-wider">会員継続施策</p>
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm transition-colors ${
                active
                  ? 'bg-white text-black font-semibold'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span className={active ? 'text-black' : 'text-zinc-500'}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* フッター */}
      <div className="px-4 py-3 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold">
            {role === 'headquarters' ? '本' : role === 'store' ? '店' : '閲'}
          </div>
          <div>
            <p className="text-xs font-semibold text-white">{ROLE_LABELS[role]}</p>
            <p className="text-[10px] text-zinc-600">デモユーザー</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-[10px] text-zinc-600">モックモード</span>
        </div>
      </div>
    </div>
  )
}

// ─── メインレイアウト ──────────────────────────────────────────────

export default function EngagementAdminLayout({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<AdminRole>('headquarters')
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* サイドバー（デスクトップ） */}
      <div className="hidden lg:flex">
        <Sidebar role={role} onRoleChange={setRole} />
      </div>

      {/* ドロワー（モバイル） */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setDrawerOpen(false)} />
          <div className="relative z-10 h-full">
            <Sidebar role={role} onRoleChange={setRole} onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

      {/* コンテンツ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* トップバー（モバイル） */}
        <header className="lg:hidden sticky top-0 z-40 bg-white border-b border-zinc-200 flex items-center px-4 h-14 gap-3">
          <button onClick={() => setDrawerOpen(true)} className="p-1.5 rounded-lg hover:bg-zinc-100">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#18181b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <p className="text-sm font-bold text-zinc-800">JIS.bar 施策管理</p>
          <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">{ROLE_LABELS[role]}</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
