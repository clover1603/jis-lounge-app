'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  loadTitleSelection,
  buildTitleText,
  PREFIX_WORDS,
  SUFFIX_WORDS,
  RARITY_LABEL,
  RARITY_COLOR,
} from '@/lib/mock-title-words'

export default function TitlesPage() {
  const router = useRouter()
  const [prefixId, setPrefixId] = useState<string | null>(null)
  const [suffixId, setSuffixId] = useState<string | null>(null)
  const [displayTitle, setDisplayTitle] = useState<string | null>(null)

  useEffect(() => {
    const sel = loadTitleSelection()
    setPrefixId(sel.prefixId)
    setSuffixId(sel.suffixId)
    setDisplayTitle(buildTitleText(sel.prefixId, sel.suffixId))
  }, [])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 bg-black border-b border-zinc-800 h-14 flex items-center px-4 z-10">
        <button onClick={() => router.back()} className="mr-3 text-white">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4L6 10L12 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="font-semibold text-base">称号</span>
      </header>

      {/* Hero card */}
      <div className="mx-4 mt-4 bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2">現在の称号</p>
        {displayTitle ? (
          <p className="text-2xl font-bold text-white truncate">{displayTitle}</p>
        ) : (
          <p className="text-zinc-600 text-sm">称号未設定</p>
        )}
        <Link
          href="/mypage/titles/edit"
          className="block text-center bg-white text-black font-semibold rounded-xl py-3 mt-4 text-sm"
        >
          称号をつくる →
        </Link>
      </div>

      {/* Unlock stats row */}
      <div className="px-4 mt-5 flex gap-4">
        <span className="text-xs text-zinc-500">
          最初のことば {PREFIX_WORDS.filter(w => w.unlocked).length}/{PREFIX_WORDS.length} 解放
        </span>
        <span className="text-xs text-zinc-500">
          次のことば {SUFFIX_WORDS.filter(w => w.unlocked).length}/{SUFFIX_WORDS.length} 解放
        </span>
      </div>

      {/* Section: 最初のことば */}
      <div className="px-4 mt-5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">最初のことば</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PREFIX_WORDS.map(word => {
            const isSelected = word.id === prefixId
            const chipClass = isSelected
              ? 'border-white bg-white text-black'
              : word.unlocked
              ? 'border-zinc-700 bg-zinc-900 text-white'
              : 'border-zinc-800 bg-zinc-900/40 text-zinc-600 opacity-50'
            return (
              <div
                key={word.id}
                className={`flex-shrink-0 rounded-xl border px-3 py-2 text-left ${chipClass}`}
              >
                <span className="text-sm font-semibold">
                  {!word.unlocked && '🔒 '}
                  {word.label}
                </span>
                {word.acquisitionLabel && (
                  <span className="text-[9px] text-zinc-600 mt-0.5 block">
                    {word.acquisitionLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Section: 次のことば */}
      <div className="px-4 mt-5">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">次のことば</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {SUFFIX_WORDS.map(word => {
            const isSelected = word.id === suffixId
            const chipClass = isSelected
              ? 'border-white bg-white text-black'
              : word.unlocked
              ? 'border-zinc-700 bg-zinc-900 text-white'
              : 'border-zinc-800 bg-zinc-900/40 text-zinc-600 opacity-50'
            return (
              <div
                key={word.id}
                className={`flex-shrink-0 rounded-xl border px-3 py-2 text-left ${chipClass}`}
              >
                <span className="text-sm font-semibold">
                  {!word.unlocked && '🔒 '}
                  {word.label}
                </span>
                {word.acquisitionLabel && (
                  <span className="text-[9px] text-zinc-600 mt-0.5 block">
                    {word.acquisitionLabel}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <p className="text-zinc-700 text-xs text-center mt-8">
        ※ UIデモ表示 | 実連携はPhase 3予定
      </p>

      <div className="pb-32" />
    </div>
  )
}
