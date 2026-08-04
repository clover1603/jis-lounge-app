'use client'

import { useState, useMemo } from 'react'
import { PROFILE_FRAMES, FRAME_RARITY_LABEL, FRAME_RARITY_COLOR } from '@/lib/mock-lucky-draw'
import type { FrameRarity } from '@/lib/mock-lucky-draw'

// ─── 定数 ────────────────────────────────────────────────────────

type Role = '本部管理者' | '店舗管理者' | '閲覧者'

const MOCK_HOLDERS: number[] = [247, 189, 156, 203, 98, 167, 134, 201, 178, 145, 87, 34, 29, 42, 67, 23, 18, 25, 31, 4]

const RARITY_FILTER_OPTIONS: { value: 'all' | FrameRarity; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'standard', label: 'スタンダード' },
  { value: 'rare', label: 'レア' },
  { value: 'legend', label: 'レジェンド' },
]

// レジェンドフレームは初期非公開
const INITIAL_HIDDEN = new Set(['frame_legend_gold'])

// ─── コンポーネント ───────────────────────────────────────────────

export default function FrameManagementPage() {
  const [role, setRole] = useState<Role>('本部管理者')
  const [rarityFilter, setRarityFilter] = useState<'all' | FrameRarity>('all')
  const [search, setSearch] = useState('')
  const [publicMap, setPublicMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {}
    for (const f of PROFILE_FRAMES) {
      map[f.id] = !INITIAL_HIDDEN.has(f.id)
    }
    return map
  })

  const isHQ = role === '本部管理者'

  const filteredFrames = useMemo(() => {
    return PROFILE_FRAMES.filter(f => {
      if (rarityFilter !== 'all' && f.rarity !== rarityFilter) return false
      if (search.trim() && !f.label.includes(search.trim()) && !f.description.includes(search.trim())) return false
      return true
    })
  }, [rarityFilter, search])

  // 統計
  const totalFrames = PROFILE_FRAMES.length
  const rarePlusCount = PROFILE_FRAMES.filter(f => f.rarity === 'rare' || f.rarity === 'legend').length
  const legendCount = PROFILE_FRAMES.filter(f => f.rarity === 'legend').length
  const totalHolders = MOCK_HOLDERS.reduce((a, b) => a + b, 0)

  function togglePublic(id: string) {
    if (!isHQ) return
    setPublicMap(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-zinc-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-xl font-bold text-zinc-800">フレーム管理</h1>
            <p className="text-sm text-zinc-500 mt-0.5">プロフィールフレームの公開状態・保有状況を管理します</p>
          </div>

          {/* ロール切替 */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium">表示ロール:</span>
            <div className="flex rounded-lg border border-zinc-200 overflow-hidden bg-zinc-50">
              {(['本部管理者', '店舗管理者', '閲覧者'] as Role[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={[
                    'px-3 py-1.5 text-xs font-medium transition-colors',
                    role === r
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-600 hover:bg-zinc-100',
                  ].join(' ')}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">

        {/* 権限バナー */}
        {!isHQ && (
          <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {role === '店舗管理者' ? '店舗管理者' : '閲覧者'}権限でログイン中
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                フレームの公開/非公開切替は本部管理者のみ操作できます。現在は閲覧のみです。
              </p>
            </div>
          </div>
        )}

        {/* 統計カード */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="総フレーム数" value={`${totalFrames}`} unit="種" accent="zinc" />
          <StatCard label="レア以上" value={`${rarePlusCount}`} unit="種" accent="blue" />
          <StatCard label="レジェンド" value={`${legendCount}`} unit="種" accent="amber" />
          <StatCard label="総保有者数" value={totalHolders.toLocaleString()} unit="名" accent="green" />
        </div>

        {/* フィルターバー */}
        <div className="bg-white rounded-xl border border-zinc-200 px-4 py-3 flex flex-wrap gap-3 items-center">
          {/* レアリティフィルター */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {RARITY_FILTER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setRarityFilter(opt.value)}
                className={[
                  'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                  rarityFilter === opt.value
                    ? 'bg-zinc-800 text-white border-zinc-800'
                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* 区切り */}
          <div className="hidden sm:block w-px h-5 bg-zinc-200" />

          {/* 検索 */}
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="フレーム名・説明で検索"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
          </div>

          <span className="text-xs text-zinc-400 ml-auto whitespace-nowrap">
            {filteredFrames.length} / {totalFrames} 件表示
          </span>
        </div>

        {/* フレームテーブル */}
        <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
          {/* テーブルヘッダー (デスクトップ) */}
          <div className="hidden sm:grid grid-cols-[56px_1fr_120px_100px_100px_96px] gap-4 px-5 py-3 border-b border-zinc-100 bg-zinc-50">
            <span className="text-xs font-semibold text-zinc-500">プレビュー</span>
            <span className="text-xs font-semibold text-zinc-500">フレーム</span>
            <span className="text-xs font-semibold text-zinc-500">レアリティ</span>
            <span className="text-xs font-semibold text-zinc-500 text-right">所持会員数</span>
            <span className="text-xs font-semibold text-zinc-500 text-center">状態</span>
            <span className="text-xs font-semibold text-zinc-500 text-center">操作</span>
          </div>

          {filteredFrames.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 text-sm">該当するフレームがありません</div>
          ) : (
            <ul className="divide-y divide-zinc-100">
              {filteredFrames.map((frame, idx) => {
                const holderIdx = PROFILE_FRAMES.findIndex(f => f.id === frame.id)
                const holders = MOCK_HOLDERS[holderIdx] ?? 0
                const isPublic = publicMap[frame.id] ?? true
                const isLegend = frame.rarity === 'legend'
                const globalIdx = holderIdx

                return (
                  <li
                    key={frame.id}
                    className={[
                      'group transition-colors hover:bg-zinc-50',
                      isLegend ? 'bg-amber-50/40 hover:bg-amber-50/70' : '',
                    ].join(' ')}
                  >
                    {/* モバイルレイアウト */}
                    <div className="sm:hidden px-4 py-4 flex gap-3 items-start">
                      <FrameCircle gradient={frame.cssGradient} isLegend={isLegend} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-zinc-800 text-sm">{frame.label}</span>
                          <RarityBadge rarity={frame.rarity} />
                          {isLegend && <LegendStar />}
                        </div>
                        <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{frame.description}</p>
                        <div className="flex items-center justify-between mt-2 gap-2">
                          <span className="text-xs text-zinc-500">所持 <strong className="text-zinc-800">{holders.toLocaleString()}</strong> 名</span>
                          <div className="flex items-center gap-2">
                            <StatusPill isPublic={isPublic} />
                            {isHQ && (
                              <ToggleButton isPublic={isPublic} onClick={() => togglePublic(frame.id)} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* デスクトップレイアウト */}
                    <div className="hidden sm:grid grid-cols-[56px_1fr_120px_100px_100px_96px] gap-4 px-5 py-3.5 items-center">
                      {/* プレビュー */}
                      <div>
                        <FrameCircle gradient={frame.cssGradient} isLegend={isLegend} />
                      </div>

                      {/* ラベル・説明 */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-zinc-800 text-sm">{frame.label}</span>
                          {isLegend && <LegendStar />}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 truncate">{frame.description}</p>
                      </div>

                      {/* レアリティ */}
                      <div>
                        <RarityBadge rarity={frame.rarity} />
                      </div>

                      {/* 所持会員数 */}
                      <div className="text-right">
                        <span className="text-sm font-semibold text-zinc-700">{holders.toLocaleString()}</span>
                        <span className="text-xs text-zinc-400 ml-1">名</span>
                      </div>

                      {/* 状態 */}
                      <div className="flex justify-center">
                        <StatusPill isPublic={isPublic} />
                      </div>

                      {/* 操作 */}
                      <div className="flex justify-center">
                        {isHQ ? (
                          <ToggleButton isPublic={isPublic} onClick={() => togglePublic(frame.id)} />
                        ) : (
                          <span className="text-xs text-zinc-300">—</span>
                        )}
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* フッター注記 */}
        <p className="text-xs text-zinc-400 text-center pb-4">
          ※ 所持会員数はモックデータです。本番環境では実データが反映されます。
        </p>
      </div>
    </div>
  )
}

// ─── サブコンポーネント ───────────────────────────────────────────

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: string
  unit: string
  accent: 'zinc' | 'blue' | 'amber' | 'green'
}) {
  const accentMap: Record<string, string> = {
    zinc: 'text-zinc-800',
    blue: 'text-blue-700',
    amber: 'text-amber-600',
    green: 'text-emerald-600',
  }
  return (
    <div className="bg-white rounded-xl border border-zinc-200 px-4 py-4">
      <p className="text-xs text-zinc-500 font-medium">{label}</p>
      <div className="mt-1 flex items-baseline gap-1">
        <span className={`text-2xl font-bold ${accentMap[accent]}`}>{value}</span>
        <span className="text-xs text-zinc-400">{unit}</span>
      </div>
    </div>
  )
}

function FrameCircle({ gradient, isLegend }: { gradient: string; isLegend: boolean }) {
  return (
    <div
      className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center"
      style={{
        background: gradient,
        boxShadow: isLegend ? '0 0 0 2px #fbbf24, 0 0 8px rgba(251,191,36,0.5)' : '0 0 0 2px rgba(0,0,0,0.06)',
      }}
    >
      <div className="w-7 h-7 rounded-full bg-white/90" />
    </div>
  )
}

function RarityBadge({ rarity }: { rarity: FrameRarity }) {
  const colorMap: Record<FrameRarity, string> = {
    standard: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    rare: 'bg-blue-50 text-blue-700 border-blue-100',
    legend: 'bg-amber-50 text-amber-700 border-amber-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${colorMap[rarity]}`}>
      {FRAME_RARITY_LABEL[rarity]}
    </span>
  )
}

function LegendStar() {
  return (
    <svg className="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  )
}

function StatusPill({ isPublic }: { isPublic: boolean }) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold',
        isPublic
          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          : 'bg-zinc-100 text-zinc-500 border border-zinc-200',
      ].join(' ')}
    >
      <span
        className={['w-1.5 h-1.5 rounded-full', isPublic ? 'bg-emerald-500' : 'bg-zinc-400'].join(' ')}
      />
      {isPublic ? '公開' : '非公開'}
    </span>
  )
}

function ToggleButton({ isPublic, onClick }: { isPublic: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={[
        'px-3 py-1 rounded-lg text-xs font-medium border transition-colors',
        isPublic
          ? 'border-zinc-200 text-zinc-600 hover:bg-zinc-100'
          : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100',
      ].join(' ')}
    >
      {isPublic ? '非公開にする' : '公開する'}
    </button>
  )
}
