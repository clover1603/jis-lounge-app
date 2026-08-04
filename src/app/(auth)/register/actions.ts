'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'
import { calcAgeJST } from '@/lib/utils/age'

type RegisterInput = {
  nickname: string
  email: string
  password: string
  birthday: string
  gender: 'male' | 'female'
}

export async function registerAction(input: RegisterInput): Promise<{ error: string | null }> {
  const { nickname, email, password, birthday, gender } = input

  // サーバー側年齢チェック（クライアント改ざん対策）
  if (birthday && calcAgeJST(birthday) < 20) {
    return { error: '20歳未満の方はご利用いただけません。' }
  }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, birthday: birthday || null, gender },
    },
  })

  return { error: error?.message ?? null }
}
