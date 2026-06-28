'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import BottomNav from '@/components/BottomNav'
import { createClient } from '@/lib/supabase/client'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login')
      } else {
        setReady(true)
      }
    })
  }, [router])

  if (!ready) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="relative min-h-screen bg-black max-w-[430px] mx-auto">
      <div style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>{children}</div>
      <BottomNav />
    </div>
  )
}
