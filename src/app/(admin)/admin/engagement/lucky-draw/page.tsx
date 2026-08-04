'use client'

import { useState } from 'react'
import {
  MOCK_ADMIN_LUCKY_DRAWS,
  PUBLISH_STATUS_LABEL,
  PUBLISH_STATUS_COLOR,
  type AdminLuckyDraw,
  type DrawPrize,
  type PublishStatus,
} from '@/lib/mock-engagement-admin'

// ─── 確率合計バリデーション ───────────────────────────────────────────

function sumProbabilities(prizes: { probability: number }[]) {
  return prizes.reduce((acc, p) => acc + p.probability, 0)
}

// ─── 景品テーブル (カード内) ─────────────────────────────────────────

function PrizeTable({ prizes }: { prizes: DrawPrize[] }) {
  const sorted = [...prizes].sort((a, b) => b.probability - a.probability)
  const total = sumProbabilities(prizes)
  const isValid = total === 100

  return (
    <div className="mt-3">
      <table className="w-full text-xs">
        <thead>
          <tr className="text-left text-zinc-400 border-b border-zinc-100">
            <th className="pb-1 font-medium pr-3">景品</th>
            <th className="pb-1 font-medium pr-3 w-40">確率</th>
            <th className="pb-1 font-medium">重複時対応</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((prize) => (
            <tr key={prize.id} className="border-b border-zinc-50 last:border-b-0">
              <td className="py-1.5 pr-3 text-zinc-700">{prize.title}</td>
              <td className="py-1.5 pr-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 rounded-full bg-zinc-100 overflow-hidden max-w-[80px]">
                    <div
                      className="h-full rounded-full bg-zinc-400"
                      style={{ width: `${Math.min(prize.probability, 100)}%` }}
                    />
                  </div>
                  <span className="text-zinc-600 tabular-nums">{prize.probability}%</span>
                </div>
              </td>
              <td className="py-1.5 text-zinc-500">
                {prize.duplicateAction === 'allow'
                  ? '重複許可'
                  : `Jレージ ${prize.replacementJileage ?? 0}pt に変換`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={`mt-2 flex items-center gap-1.5 text-xs ${isValid ? 'text-zinc-400' : 'text-red-600 font-medium'}`}>
        {!isValid && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
          </svg>
        )}
        合計: {total}%
        {!isValid && ' — 合計が100%になっていません'}
      </div>
    </div>
  )
}

// ─── モーダル (新規くじ作成) ─────────────────────────────────────────

type ModalPrizeRow = {
  id: string
  title: string
  probability: string
  rewardType: string
}

function CreateDrawModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [step, setStep] = useState<1 | 2>(1)

  // Step 1 fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [requiredTickets, setRequiredTickets] = useState('1')
  const [publishAt, setPublishAt] = useState('')
  const [endAt, setEndAt] = useState('')

  // Step 2 fields
  const [prizes, setPrizes] = useState<ModalPrizeRow[]>([
    { id: crypto.randomUUID(), title: '', probability: '', rewardType: 'jileage' },
  ])
  const [toast, setToast] = useState('')

  const parsedPrizes = prizes.map((p) => ({ probability: parseFloat(p.probability) || 0 }))
  const total = sumProbabilities(parsedPrizes)
  const isValidTotal = Math.abs(total - 100) < 0.001

  function addPrize() {
    setPrizes((prev) => [...prev, { id: crypto.randomUUID(), title: '', probability: '', rewardType: 'jileage' }])
  }

  function removePrize(id: string) {
    setPrizes((prev) => prev.filter((p) => p.id !== id))
  }

  function updatePrize(id: string, field: keyof ModalPrizeRow, value: string) {
    setPrizes((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
  }

  function handleSave() {
    if (!isValidTotal) return
    onSave()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl border border-zinc-200">
        {/* Modal header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h2 className="font-bold text-zinc-800">新規くじを作成</h2>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-zinc-50">
          {([1, 2] as const).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  step === s
                    ? 'bg-zinc-900 text-white'
                    : step > s
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-zinc-100 text-zinc-400'
                }`}
              >
                {s}
              </div>
              <span className={`text-xs ${step === s ? 'text-zinc-800 font-medium' : 'text-zinc-400'}`}>
                {s === 1 ? '基本情報' : '景品設定'}
              </span>
              {s < 2 && <span className="text-zinc-200 mx-1">›</span>}
            </div>
          ))}
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {step === 1 ? (
            <>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">くじ名称</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 9月 秋風くじ"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">説明</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="くじの説明文"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-600 mb-1">必要抽選券数</label>
                <input
                  type="number"
                  value={requiredTickets}
                  onChange={(e) => setRequiredTickets(e.target.value)}
                  min="1"
                  className="w-24 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400"
                />
                <span className="ml-2 text-xs text-zinc-500">枚</span>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-600 mb-1">開始日時</label>
                  <input
                    type="datetime-local"
                    value={publishAt}
                    onChange={(e) => setPublishAt(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-zinc-600 mb-1">終了日時</label>
                  <input
                    type="datetime-local"
                    value={endAt}
                    onChange={(e) => setEndAt(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:border-zinc-400"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Running total */}
              <div
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-semibold ${
                  isValidTotal
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
                }`}
              >
                <span>確率合計</span>
                <span className="tabular-nums">
                  {total.toFixed(total % 1 === 0 ? 0 : 1)}% / 100%
                  {!isValidTotal && (
                    <span className="ml-2 font-normal text-xs">⚠ 合計が100%になっていません</span>
                  )}
                </span>
              </div>

              {/* Prize rows */}
              <div className="space-y-2">
                {prizes.map((prize, idx) => (
                  <div key={prize.id} className="flex items-center gap-2">
                    <span className="text-xs text-zinc-400 w-4">{idx + 1}</span>
                    <input
                      type="text"
                      value={prize.title}
                      onChange={(e) => updatePrize(prize.id, 'title', e.target.value)}
                      placeholder="景品名"
                      className="flex-1 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-400"
                    />
                    <select
                      value={prize.rewardType}
                      onChange={(e) => updatePrize(prize.id, 'rewardType', e.target.value)}
                      className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs text-zinc-700 focus:outline-none focus:border-zinc-400 bg-white"
                    >
                      <option value="jileage">Jレージ</option>
                      <option value="trophy">トロフィー</option>
                      <option value="title_word">称号</option>
                      <option value="draw_ticket">抽選券</option>
                      <option value="coupon">クーポン</option>
                      <option value="decoration">装飾</option>
                    </select>
                    <div className="relative">
                      <input
                        type="number"
                        value={prize.probability}
                        onChange={(e) => updatePrize(prize.id, 'probability', e.target.value)}
                        placeholder="0"
                        min="0"
                        max="100"
                        className="w-16 rounded-lg border border-zinc-200 px-2 py-1.5 pr-6 text-xs text-zinc-800 text-right focus:outline-none focus:border-zinc-400"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
                    </div>
                    <button
                      onClick={() => removePrize(prize.id)}
                      disabled={prizes.length <= 1}
                      className="text-zinc-300 hover:text-red-400 disabled:opacity-30 transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={addPrize}
                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                景品を追加
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 px-6 py-4">
          <button
            onClick={step === 1 ? onClose : () => setStep(1)}
            className="text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            {step === 1 ? 'キャンセル' : '← 戻る'}
          </button>
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!name.trim()}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 transition-colors"
            >
              次へ: 景品設定 →
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={!isValidTotal}
              className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              保存（デモ）
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── メインページ ─────────────────────────────────────────────────────

export default function LuckyDrawPage() {
  const [draws, setDraws] = useState<AdminLuckyDraw[]>(MOCK_ADMIN_LUCKY_DRAWS)
  const [showModal, setShowModal] = useState(false)
  const [toastMsg, setToastMsg] = useState('')

  function handleStop(draw: AdminLuckyDraw) {
    const ok = window.confirm(`「${draw.name}」を停止しますか？`)
    if (ok) {
      setDraws((prev) =>
        prev.map((d) => (d.id === draw.id ? { ...d, status: 'paused' as PublishStatus } : d))
      )
    }
  }

  function handleSave() {
    setShowModal(false)
    setToastMsg('くじを保存しました（デモ）')
    setTimeout(() => setToastMsg(''), 3000)
  }

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-zinc-800">ラッキーくじ管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          新規くじを作成
        </button>
      </div>

      {/* Draw cards */}
      <div className="space-y-4">
        {draws.map((draw) => {
          const total = sumProbabilities(draw.prizes)
          const isValidTotal = Math.abs(total - 100) < 0.001

          return (
            <div
              key={draw.id}
              className="rounded-xl border border-zinc-200 bg-white shadow-sm p-5"
            >
              {/* Card top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-bold text-zinc-800 text-base">{draw.name}</h2>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${PUBLISH_STATUS_COLOR[draw.status]}`}
                  >
                    {PUBLISH_STATUS_LABEL[draw.status]}
                  </span>
                </div>
                {draw.endAt && (
                  <span className="shrink-0 text-xs text-zinc-400">
                    終了: {draw.endAt}
                  </span>
                )}
              </div>

              {/* Description */}
              {draw.description && (
                <p className="mt-1 text-sm text-zinc-500">{draw.description}</p>
              )}

              {/* Stats row */}
              <div className="mt-3 flex items-center gap-4 flex-wrap">
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-600">
                  必要抽選券: {draw.requiredTickets}枚
                </span>
                <span className="text-xs text-zinc-500">
                  累計抽選数: <strong className="text-zinc-800">{draw.totalDraws.toLocaleString()}</strong> 回
                </span>
              </div>

              {/* Prize table */}
              <PrizeTable prizes={draw.prizes} />

              {/* Action buttons */}
              <div className="mt-4 flex items-center gap-3 border-t border-zinc-50 pt-4">
                <button className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
                  編集
                </button>
                {draw.status === 'active' && (
                  <button
                    onClick={() => handleStop(draw)}
                    className="text-xs text-amber-600 hover:text-amber-800 underline underline-offset-2"
                  >
                    停止
                  </button>
                )}
                <button className="text-xs text-zinc-600 hover:text-zinc-900 underline underline-offset-2">
                  複製
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <CreateDrawModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}

      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-zinc-900 px-4 py-3 text-sm text-white shadow-lg">
          {toastMsg}
        </div>
      )}
    </div>
  )
}
