'use client'

import { useState } from 'react'
import {
  MOCK_ADMIN_TITLE_WORDS,
  RARITY_LABEL,
  RARITY_COLOR,
  type Rarity,
  type TitleAcquireMethod,
} from '@/lib/mock-engagement-admin'

type StatusFilter = 'all' | 'active' | 'inactive'
type RarityFilter = 'all' | Rarity
type MethodFilter = 'all' | TitleAcquireMethod

const METHOD_LABEL: Record<TitleAcquireMethod, string> = {
  challenge:   'チャレンジ',
  jileage:     'Jレージ交換',
  lucky_draw:  'ラッキーくじ',
  auto:        '自動',
  manual:      '手動',
}

const METHOD_COLOR: Record<TitleAcquireMethod, string> = {
  challenge:  'bg-blue-50 text-blue-700',
  jileage:    'bg-amber-50 text-amber-700',
  lucky_draw: 'bg-purple-50 text-purple-700',
  auto:       'bg-zinc-100 text-zinc-600',
  manual:     'bg-emerald-50 text-emerald-700',
}

export default function TitleWordsPage() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [methodFilter, setMethodFilter] = useState<MethodFilter>('all')
  const [toggled, setToggled] = useState<Record<string, boolean>>({})

  const filtered = MOCK_ADMIN_TITLE_WORDS.filter((w) => {
    const active = toggled[w.id] !== undefined ? toggled[w.id] : w.isActive
    if (statusFilter === 'active' && !active) return false
    if (statusFilter === 'inactive' && active) return false
    if (rarityFilter !== 'all' && w.rarity !== rarityFilter) return false
    if (methodFilter !== 'all' && w.acquireMethod !== methodFilter) return false
    return true
  })

  function handleToggle(id: string, currentActive: boolean) {
    const next = !currentActive
    setToggled((prev) => ({ ...prev, [id]: next }))
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-800">称号ワード管理</h1>
        <button className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
          新規作成
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-4">
        {/* Status */}
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

        {/* Rarity */}
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

        {/* Method */}
        <div className="flex items-center gap-1">
          {(['all', 'challenge', 'jileage', 'lucky_draw', 'auto'] as (MethodFilter)[]).map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                methodFilter === m
                  ? 'bg-zinc-900 text-white'
                  : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
              }`}
            >
              {m === 'all' ? 'すべて' : METHOD_LABEL[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
              <th className="px-4 py-3 font-medium">表示名</th>
              <th className="px-4 py-3 font-medium">取得方法</th>
              <th className="px-4 py-3 font-medium">Jレージ交換</th>
              <th className="px-4 py-3 font-medium">くじ景品</th>
              <th className="px-4 py-3 font-medium">レア度</th>
              <th className="px-4 py-3 font-medium">取得者数</th>
              <th className="px-4 py-3 font-medium">状態</th>
              <th className="px-4 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-zinc-400">
                  該当する称号ワードがありません
                </td>
              </tr>
            ) : (
              filtered.map((word, i) => {
                const isActive = toggled[word.id] !== undefined ? toggled[word.id] : word.isActive
                return (
                  <tr
                    key={word.id}
                    className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${
                      i === filtered.length - 1 ? 'border-b-0' : ''
                    }`}
                  >
                    {/* 表示名 */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-zinc-800">{word.displayName}</p>
                      <p className="text-xs text-zinc-400">{word.description}</p>
                    </td>

                    {/* 取得方法 */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${METHOD_COLOR[word.acquireMethod]}`}
                      >
                        {METHOD_LABEL[word.acquireMethod]}
                      </span>
                    </td>

                    {/* Jレージ交換 */}
                    <td className="px-4 py-3 text-sm">
                      {word.isJileageExchange ? (
                        <span className="text-amber-700">✓ {word.jileageCost} pt</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>

                    {/* くじ景品 */}
                    <td className="px-4 py-3 text-sm">
                      {word.isLuckyDrawPrize ? (
                        <span className="text-purple-600">✓</span>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>

                    {/* レア度 */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RARITY_COLOR[word.rarity]}`}
                      >
                        {RARITY_LABEL[word.rarity]}
                      </span>
                    </td>

                    {/* 取得者数 */}
                    <td className="px-4 py-3 text-sm text-zinc-700">
                      {word.earnedCount.toLocaleString()} 人
                    </td>

                    {/* 状態 */}
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-zinc-100 text-zinc-500'
                        }`}
                      >
                        {isActive ? '有効' : '無効'}
                      </span>
                    </td>

                    {/* 操作 */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
                          編集
                        </button>
                        <button
                          onClick={() => handleToggle(word.id, isActive)}
                          className={`text-xs underline underline-offset-2 ${
                            isActive
                              ? 'text-zinc-400 hover:text-zinc-700'
                              : 'text-emerald-600 hover:text-emerald-800'
                          }`}
                        >
                          {isActive ? '無効化' : '有効化'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-right text-xs text-zinc-400">{filtered.length} 件</p>
    </div>
  )
}
