'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MBTI_OPTIONS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const BODY_TYPES = ['細身', 'スリム', '普通', 'がっちり', 'ぽっちゃり']
const JOBS = ['IT', '医療', '金融', '教育', '飲食', '販売', '公務員', '自営業', 'その他']

type ProfileForm = {
  nickname: string
  bio: string
  mbti: string
  job: string
  height: string
  body_type: string
  birthday: string
  prefecture: string
  work_location: string
  holiday: string
  favorite_areas: string
}

export default function EditProfilePage() {
  const router = useRouter()
  const [form, setForm] = useState<ProfileForm>({
    nickname: '', bio: '', mbti: '', job: '', height: '',
    body_type: '', birthday: '', prefecture: '',
    work_location: '', holiday: '', favorite_areas: '',
  })
  const [photos, setPhotos] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { loadProfile() }, [])

  async function loadProfile() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) {
      setPhotos(data.photos ?? [])
      setForm({
        nickname: data.nickname ?? '',
        bio: data.bio ?? '',
        mbti: data.mbti ?? '',
        job: data.job ?? '',
        height: data.height ? String(data.height) : '',
        body_type: data.body_type ?? '',
        birthday: data.birthday ?? '',
        prefecture: data.prefecture ?? '',
        work_location: data.work_location ?? '',
        holiday: data.holiday ?? '',
        favorite_areas: data.favorite_areas ?? '',
      })
    }
    setLoading(false)
  }

  function set(key: keyof ProfileForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function uploadPhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/${Date.now()}.${ext}`
    const supabase = createClient()
    const { error } = await supabase.storage.from('profile-photos').upload(path, file)
    if (!error) {
      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(path)
      const newPhotos = [...photos, urlData.publicUrl].slice(0, 6)
      setPhotos(newPhotos)
      await supabase.from('profiles').update({ photos: newPhotos }).eq('id', userId)
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function removePhoto(url: string) {
    if (!userId) return
    const supabase = createClient()
    const newPhotos = photos.filter(p => p !== url)
    setPhotos(newPhotos)
    await supabase.from('profiles').update({ photos: newPhotos }).eq('id', userId)
  }

  async function save() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({
      nickname: form.nickname,
      bio: form.bio,
      mbti: form.mbti,
      job: form.job,
      height: form.height ? parseInt(form.height) : null,
      body_type: form.body_type,
      birthday: form.birthday || null,
      prefecture: form.prefecture,
      work_location: form.work_location,
      holiday: form.holiday,
      favorite_areas: form.favorite_areas,
    }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); router.back() }, 1200)
  }

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold flex-1">プロフィール編集</h1>
        <button onClick={save} disabled={saving} className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full disabled:opacity-50">
          {saved ? '保存完了!' : saving ? '保存中...' : '保存'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-4">
        <div>
          <p className="text-xs text-zinc-500 mb-2">写真（最大6枚）</p>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((url) => (
              <div key={url} className="aspect-square rounded-xl overflow-hidden relative">
                <img src={url} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(url)}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 flex items-center justify-center"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ))}
            {photos.length < 6 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="aspect-square bg-zinc-900 rounded-xl flex items-center justify-center border border-dashed border-zinc-700"
              >
                {uploading ? (
                  <div className="w-5 h-5 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-zinc-500 text-2xl">+</span>
                )}
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={uploadPhoto} className="hidden" />
        </div>

        <Field label="ニックネーム">
          <input type="text" value={form.nickname} onChange={e => set('nickname', e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600" />
        </Field>

        <Field label={`自己紹介 (${form.bio.length}/200)`}>
          <textarea value={form.bio} onChange={e => set('bio', e.target.value.slice(0, 200))} rows={4}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 resize-none" />
        </Field>

        <Field label="MBTI">
          <select value={form.mbti} onChange={e => set('mbti', e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none">
            <option value="">未設定</option>
            {MBTI_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </Field>

        <Field label="職業">
          <select value={form.job} onChange={e => set('job', e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none">
            <option value="">未設定</option>
            {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
          </select>
        </Field>

        <Field label="身長 (cm)">
          <input type="number" value={form.height} onChange={e => set('height', e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600" />
        </Field>

        <Field label="体型">
          <select value={form.body_type} onChange={e => set('body_type', e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none">
            <option value="">未設定</option>
            {BODY_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </Field>

        <Field label="生年月日">
          <input type="date" value={form.birthday} onChange={e => set('birthday', e.target.value)}
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600" />
        </Field>

        <Field label="居住地">
          <input type="text" value={form.prefecture} onChange={e => set('prefecture', e.target.value)} placeholder="例: 東京都"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600" />
        </Field>

        <Field label="勤務地">
          <input type="text" value={form.work_location} onChange={e => set('work_location', e.target.value)} placeholder="未設定"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600" />
        </Field>

        <Field label="休日">
          <input type="text" value={form.holiday} onChange={e => set('holiday', e.target.value)} placeholder="土日 / 平日 / 不定"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600" />
        </Field>

        <Field label="お気に入り地域">
          <input type="text" value={form.favorite_areas} onChange={e => set('favorite_areas', e.target.value)} placeholder="例: 東京都, 大阪府"
            className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600" />
        </Field>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-zinc-500 block mb-1.5">{label}</label>
      {children}
    </div>
  )
}
