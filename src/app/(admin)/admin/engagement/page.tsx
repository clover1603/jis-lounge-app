'use client'

import Link from 'next/link'
import {
  MOCK_DASHBOARD_STATS,
  MOCK_ADMIN_GRANTS,
  GRANT_STATUS_LABEL,
  GRANT_STATUS_COLOR,
} from '@/lib/mock-engagement-admin'

// ─── クイックリンク定義 ─────────────────────────────────────────────

const QUICK_LINKS = [
  {
    href: '/admin/engagement/challenges',
    label: 'チャレンジ',
    description: '達成条件と報酬の管理',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/trophies',
    label: 'トロフィー',
    description: 'バッジ・トロフィーの管理',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4a2 2 0 0 1-2-2V5h4m12 4h2a2 2 0 0 0 2-2V5h-4" />
        <path d="M6 9v2a6 6 0 0 0 12 0V9" /><path d="M9 21h6M12 17v4" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/lucky-draw',
    label: 'ラッキーくじ',
    description: 'くじ景品と確率の管理',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  {
    href: '/admin/engagement/grants',
    label: '付与履歴',
    description: '報酬付与ログの確認',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
]

// ─── ステータスカード定義 ───────────────────────────────────────────

const s = MOCK_DASHBOARD_STATS

const STAT_CARDS = [
  {
    label: '公開中チャレンジ',
    value: s.activeChallenges,
    className: 'bg-white border border-zinc-200',
    labelClass: 'text-zinc-500',
    valueClass: 'text-zinc-800',
  },
  {
    label: '開催中くじ',
    value: s.activeDraws,
    className: 'bg-white border border-zinc-200',
    labelClass: 'text-zinc-500',
    valueClass: 'text-zinc-800',
  },
  {
    label: '今月達成者',
    value: s.achieversThisMonth,
    className: 'bg-white border border-zinc-200',
    labelClass: 'text-zinc-500',
    valueClass: 'text-zinc-800',
  },
  {
    label: '抽選実行数',
    value: s.drawsExecuted,
    className: 'bg-white border border-zinc-200',
    labelClass: 'text-zinc-500',
    valueClass: 'text-zinc-800',
  },
  {
    label: 'Jレージ交換',
    value: s.jileageExchanges,
    className: 'bg-white border border-zinc-200',
    labelClass: 'text-zinc-500',
    valueClass: 'text-zinc-800',
  },
  {
    label: '期限間近',
    value: s.nearExpiry,
    className: 'bg-amber-50 border border-amber-200',
    labelClass: 'text-amber-700',
    valueClass: 'text-amber-700',
  },
  {
    label: '付与エラー',
    value: s.grantErrors,
    className: s.grantErrors > 0 ? 'bg-red-50 border border-red-200' : 'bg-emerald-50 border border-emerald-200',
    labelClass: s.grantErrors > 0 ? 'text-red-600' : 'text-emerald-700',
    valueClass: s.grantErrors > 0 ? 'text-red-700' : 'text-emerald-700',
  },
]

// ─── ページ ────────────────────────────────────────────────────────

export default function EngagementDashboardPage() {
  const recentGrants = MOCK_ADMIN_GRANTS.slice(0, 5)

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* ページヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-zinc-800">ダッシュボード</h1>
        <p className="text-sm text-zinc-500 mt-0.5">会員継続施策の運用状況</p>
      </div>

      {/* ── 統計カード ── */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {STAT_CARDS.map((card) => (
            <div key={card.label} className={`rounded-xl p-4 shadow-sm ${card.className}`}>
              <p className={`text-xs font-medium mb-1 ${card.labelClass}`}>{card.label}</p>
              <p className={`text-3xl font-black leading-none ${card.valueClass}`}>{card.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── クイックリンク ── */}
      <section>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-3">クイックリンク</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 bg-white rounded-xl border border-zinc-200 shadow-sm px-4 py-3.5 hover:border-zinc-300 hover:shadow transition-all group"
            >
              <span className="text-zinc-400 group-hover:text-zinc-600 transition-colors flex-shrink-0">
                {link.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-800">{link.label}</p>
                <p className="text-xs text-zinc-400 truncate">{link.description}</p>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 最近の付与 ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">最近の付与</h2>
          <Link href="/admin/engagement/grants" className="text-xs text-zinc-500 hover:text-zinc-800 underline-offset-2 hover:underline">
            すべて見る →
          </Link>
        </div>

        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-zinc-50 border-b border-zinc-200">
                  <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5">ユーザー</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5">報酬</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5 hidden md:table-cell">理由</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5">日時</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-2.5">ステータス</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {recentGrants.map((grant) => (
                  <tr key={grant.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-800 whitespace-nowrap">{grant.userNickname}</td>
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap">{grant.rewardDetail}</td>
                    <td className="px-4 py-3 text-zinc-400 text-xs max-w-xs truncate hidden md:table-cell">{grant.grantReason}</td>
                    <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">{grant.grantedAt}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${GRANT_STATUS_COLOR[grant.status]}`}>
                        {GRANT_STATUS_LABEL[grant.status]}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

    </div>
  )
}
