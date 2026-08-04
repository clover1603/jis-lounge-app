'use client'
import { useState } from 'react'
import Link from 'next/link'

type AdminRole = 'headquarters' | 'store' | 'viewer'
type FormData = {
  label: string
  position: 'prefix' | 'suffix'
  language: 'ja' | 'en'
  rarity: 'standard' | 'rare' | 'special'
  acquisitionMethod: 'initial' | 'challenge' | 'jileage' | 'lucky_draw' | 'rank'
  description: string
  acquisitionLabel: string
  isJileageExchange: boolean
  jileageCost: string
  isLuckyDrawPrize: boolean
  sortOrder: string
  status: 'draft' | 'published' | 'stopped'
}

const defaultForm: FormData = {
  label: '',
  position: 'prefix',
  language: 'ja',
  rarity: 'standard',
  acquisitionMethod: 'initial',
  description: '',
  acquisitionLabel: '',
  isJileageExchange: false,
  jileageCost: '',
  isLuckyDrawPrize: false,
  sortOrder: '',
  status: 'draft',
}

function FormRow({ label, children, error }: { label: string; children: React.ReactNode; error?: string }) {
  return (
    <div>
      <label className="text-sm font-medium text-zinc-700 block mb-1">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

const inputClass = 'w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 bg-white'

export default function TitleWordNewPage() {
  const [role, setRole] = useState<AdminRole>('headquarters')
  const [form, setForm] = useState<FormData>(defaultForm)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    const newErrors: Record<string, string> = {}
    if (!form.label.trim()) newErrors.label = 'ワード名は必須です'
    if (form.label.length > 20) newErrors.label = '20文字以内で入力してください'
    setErrors(newErrors)
    if (Object.keys(newErrors).length === 0) {
      setSubmitted(true)
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="p-6 pb-36 max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Link
              href="/admin/engagement/title-words"
              className="text-zinc-400 hover:text-zinc-700 transition-colors text-lg leading-none"
              aria-label="一覧に戻る"
            >
              ←
            </Link>
            <h1 className="text-xl font-bold text-zinc-800">称号ワード 新規作成</h1>
          </div>
          <select
            value={role}
            onChange={e => setRole(e.target.value as AdminRole)}
            className="text-xs border border-zinc-200 rounded-lg px-2 py-1.5 bg-white text-zinc-600"
          >
            <option value="headquarters">本部管理者（デモ）</option>
            <option value="store">店舗管理者（デモ）</option>
            <option value="viewer">閲覧者（デモ）</option>
          </select>
        </div>

        {/* Permission banner */}
        {role !== 'headquarters' && (
          <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs rounded-xl px-4 py-3 mb-4">
            称号ワードの作成・編集は本部管理者のみ可能です。
          </div>
        )}

        {/* Success state */}
        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <p className="text-emerald-800 font-semibold mb-1">モックデータのため実際には保存されません。</p>
            <p className="text-emerald-600 text-sm mb-4">実装時にSupabase連携予定。</p>
            <Link
              href="/admin/engagement/title-words"
              className="inline-block text-sm font-medium text-emerald-700 underline underline-offset-2"
            >
              一覧に戻る
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 space-y-5">
            {/* 1. ワード名 */}
            <FormRow label="表示名（ワード）" error={errors.label}>
              <input
                type="text"
                value={form.label}
                onChange={e => set('label', e.target.value)}
                maxLength={20}
                placeholder="例: 夜の"
                className={inputClass}
              />
            </FormRow>

            {/* 2. 種別 */}
            <FormRow label="種別">
              <div className="flex gap-4">
                {([
                  { value: 'prefix', label: '最初のことば (prefix)' },
                  { value: 'suffix', label: '次のことば (suffix)' },
                ] as { value: FormData['position']; label: string }[]).map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="position"
                      value={opt.value}
                      checked={form.position === opt.value}
                      onChange={() => set('position', opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 3. 言語 */}
            <FormRow label="言語">
              <div className="flex gap-4">
                {([
                  { value: 'ja', label: '日本語' },
                  { value: 'en', label: '英語（簡単な英語のみ）' },
                ] as { value: FormData['language']; label: string }[]).map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="language"
                      value={opt.value}
                      checked={form.language === opt.value}
                      onChange={() => set('language', opt.value)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 4. レア度 */}
            <FormRow label="レア度">
              <div className="flex gap-4">
                {([
                  { value: 'standard', label: 'スタンダード', dotClass: 'bg-zinc-400' },
                  { value: 'rare', label: 'レア', dotClass: 'bg-blue-400' },
                  { value: 'special', label: 'スペシャル', dotClass: 'bg-amber-400' },
                ] as { value: FormData['rarity']; label: string; dotClass: string }[]).map(opt => (
                  <label key={opt.value} className="flex items-center gap-1.5 text-sm text-zinc-700 cursor-pointer">
                    <input
                      type="radio"
                      name="rarity"
                      value={opt.value}
                      checked={form.rarity === opt.value}
                      onChange={() => set('rarity', opt.value)}
                    />
                    <span className={`w-2.5 h-2.5 rounded-full inline-block ${opt.dotClass}`} />
                    {opt.label}
                  </label>
                ))}
              </div>
            </FormRow>

            {/* 5. 説明 */}
            <FormRow label="説明">
              <textarea
                value={form.description}
                onChange={e => set('description', e.target.value)}
                rows={2}
                maxLength={80}
                placeholder="例: 累計来店経験者の称号"
                className={inputClass}
              />
            </FormRow>

            {/* 6. 入手方法 */}
            <FormRow label="入手方法">
              <select
                value={form.acquisitionMethod}
                onChange={e => set('acquisitionMethod', e.target.value as FormData['acquisitionMethod'])}
                className={inputClass}
              >
                <option value="initial">初期解放</option>
                <option value="challenge">チャレンジ</option>
                <option value="jileage">Jレージ交換</option>
                <option value="lucky_draw">ラッキーくじ</option>
                <option value="rank">ランク到達</option>
              </select>
            </FormRow>

            {/* 7. 取得条件テキスト */}
            <FormRow label="取得条件テキスト">
              <input
                type="text"
                value={form.acquisitionLabel}
                onChange={e => set('acquisitionLabel', e.target.value)}
                placeholder="例: 累計10回来店"
                className={inputClass}
              />
            </FormRow>

            {/* 8. Jレージ交換 */}
            <FormRow label="Jレージ交換対象">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isJileageExchange}
                  onChange={e => set('isJileageExchange', e.target.checked)}
                />
                Jレージ交換対象にする
              </label>
              {form.isJileageExchange && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={form.jileageCost}
                      onChange={e => set('jileageCost', e.target.value)}
                      min={1}
                      placeholder="交換ポイント数"
                      className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 bg-white w-40"
                    />
                    <span className="text-sm text-zinc-500">Jレージ pt</span>
                  </div>
                </div>
              )}
            </FormRow>

            {/* 9. ラッキーくじ */}
            <FormRow label="ラッキーくじ対象">
              <label className="flex items-center gap-2 text-sm text-zinc-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isLuckyDrawPrize}
                  onChange={e => set('isLuckyDrawPrize', e.target.checked)}
                />
                ラッキーくじの景品にする
              </label>
            </FormRow>

            {/* 10. 並び順 */}
            <FormRow label="並び順">
              <input
                type="number"
                value={form.sortOrder}
                onChange={e => set('sortOrder', e.target.value)}
                min={1}
                max={99}
                placeholder="1"
                className="border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-zinc-400 bg-white w-32"
              />
            </FormRow>

            {/* 11. 公開状態 */}
            <FormRow label="公開状態">
              <select
                value={form.status}
                onChange={e => set('status', e.target.value as FormData['status'])}
                className={inputClass}
              >
                <option value="draft">下書き</option>
                <option value="published">公開</option>
                <option value="stopped">停止</option>
              </select>
            </FormRow>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      {!submitted && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-6 py-4 flex gap-3">
          <Link
            href="/admin/engagement/title-words"
            className="bg-zinc-100 text-zinc-700 font-medium rounded-xl py-2.5 px-6 text-sm hover:bg-zinc-200 transition-colors"
          >
            キャンセル
          </Link>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-zinc-900 text-white font-semibold rounded-xl py-2.5 px-6 text-sm hover:bg-zinc-700 transition-colors"
          >
            作成する
          </button>
        </div>
      )}
    </div>
  )
}
