'use client'

import { useState } from 'react'
import {
  MOCK_ADMIN_TROPHIES,
  RARITY_LABEL,
  RARITY_COLOR,
  type Rarity,
} from '@/lib/mock-engagement-admin'

type StatusFilter = 'all' | 'active' | 'inactive'
type RarityFilter = 'all' | Rarity

export default function TrophiesPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')

  const filtered = MOCK_ADMIN_TROPHIES.filter((t) => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false
    if (rarityFilter !== 'all' && t.rarity !== rarityFilter) return false
    return true
  })

  function handleManualGrant(title: string) {
    window.confirm(`「${title}」を手動付与しますか？（デモ）`)
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-800">トロフィー管理</h1>
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
          新規作成
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        {/* Status filter */}
        <div className="flex items-center gap-1">
          {(['all', 'active', 'inactive'] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                statusFilter === s
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {s === 'all' ? 'すべて' : s === 'active' ? '有効' : '無効'}
            </button>
          ))}
        </div>

        {/* Rarity filter */}
        <div className="flex items-center gap-1">
          {(['all', 'normal', 'rare', 'special'] as RarityFilter[]).map((r) => (
            <button
              key={r}
              onClick={() => setRarityFilter(r)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                rarityFilter === r
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {r === 'all' ? 'すべて' : RARITY_LABEL[r]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
              <th className="px-4 py-3 font-medium">名称・説明</th>
              <th className="px-4 py-3 font-medium">条件</th>
              <th className="px-4 py-3 font-medium">レア度</th>
              <th className="px-4 py-3 font-medium">手動付与</th>
              <th className="px-4 py-3 font-medium">取得者数</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-zinc-400">
                  該当するトロフィーがありません
                </td>
              </tr>
            ) : (
              filtered.map((trophy, i) => (
                <tr
                  key={trophy.id}
                  className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${
                    i === filtered.length - 1 ? 'border-b-0' : ''
                  }`}
                >
                  {/* 名称・説明 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-xs text-zinc-500">
                        [{trophy.iconKey}]
                      </span>
                      <div>
                        <p className="font-semibold text-zinc-800">{trophy.title}</p>
                        <p className="text-xs text-zinc-500">{trophy.description}</p>
                      </div>
                    </div>
                  </td>

                  {/* 条件 */}
                  <td className="px-4 py-3 text-sm text-zinc-600">{trophy.condition}</td>

                  {/* レア度 */}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RARITY_COLOR[trophy.rarity]}`}
                    >
                      {RARITY_LABEL[trophy.rarity]}
                    </span>
                  </td>

                  {/* 手動付与 */}
                  <td className="px-4 py-3 text-sm">
                    {trophy.manualGrantable ? (
                      <span className="text-emerald-600">✓</span>
                    ) : (
                      <span className="text-zinc-300">—</span>
                    )}
                  </td>

                  {/* 取得者数 */}
                  <td className="px-4 py-3 text-sm text-zinc-700">
                    {trophy.earnedCount.toLocaleString()} 人
                  </td>

                  {/* 状態 */}
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        trophy.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-zinc-100 text-zinc-500'
                      }`}
                    >
                      {trophy.status === 'active' ? '有効' : '無効'}
                    </span>
                  </td>

                  {/* 操作 */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
                        編集
                      </button>
                      {trophy.manualGrantable && (
                        <button
                          onClick={() => handleManualGrant(trophy.title)}
                          className="text-xs text-blue-600 hover:text-blue-800 underline underline-offset-2"
                        >
                          手動付与
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-right text-xs text-zinc-400">{filtered.length} 件</p>
    </div>
  )
}
