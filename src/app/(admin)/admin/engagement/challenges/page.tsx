'use client'

import { useState, useEffect, useRef } from 'react'
import {
  MOCK_ADMIN_CHALLENGES,
  PUBLISH_STATUS_LABEL,
  PUBLISH_STATUS_COLOR,
  type PublishStatus,
  type PeriodType,
  type ChallengeConditionType,
  type ChallengeRewardType,
} from '@/lib/mock-engagement-admin'

// ─── 定数 ─────────────────────────────────────────────────────────

const PERIOD_TYPE_LABEL: Record<PeriodType, string> = {
  permanent: '常設',
  monthly:   '月間',
  limited:   '期間限定',
}

const PERIOD_TYPE_COLOR: Record<PeriodType, string> = {
  permanent: 'bg-zinc-100 text-zinc-600',
  monthly:   'bg-blue-50 text-blue-700',
  limited:   'bg-purple-50 text-purple-700',
}

const CONDITION_TYPE_LABEL: Record<ChallengeConditionType, string> = {
  visit_count:     '来店回数',
  rating_count:    '評価回数',
  drink_count:     'ドリンク数',
  seating_minutes: '相席時間（分）',
}

const REWARD_TYPE_LABEL: Record<ChallengeRewardType, string> = {
  draw_ticket: 'ラッキーくじ券',
  jileage:     'Jレージ',
  title_word:  '称号',
  trophy:      'トロフィー',
  coupon:      '割引券',
}

const STATUS_FILTER_OPTIONS: { value: PublishStatus | 'all'; label: string }[] = [
  { value: 'all',    label: 'すべて' },
  { value: 'active', label: '公開中' },
  { value: 'paused', label: '停止中' },
  { value: 'draft',  label: '下書き' },
]

const PERIOD_FILTER_OPTIONS: { value: PeriodType | 'all'; label: string }[] = [
  { value: 'all',       label: 'すべて' },
  { value: 'permanent', label: '常設' },
  { value: 'monthly',   label: '月間' },
  { value: 'limited',   label: '期間限定' },
]

// ─── 新規作成モーダル ───────────────────────────────────────────────

type Step1Form = { title: string; description: string; note: string }
type Step2Form = { periodType: PeriodType; conditionType: ChallengeConditionType; conditionTarget: string }
type Step3Form = { rewardType: ChallengeRewardType; rewardLabel: string; publishAt: string; endAt: string }

