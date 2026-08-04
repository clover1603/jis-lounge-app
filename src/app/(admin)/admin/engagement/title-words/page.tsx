'use client'
import { useState } from 'react'
import Link from 'next/link'
import {
  TITLE_WORDS, PREFIX_WORDS, SUFFIX_WORDS,
  RARITY_LABEL, RARITY_COLOR, METHOD_LABEL, METHOD_COLOR,
} from '@/lib/mock-title-words'
import type { TitleWord } from '@/lib/mock-title-words'

type AdminRole = 'headquarters' | 'store' | 'viewer'
type PositionFilter = 'all' | 'prefix' | 'suffix'
type SortKey = 'sortOrder' | 'earnedCount' | 'label'

export default function TitleWordsPage() {
  const [role, setRole] = useState<AdminRole>('headquarters')
  const [positionFilter, setPositionFilter] = useState<PositionFilter>('all')
  const [rarityFilter, setRarityFilter] = useState<'all' | TitleWord['rarity']>('all')
  const [methodFilter, setMethodFilter] = useState<'all' | TitleWord['acquisitionMethod']>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [toggled, setToggled] = useState<Record<string, boolean>>({})
  const [sortKey, setSortKey] = useState<SortKey>('sortOrder')

  const filtered = TITLE_WORDS
    .filter(w => positionFilter === 'all' || w.position === positionFilter)
    .filter(w => rarityFilter === 'all' || w.rarity === rarityFilter)
    .filter(w => methodFilter === 'all' || w.acquisitionMethod === methodFilter)
    .filter(w => searchQuery === '' || w.label.includes(searchQuery) || w.description.includes(searchQuery))
    .sort((a, b) => {
      if (sortKey === 'sortOrder') {
        if (a.position !== b.position) return a.position === 'prefix' ? -1 : 1
        return a.sortOrder - b.sortOrder
      }
      if (sortKey === 'earnedCount') return b.earnedCount - a.earnedCount
      return a.label.localeCompare(b.label, 'ja')
    })

  function handleToggle(id: string, currentActive: boolean) {
    setToggled(prev => ({ ...prev, [id]: !currentActive }))
  }

  function pill(active: boolean) {
    return active
      ? 'bg-zinc-900 text-white rounded-full px-3 py-1 text-xs font-medium transition-colors'
      : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100 rounded-full px-3 py-1 text-xs font-medium transition-colors'
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">称号ワード管理</h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            最初のことば {PREFIX_WORDS.length}件 · 次のことば {SUFFIX_WORDS.length}件
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
            className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white text-zinc-600"
          >
            <option value="headquarters">本部管理者（デモ）</option>
            <option value="store">店舗管理者（デモ）</option>
            <option value="viewer">閲覧者（デモ）</option>
          </select>
          {role === 'headquarters' && (
            <Link
              href="/admin/engagement/title-words/new"
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
            >
              新規作成
            </Link>
          )}
        </div>
      </div>

      {/* Permission banner */}
      {role !== 'headquarters' && (
        <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-xl px-4 py-3 mb-4">
          称号ワードの作成・編集は本部管理者のみ可能です。
        </div>
      )}

      {/* Filter bar */}
      <div className="mb-4 flex flex-wrap gap-3">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="ワード・説明を検索"
          className="text-xs border border-zinc-200 rounded-lg px-3 py-1.5 w-44 bg-white focus:outline-none focus:border-zinc-400"
        />

        {/* Position */}
        <div className="flex items-center gap-1">
          {(['all', 'prefix', 'suffix'] as PositionFilter[]).map(p => (
            <button key={p} onClick={() => setPositionFilter(p)} className={pill(positionFilter === p)}>
              {p === 'all' ? 'すべて' : p === 'prefix' ? '最初のことば' : '次のことば'}
            </button>
          ))}
        </div>

        {/* Rarity */}
        <div className="flex items-center gap-1">
          {(['all', 'standard', 'rare', 'special'] as ('all' | TitleWord['rarity'])[]).map(r => (
            <button key={r} onClick={() => setRarityFilter(r)} className={pill(rarityFilter === r)}>
              {r === 'all' ? 'すべて' : RARITY_LABEL[r]}
            </button>
          ))}
        </div>

        {/* Method */}
        <div className="flex items-center gap-1">
          {(['all', 'initial', 'challenge', 'jileage', 'lucky_draw', 'rank'] as ('all' | TitleWord['acquisitionMethod'])[]).map(m => (
            <button key={m} onClick={() => setMethodFilter(m)} className={pill(methodFilter === m)}>
              {m === 'all' ? 'すべて' : METHOD_LABEL[m]}
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortKey}
          onChange={e => setSortKey(e.target.value as SortKey)}
          className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white text-zinc-600"
        >
          <option value="sortOrder">表示順</option>
          <option value="earnedCount">取得者数</option>
          <option value="label">ワード名</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50 text-left text-xs text-zinc-500">
                <th className="px-4 py-3 font-medium">ワード</th>
                <th className="px-4 py-3 font-medium">種別</th>
                <th className="px-4 py-3 font-medium">言語</th>
                <th className="px-4 py-3 font-medium">レア度</th>
                <th className="px-4 py-3 font-medium">取得方法</th>
                <th className="px-4 py-3 font-medium">Jレ交換</th>
                <th className="px-4 py-3 font-medium">くじ</th>
                <th className="px-4 py-3 font-medium">取得者数</th>
                <th className="px-4 py-3 font-medium">状態</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-zinc-400">
                    該当する称号ワードがありません
                  </td>
                </tr>
              ) : (
                filtered.map((w, i) => {
                  const isActive = toggled[w.id] !== undefined
                    ? toggled[w.id]
                    : w.status === 'published'
                  const methodShort: Record<TitleWord['acquisitionMethod'], string> = {
                    initial: '初期',
                    challenge: 'CH',
                    jileage: 'J交換',
                    lucky_draw: 'くじ',
                    rank: 'ランク',
                  }
                  return (
                    <tr
                      key={w.id}
                      className={`border-b border-zinc-50 hover:bg-zinc-50 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                    >
                      {/* ワード */}
                      <td className="px-4 py-3">
                        <p className="font-semibold text-zinc-800">{w.label}</p>
                        <p className="text-xs text-zinc-400">{w.description}</p>
                      </td>

                      {/* 種別 */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${w.position === 'prefix' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'}`}>
                          {w.position === 'prefix' ? '最初' : '次'}
                        </span>
                      </td>

                      {/* 言語 */}
                      <td className="px-4 py-3 text-xs text-zinc-500">
                        {w.language === 'ja' ? '日本語' : '英語'}
                      </td>

                      {/* レア度 */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${RARITY_COLOR[w.rarity]}`}>
                          {RARITY_LABEL[w.rarity]}
                        </span>
                      </td>

                      {/* 取得方法 */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${METHOD_COLOR[w.acquisitionMethod]}`}>
                          {methodShort[w.acquisitionMethod]}
                        </span>
                      </td>

                      {/* Jレ交換 */}
                      <td className="px-4 py-3 text-sm">
                        {w.isJileageExchange
                          ? <span className="text-amber-700">✓ {w.jileageCost}pt</span>
                          : <span className="text-zinc-300">—</span>
                        }
                      </td>

                      {/* くじ */}
                      <td className="px-4 py-3 text-sm">
                        {w.isLuckyDrawPrize
                          ? <span className="text-purple-600">✓</span>
                          : <span className="text-zinc-300">—</span>
                        }
                      </td>

                      {/* 取得者数 */}
                      <td className="px-4 py-3 text-sm text-zinc-700">
                        {w.earnedCount.toLocaleString()} 人
                      </td>

                      {/* 状態 */}
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-zinc-100 text-zinc-500'}`}>
                          {isActive ? '有効' : '無効'}
                        </span>
                      </td>

                      {/* 操作 */}
                      <td className="px-4 py-3">
                        {role === 'headquarters' ? (
                          <div className="flex items-center gap-2">
                            <button className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
                              編集
                            </button>
                            <button
                              onClick={() => handleToggle(w.id, isActive)}
                              className={`text-xs underline underline-offset-2 ${isActive ? 'text-zinc-400 hover:text-zinc-700' : 'text-emerald-600 hover:text-emerald-800'}`}
                            >
                              {isActive ? '無効化' : '有効化'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-3 text-right text-xs text-zinc-400">{filtered.length} 件</p>
    </div>
  )
}
