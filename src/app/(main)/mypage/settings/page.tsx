'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SETTINGS_ITEMS = [
  { label: 'ブロック済みユーザー', action: 'page' },
  { label: '通知設定', action: 'page' },
  { label: 'パスワード変更', action: 'page' },
  { label: 'メールアドレス変更', action: 'page' },
  { label: 'よくある質問', action: 'page' },
  { label: 'お問い合わせ', action: 'page' },
  { label: '利用規約', action: 'page' },
  { label: 'プライバシーポリシー', action: 'page' },
  { label: 'リクルート', action: 'page' },
  { label: 'アプリを応援する', action: 'page' },
]

export default function SettingsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">設定</h1>
      </header>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="mx-4 bg-zinc-900 rounded-2xl overflow-hidden mb-4">
          {SETTINGS_ITEMS.map((item, i) => (
            <button
              key={item.label}
              onClick={() => alert(`${item.label} — 準備中です`)}
              className={`flex items-center justify-between w-full px-4 py-4 text-left ${i < SETTINGS_ITEMS.length - 1 ? 'border-b border-zinc-800' : ''} hover:bg-zinc-800 transition-colors`}
            >
              <span className="text-sm">{item.label}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
        </div>

        <div className="mx-4 bg-zinc-900 rounded-2xl overflow-hidden mb-4">
          <button
            onClick={async () => {
              const supabase = createClient()
              await supabase.auth.signOut()
              window.location.href = '/login'
            }}
            className="flex items-center justify-between w-full px-4 py-4 text-left border-b border-zinc-800"
          >
            <span className="text-sm text-red-400">ログアウト</span>
          </button>
          <button
            onClick={() => alert('退会手続きを開始します')}
            className="flex items-center justify-between w-full px-4 py-4 text-left"
          >
            <span className="text-sm text-zinc-500">退会</span>
          </button>
        </div>

        <p className="text-center text-zinc-700 text-xs mt-6">J Lounge App v1.0.0</p>
      </div>
    </div>
  )
}
