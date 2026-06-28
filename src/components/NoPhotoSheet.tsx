'use client'

import { useRouter } from 'next/navigation'

export default function NoPhotoSheet({ onClose }: { onClose: () => void }) {
  const router = useRouter()
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-zinc-900 rounded-t-2xl p-6 z-10 border-t border-zinc-800" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <div className="flex justify-center mb-4">
          <div className="w-14 h-14 rounded-full bg-zinc-800 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        </div>
        <h2 className="text-base font-bold text-center mb-1">プロフィール写真を登録してください</h2>
        <p className="text-zinc-500 text-sm text-center mb-6">投稿・メッセージ機能を使うには<br />プロフィール写真が必要です</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-zinc-800 text-zinc-300 font-semibold rounded-xl py-3 text-sm border border-zinc-700">
            キャンセル
          </button>
          <button
            onClick={() => { onClose(); router.push('/mypage/edit') }}
            className="flex-1 bg-white text-black font-semibold rounded-xl py-3 text-sm"
          >
            写真を登録する
          </button>
        </div>
      </div>
    </div>
  )
}
