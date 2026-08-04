'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  loadTitleSelection,
  saveTitleSelection,
  buildTitleText,
  PREFIX_WORDS,
  SUFFIX_WORDS,
} from '@/lib/mock-title-words'

export default function TitlesEditPage() {
  const router = useRouter()
  const [uiMode, setUiMode] = useState<'A' | 'B'>('A')
  const [prefixId, setPrefixId] = useState<string | null>(null)
  const [suffixId, setSuffixId] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const sel = loadTitleSelection()
    setPrefixId(sel.prefixId)
    setSuffixId(sel.suffixId)
  }, [])

  const previewText =
    prefixId && suffixId ? buildTitleText(prefixId, suffixId) : null

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 bg-black border-b border-zinc-800 h-14 flex items-center px-4 z-10">
        <button onClick={() => router.back()} className="mr-3 text-white">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="font-semibold text-base">称号をつくる</span>
      </header>

      {/* Tab switcher */}
      <div className="px-4 pt-3 pb-1 flex items-center gap-3">
        <button
          onClick={() => setUiMode('A')}
          className={`rounded-full px-4 py-1.5 text-xs cursor-pointer ${
            uiMode === 'A'
              ? 'bg-white text-black font-semibold'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
          }`}
        >
          案A セレクト式
        </button>
        <button
          onClick={() => setUiMode('B')}
          className={`rounded-full px-4 py-1.5 text-xs cursor-pointer ${
            uiMode === 'B'
              ? 'bg-white text-black font-semibold'
              : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
          }`}
        >
          案B カード式
        </button>
        <span className="text-zinc-600 text-[10px] ml-2">社内比較用</span>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 pb-36">
        {uiMode === 'A' ? (
          /* === 案A: セレクト式 === */
          <div className="space-y-5 pt-4">
            {/* 最初のことば */}
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">最初のことば</p>
              <select
                value={prefixId ?? ''}
                onChange={e => setPrefixId(e.target.value || null)}
                className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none"
              >
                <option value="">-- 選択してください --</option>
                {PREFIX_WORDS.map(w => (
                  <option key={w.id} value={w.id} disabled={!w.unlocked}>
                    {w.label}{!w.unlocked ? ' 🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-zinc-500 text-xl py-1">＋</div>

            {/* 次のことば */}
            <div>
              <p className="text-xs text-zinc-500 mb-1.5">次のことば</p>
              <select
                value={suffixId ?? ''}
                onChange={e => setSuffixId(e.target.value || null)}
                className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none"
              >
                <option value="">-- 選択してください --</option>
                {SUFFIX_WORDS.map(w => (
                  <option key={w.id} value={w.id} disabled={!w.unlocked}>
                    {w.label}{!w.unlocked ? ' 🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center text-zinc-600 text-sm py-1">＝</div>

            {/* Preview card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center mt-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">完成イメージ</p>
              {previewText ? (
                <p className="text-2xl font-bold text-white break-all">{previewText}</p>
              ) : (
                <p className="text-zinc-600 text-sm">最初と次のことばを選んでください</p>
              )}
            </div>
          </div>
        ) : (
          /* === 案B: カード式 === */
          <div className="space-y-5 pt-4">
            {/* 最初のことば */}
            <div>
              <p className="text-xs text-zinc-500 mb-2">最初のことば</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {PREFIX_WORDS.map(w => {
                  const isSelected = w.id === prefixId
                  const cardClass = isSelected
                    ? 'border-white bg-white text-black'
                    : w.unlocked
                    ? 'border-zinc-700 bg-zinc-900 text-white cursor-pointer hover:border-zinc-500'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-600 opacity-50 cursor-not-allowed'
                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        if (w.unlocked) setPrefixId(w.id === prefixId ? null : w.id)
                      }}
                      className={`flex-shrink-0 rounded-xl border px-3 py-2.5 min-w-[4.5rem] text-center transition-colors ${cardClass}`}
                    >
                      <span className="text-sm font-semibold block">{w.label}</span>
                      {!w.unlocked && (
                        <span className="text-[9px] block text-zinc-600 mt-0.5">🔒</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 次のことば */}
            <div>
              <p className="text-xs text-zinc-500 mb-2">次のことば</p>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SUFFIX_WORDS.map(w => {
                  const isSelected = w.id === suffixId
                  const cardClass = isSelected
                    ? 'border-white bg-white text-black'
                    : w.unlocked
                    ? 'border-zinc-700 bg-zinc-900 text-white cursor-pointer hover:border-zinc-500'
                    : 'border-zinc-800 bg-zinc-900/40 text-zinc-600 opacity-50 cursor-not-allowed'
                  return (
                    <div
                      key={w.id}
                      onClick={() => {
                        if (w.unlocked) setSuffixId(w.id === suffixId ? null : w.id)
                      }}
                      className={`flex-shrink-0 rounded-xl border px-3 py-2.5 min-w-[4.5rem] text-center transition-colors ${cardClass}`}
                    >
                      <span className="text-sm font-semibold block">{w.label}</span>
                      {!w.unlocked && (
                        <span className="text-[9px] block text-zinc-600 mt-0.5">🔒</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Preview card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center mt-2">
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-3">完成イメージ</p>
              {previewText ? (
                <p className="text-2xl font-bold text-white break-all">{previewText}</p>
              ) : (
                <p className="text-zinc-600 text-sm">最初と次のことばを選んでください</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom */}
      <div className="sticky bottom-0 bg-black border-t border-zinc-800 px-4 py-4 space-y-2">
        {saved && (
          <p className="text-emerald-400 text-xs text-center">設定しました ✓</p>
        )}
        <button
          disabled={!prefixId || !suffixId}
          onClick={() => {
            saveTitleSelection({ prefixId, suffixId })
            setSaved(true)
            setTimeout(() => router.push('/mypage'), 900)
          }}
          className="w-full bg-white text-black font-semibold rounded-xl py-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
        >
          この称号に設定する
        </button>
        <button
          onClick={() => {
            saveTitleSelection({ prefixId: null, suffixId: null })
            router.push('/mypage')
          }}
          className="w-full text-xs text-zinc-500 underline underline-offset-4 py-1 text-center block"
        >
          称号を外す
        </button>
      </div>
    </div>
  )
}
