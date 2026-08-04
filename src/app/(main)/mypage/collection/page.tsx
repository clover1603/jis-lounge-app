'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function CollectionPage() {
  const router = useRouter()
  useEffect(() => {
    router.replace('/mypage/achievements')
  }, [router])
  return null
}
