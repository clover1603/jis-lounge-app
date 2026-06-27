'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { mockCurrentUser } from '@/lib/mock-data'

const MBTI_OPTIONS = ['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']
const BODY_TYPES = ['細身', 'スリム', '普通', 'がっちり', 'ぽっちゃり']
const JOBS = ['IT', '医療', '金融', '教育', '飲食', '販売', '公務員', '自営業', 'その他']

export default function EditProfilePage() {
  const router = useRouter()
  const user = mockCurrentUser
  const [nickname, setNickname] = useState(user.nickname)
  const [bio, setBio] = useState(user.bio)
  const [mbti, setMbti] = useState(user.mbti)
  const [job, setJob] = useState(user.job)
  const [height, setHeight] = useState(String(user.height))
  const [bodyType, setBodyType] = useState(user.bodyType)
  const [saved, setSaved] = useState(false)

  function save() {
    setSaved(true)
    setTimeout(() => { setSaved(false); router.back() }, 1200)
  }

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold flex-1">プロフィール編集</h1>
        <button onClick={save} className="bg-white text-black text-sm font-semibold px-4 py-1.5 rounded-full">
          {saved ? '保存完了!' : '保存'}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mb-6">
          <p className="text-xs text-zinc-500 mb-2">写真</p>
          <div className="grid grid-cols-3 gap-2">
            <div className="aspect-square bg-zinc-800 rounded-xl flex items-center justify-center col-span-1 row-span-2 relative" style={{ gridRow: 'span 2' }}>
              <span className="text-zinc-600 text-2xl">+</span>
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square bg-zinc-900 rounded-xl flex items-center justify-center border border-zinc-800">
                <span className="text-zinc-600 text-lg">+</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Field label="ニックネーム">
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600"
            />
          </Field>

          <Field label={`自己紹介 (${bio.length}/200)`}>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, 200))}
              rows={4}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 resize-none"
            />
          </Field>

          <Field label="MBTI">
            <select
              value={mbti}
              onChange={(e) => setMbti(e.target.value)}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none"
            >
              {MBTI_OPTIONS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </Field>

          <Field label="職業">
            <select
              value={job}
              onChange={(e) => setJob(e.target.value)}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none"
            >
              {JOBS.map((j) => <option key={j} value={j}>{j}</option>)}
            </select>
          </Field>

          <Field label="身長 (cm)">
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600"
            />
          </Field>

          <Field label="体型">
            <select
              value={bodyType}
              onChange={(e) => setBodyType(e.target.value)}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none"
            >
              {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </Field>

          <Field label="生年月日">
            <input
              type="date"
              defaultValue="1999-01-01"
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600"
            />
          </Field>

          <Field label="居住地">
            <input
              type="text"
              defaultValue={user.prefecture}
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600"
            />
          </Field>

          <Field label="勤務地">
            <input
              type="text"
              placeholder="未設定"
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            />
          </Field>

          <Field label="休日">
            <input
              type="text"
              placeholder="土日 / 平日 / 不定"
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            />
          </Field>

          <Field label="お気に入り地域">
            <input
              type="text"
              placeholder="例: 東京都, 大阪府"
              className="w-full bg-zinc-900 text-white rounded-xl px-4 py-3 text-sm border border-zinc-800 focus:outline-none focus:border-zinc-600 placeholder:text-zinc-600"
            />
          </Field>
        </div>
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
