'use client'

import { useState, useMemo } from 'react'
import {
  MOCK_ADMIN_GRANTS,
  REWARD_CATEGORY_LABEL,
  GRANT_STATUS_LABEL,
  GRANT_STATUS_COLOR,
  type GrantStatus,
  type GrantMethod,
  type AdminGrant,
} from '@/lib/mock-engagement-admin'

// ─── トースト ────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-zinc-900 text-white text-sm rounded-xl px-4 py-3 shadow-lg">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      {message}
      <button onClick={onClose} className="ml-2 text-zinc-400 hover:text-white">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  )
}

// ─── 取消確認モーダル ────────────────────────────────────────────────

function CancelModal({
  grant,
  onCancel,
  onConfirm,
}: {
  grant: AdminGrant
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      {/* dialog */}
      <div className="relative bg-white rounded-2xl shadow-xl border border-zinc-200 w-full max-w-sm p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex-shrink-0 w-9 h-9 rounded-full bg-red-50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-bold text-zinc-800">付与を取り消しますか？</h2>
            <p className="text-sm text-zinc-500 mt-1">この操作は取り消せません。</p>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-lg px-4 py-3 text-sm space-y-1">
          <div className="flex gap-2">
            <span className="text-zinc-400 w-16 flex-shrink-0">ユーザー</span>
            <span className="font-semibold text-zinc-800">{grant.userNickname}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-400 w-16 flex-shrink-0">報酬</span>
            <span className="text-zinc-700">{grant.rewardDetail}</span>
          </div>
        </div>

        <div className="flex gap-3 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 border border-zinc-200 text-zinc-700 text-sm font-semibold py-2 rounded-lg hover:bg-zinc-50 transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            取り消す
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── フィルターPillボタン ─────────────────────────────────────────────

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-zinc-900 text-white border-zinc-900'
          : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
      }`}
    >
      {label}
    </button>
  )
}

// ─── ページ ────────────────────────────────────────────────────────

const STATUS_OPTIONS: { label: string; value: GrantStatus | 'all' }[] = [
  { label: 'すべて', value: 'all' },
  { label: '完了', value: 'completed' },
  { label: '取消済み', value: 'cancelled' },
  { label: 'エラー', value: 'error' },
]

const METHOD_OPTIONS: { label: string; value: GrantMethod | 'all' }[] = [
  { label: 'すべて', value: 'all' },
  { label: '自動', value: 'auto' },
  { label: '手動', value: 'manual' },
]

export default function GrantsPage() {
  const [statusFilter, setStatusFilter] = useState<GrantStatus | 'all'>('all')
  const [methodFilter, setMethodFilter] = useState<GrantMethod | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [cancelTarget, setCancelTarget] = useState<AdminGrant | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return MOCK_ADMIN_GRANTS.filter((g) => {
      if (statusFilter !== 'all' && g.status !== statusFilter) return false
      if (methodFilter !== 'all' && g.grantMethod !== methodFilter) return false
      if (searchQuery.trim() !== '' && !g.userNickname.toLowerCase().includes(searchQuery.toLowerCase())) return false
      return true
    })
  }, [statusFilter, methodFilter, searchQuery])

  const stats = useMemo(() => ({
    total: filtered.length,
    auto: filtered.filter((g) => g.grantMethod === 'auto').length,
    manual: filtered.filter((g) => g.grantMethod === 'manual').length,
  }), [filtered])

  function handleCancelConfirm() {
    setCancelTarget(null)
    setToast('取り消しました（デモ）')
    setTimeout(() => setToast(null), 3000)
  }

  function truncate(s: string, max = 30) {
    return s.length > max ? s.slice(0, max) + '…' : s
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ページヘッダー */}
      <div>
        <h1 className="text-xl font-bold text-zinc-800">付与履歴</h1>
        <p className="text-sm text-zinc-500 mt-0.5">自動・手動問わずすべての報酬付与記録</p>
      </div>

      {/* フィルター行 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* ステータス */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <PillButton
              key={opt.value}
              label={opt.label}
              active={statusFilter === opt.value}
              onClick={() => setStatusFilter(opt.value)}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-zinc-200 hidden sm:block" />

        {/* 方法 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {METHOD_OPTIONS.map((opt) => (
            <PillButton
              key={opt.value}
              label={opt.label}
              active={methodFilter === opt.value}
              onClick={() => setMethodFilter(opt.value)}
            />
          ))}
        </div>

        <div className="w-px h-5 bg-zinc-200 hidden sm:block" />

        {/* 検索 */}
        <div className="relative">
          <svg
            width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ユーザー名で検索"
            className="text-sm border border-zinc-200 rounded-lg pl-8 pr-3 py-1.5 text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300 w-44"
          />
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="flex items-center gap-6">
        {[
          { label: '総付与数', value: stats.total },
          { label: '自動付与', value: stats.auto },
          { label: '手動付与', value: stats.manual },
        ].map((stat) => (
          <div key={stat.label} className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-zinc-800">{stat.value}</span>
            <span className="text-xs text-zinc-400">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead className="sticky top-0 z-10">
            <tr className="bg-zinc-50 border-b border-zinc-200">
              {['ユーザー', '報酬内容', '付与理由', '方法', '操作者', '日時', 'ステータス', '操作'].map((col) => (
                <th key={col} className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-400">
                  該当する付与履歴がありません
                </td>
              </tr>
            ) : (
              filtered.map((grant) => (
                <tr key={grant.id} className="hover:bg-zinc-50 transition-colors">

                  {/* ユーザー */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <p className="font-semibold text-zinc-800">{grant.userNickname}</p>
                    <p className="text-[10px] text-zinc-400 mt-0.5">{grant.userId}</p>
                  </td>

                  {/* 報酬内容 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 mr-1.5">
                      {REWARD_CATEGORY_LABEL[grant.rewardCategory]}
                    </span>
                    <span className="text-sm text-zinc-700">{grant.rewardDetail}</span>
                  </td>

                  {/* 付与理由 */}
                  <td className="px-4 py-3 text-sm text-zinc-600 max-w-[200px]">
                    {truncate(grant.grantReason)}
                  </td>

                  {/* 方法 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {grant.grantMethod === 'auto' ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">自動</span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">手動</span>
                    )}
                  </td>

                  {/* 操作者 */}
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {grant.operatorName ? (
                      <span className="text-zinc-700">{grant.operatorName}</span>
                    ) : (
                      <span className="text-zinc-400">システム自動</span>
                    )}
                  </td>

                  {/* 日時 */}
                  <td className="px-4 py-3 whitespace-nowrap text-xs text-zinc-500">{grant.grantedAt}</td>

                  {/* ステータス */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${GRANT_STATUS_COLOR[grant.status]}`}>
                      {GRANT_STATUS_LABEL[grant.status]}
                    </span>
                  </td>

                  {/* 操作 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    {grant.status === 'completed' ? (
                      <button
                        onClick={() => setCancelTarget(grant)}
                        className="text-red-500 text-xs hover:text-red-700 hover:underline"
                      >
                        取消
                      </button>
                    ) : (
                      <span className="text-xs text-zinc-300">—</span>
                    )}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 取消確認モーダル */}
      {cancelTarget && (
        <CancelModal
          grant={cancelTarget}
          onCancel={() => setCancelTarget(null)}
          onConfirm={handleCancelConfirm}
        />
      )}

      {/* トースト */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

    </div>
  )
}