function CreateModal({ onClose, onSave }: { onClose: () => void; onSave: () => void }) {
  const [step, setStep] = useState(0)
  const [step1, setStep1] = useState<Step1Form>({ title: '', description: '', note: '' })
  const [step2, setStep2] = useState<Step2Form>({ periodType: 'permanent', conditionType: 'visit_count', conditionTarget: '1' })
  const [step3, setStep3] = useState<Step3Form>({ rewardType: 'draw_ticket', rewardLabel: '', publishAt: '', endAt: '' })
  const overlayRef = useRef<HTMLDivElement>(null)

  // Esc キーで閉じる
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const steps = ['基本情報', '条件設定', '報酬・期間']
  const canNext0 = step1.title.trim() !== '' && step1.description.trim() !== ''
  const canNext1 = step2.conditionTarget !== '' && Number(step2.conditionTarget) > 0
  const canSave  = step3.rewardLabel.trim() !== ''

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div className="w-full sm:w-[560px] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* ヘッダー */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-zinc-100 flex-shrink-0">
          <div>
            <h2 className="text-base font-bold text-zinc-800">チャレンジ新規作成</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{steps[step]}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-800 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* ステップインジケーター */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-100 flex-shrink-0">
          {steps.map((label, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                i === step ? 'bg-zinc-900 text-white' : i < step ? 'bg-emerald-500 text-white' : 'bg-zinc-100 text-zinc-400'
              }`}>
                {i < step ? (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                ) : i + 1}
              </div>
              <span className={`text-xs ${i === step ? 'text-zinc-800 font-semibold' : 'text-zinc-400'}`}>{label}</span>
              {i < steps.length - 1 && <div className="w-5 h-px bg-zinc-200" />}
            </div>
          ))}
        </div>

        {/* フォームエリア */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4">

          {/* Step 1 */}
          {step === 0 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">タイトル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={step1.title}
                  onChange={e => setStep1(p => ({ ...p, title: e.target.value }))}
                  placeholder="例: 今月もう一度JISへ"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">説明 <span className="text-red-500">*</span></label>
                <textarea
                  value={step1.description}
                  onChange={e => setStep1(p => ({ ...p, description: e.target.value }))}
                  placeholder="例: 今月中に2回来店する"
                  rows={3}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">ノート（任意）</label>
                <textarea
                  value={step1.note}
                  onChange={e => setStep1(p => ({ ...p, note: e.target.value }))}
                  placeholder="内部メモ・補足説明"
                  rows={2}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition resize-none"
                />
              </div>
            </>
          )}

          {/* Step 2 */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">種別</label>
                <select
                  value={step2.periodType}
                  onChange={e => setStep2(p => ({ ...p, periodType: e.target.value as PeriodType }))}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                >
                  <option value="permanent">常設</option>
                  <option value="monthly">月間</option>
                  <option value="limited">期間限定</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">条件タイプ</label>
                <select
                  value={step2.conditionType}
                  onChange={e => setStep2(p => ({ ...p, conditionType: e.target.value as ChallengeConditionType }))}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                >
                  {(Object.entries(CONDITION_TYPE_LABEL) as [ChallengeConditionType, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">目標値 <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={1}
                  value={step2.conditionTarget}
                  onChange={e => setStep2(p => ({ ...p, conditionTarget: e.target.value }))}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                />
                <p className="text-xs text-zinc-400 mt-1">{CONDITION_TYPE_LABEL[step2.conditionType]} が この数値に達したら達成</p>
              </div>
            </>
          )}

          {/* Step 3 */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">報酬種別</label>
                <select
                  value={step3.rewardType}
                  onChange={e => setStep3(p => ({ ...p, rewardType: e.target.value as ChallengeRewardType }))}
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                >
                  {(Object.entries(REWARD_TYPE_LABEL) as [ChallengeRewardType, string][]).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-600 mb-1.5">報酬ラベル <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={step3.rewardLabel}
                  onChange={e => setStep3(p => ({ ...p, rewardLabel: e.target.value }))}
                  placeholder="例: ラッキーくじ抽選券 ×1"
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 placeholder-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">公開日（任意）</label>
                  <input
                    type="date"
                    value={step3.publishAt}
                    onChange={e => setStep3(p => ({ ...p, publishAt: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-600 mb-1.5">終了日（任意）</label>
                  <input
                    type="date"
                    value={step3.endAt}
                    onChange={e => setStep3(p => ({ ...p, endAt: e.target.value }))}
                    className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm text-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* フッター */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-zinc-100 flex-shrink-0">
          <button
            onClick={() => step === 0 ? onClose() : setStep(p => p - 1)}
            className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            {step === 0 ? 'キャンセル' : '戻る'}
          </button>

          {step < 2 ? (
            <button
              onClick={() => setStep(p => p + 1)}
              disabled={step === 0 ? !canNext0 : !canNext1}
              className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              次へ
            </button>
          ) : (
            <button
              onClick={onSave}
              disabled={!canSave}
              className="px-5 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              保存（デモ）
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── トースト ──────────────────────────────────────────────────────

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 2500)
    return () => clearTimeout(timer)
  }, [onDismiss])

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="bg-zinc-900 text-white rounded-xl px-5 py-3 text-sm font-medium shadow-xl flex items-center gap-2">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        {message}
      </div>
    </div>
  )
}

// ─── フィルターピル ────────────────────────────────────────────────

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap ${
        active ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-800'
      }`}
    >
      {children}
    </button>
  )
}

// ─── ページ ────────────────────────────────────────────────────────

