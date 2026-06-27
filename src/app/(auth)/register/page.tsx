'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const [nickname, setNickname] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [birthday, setBirthday] = useState('')
  const [gender, setGender] = useState<'male' | 'female' | ''>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!gender) { setError('性別を選択してください'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname, birthday: birthday || null, gender },
      },
    })
    if (error) {
      setError(error.message || 'エラーが発生しました')
      setLoading(false)
      return
    }
    window.location.href = '/board'
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-bold text-white text-center mb-1">JIS.bar</h1>
        <p className="text-zinc-500 text-center text-sm mb-10">新規会員登録</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <input
            type="text"
            placeholder="ニックネーム（必須）"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <div className="flex gap-3">
            {(['male', 'female'] as const).map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-3 rounded-xl border font-bold text-sm transition-colors ${
                  gender === g
                    ? g === 'male' ? 'bg-blue-600 border-blue-600 text-white' : 'bg-pink-600 border-pink-600 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400'
                }`}
              >
                {g === 'male' ? '♂ 男性' : '♀ 女性'}
              </button>
            ))}
          </div>
          <input
            type="email"
            placeholder="メールアドレス"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <input
            type="password"
            placeholder="パスワード（6文字以上）"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-400"
          />
          <div>
            <label className="text-zinc-500 text-xs mb-1 block">生年月日</label>
            <input
              type="date"
              value={birthday}
              onChange={e => setBirthday(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-400"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-xl disabled:opacity-50"
          >
            {loading ? '登録中...' : 'アカウントを作成'}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm mt-8">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-white underline">ログイン</Link>
        </p>
      </div>
    </div>
  )
}