export default function ChallengesPage() {
  const [statusFilter, setStatusFilter] = useState<PublishStatus | 'all'>('all')
  const [periodFilter, setPeriodFilter] = useState<PeriodType | 'all'>('all')
  const [search, setSearch]             = useState('')
  const [showCreate, setShowCreate]     = useState(false)
  const [toast, setToast]               = useState<string | null>(null)

  const filtered = MOCK_ADMIN_CHALLENGES.filter(c => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false
    if (periodFilter !== 'all' && c.periodType !== periodFilter) return false
    if (search.trim() !== '') {
      const q = search.toLowerCase()
      if (!c.title.toLowerCase().includes(q) && !c.description.toLowerCase().includes(q)) return false
    }
    return true
  })

  const handleSave = () => {
    setShowCreate(false)
    setToast('作成しました（デモ表示）')
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* ページヘッダー */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-zinc-800">チャレンジ管理</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{MOCK_ADMIN_CHALLENGES.length} 件登録中</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-zinc-900 text-white rounded-lg px-4 py-2 text-sm font-semibold hover:bg-zinc-700 transition-colors flex-shrink-0"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          新規作成
        </button>
      </div>

      {/* フィルター行 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* ステータス */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTER_OPTIONS.map(o => (
            <FilterPill key={o.value} active={statusFilter === o.value} onClick={() => setStatusFilter(o.value)}>
              {o.label}
            </FilterPill>
          ))}
        </div>

        <div className="w-px h-5 bg-zinc-200 hidden sm:block" />

        {/* 種別 */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PERIOD_FILTER_OPTIONS.map(o => (
            <FilterPill key={o.value} active={periodFilter === o.value} onClick={() => setPeriodFilter(o.value)}>
              {o.label}
            </FilterPill>
          ))}
        </div>

        {/* 検索 */}
        <div className="ml-auto flex items-center gap-2 min-w-0">
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="タイトル・説明を検索"
              className="pl-8 pr-3 py-1.5 text-sm border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/20 focus:border-zinc-400 transition w-48 md:w-56"
            />
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 w-12">並び順</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">タイトル・説明</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">種別</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">条件</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">報酬</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">達成者数</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3 whitespace-nowrap">ステータス</th>
                <th className="text-left text-xs font-semibold text-zinc-500 px-4 py-3">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-zinc-400">
                    条件に一致するチャレンジがありません
                  </td>
                </tr>
              )}
              {filtered.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-zinc-50 transition-colors">

                  {/* 並び順 */}
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-zinc-100 text-xs font-bold text-zinc-600">
                      {challenge.sortOrder}
                    </span>
                  </td>

                  {/* タイトル・説明 */}
                  <td className="px-4 py-3 max-w-xs">
                    <p className="font-semibold text-zinc-800 leading-snug">{challenge.title}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 leading-snug">{challenge.description}</p>
                    {challenge.note && (
                      <p className="text-xs text-zinc-400 italic mt-0.5">{challenge.note}</p>
                    )}
                  </td>

                  {/* 種別 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PERIOD_TYPE_COLOR[challenge.periodType]}`}>
                      {PERIOD_TYPE_LABEL[challenge.periodType]}
                    </span>
                  </td>

                  {/* 条件 */}
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-600 text-xs">
                    {challenge.conditionTarget} {challenge.conditionUnit}
                  </td>

                  {/* 報酬 */}
                  <td className="px-4 py-3 max-w-[160px]">
                    <span className="text-xs text-zinc-600 leading-snug">{challenge.rewardLabel}</span>
                  </td>

                  {/* 達成者数 */}
                  <td className="px-4 py-3 whitespace-nowrap text-zinc-700 font-medium text-sm">
                    {challenge.achieverCount}<span className="text-xs text-zinc-400 ml-0.5">人</span>
                  </td>

                  {/* ステータス */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${PUBLISH_STATUS_COLOR[challenge.status]}`}>
                      {PUBLISH_STATUS_LABEL[challenge.status]}
                    </span>
                  </td>

                  {/* 操作 */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <button className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
                        編集
                      </button>
                      <button className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">
                        複製
                      </button>
                      <button
                        className="text-xs text-zinc-500 hover:text-amber-700 transition-colors"
                        onClick={() => {
                          if (window.confirm(`「${challenge.title}」を公開停止しますか？`)) {
                            // デモ: 何もしない
                          }
                        }}
                      >
                        公開停止
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* テーブルフッター */}
        <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50">
          <p className="text-xs text-zinc-400">{filtered.length} 件表示</p>
        </div>
      </div>

      {/* 新規作成モーダル */}
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onSave={handleSave} />
      )}

      {/* トースト */}
      {toast && <Toast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
