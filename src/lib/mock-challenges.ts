// ─── 型定義 ────────────────────────────────────────────────────────

export type ChallengeCategory = 'visit' | 'rating' | 'order' | 'seating' | 'limited'
export type ChallengePeriodType = 'monthly' | 'cumulative' | 'limited'
export type ChallengeStatus = 'active' | 'completed' | 'locked'
export type ChallengeRewardType = 'draw_ticket' | 'jileage' | 'title_word' | 'trophy' | 'coupon'

export type Challenge = {
  id: string
  title: string
  description: string
  note?: string
  category: ChallengeCategory
  periodType: ChallengePeriodType
  current: number
  target: number
  unit: string
  status: ChallengeStatus
  rewardType: ChallengeRewardType
  rewardLabel: string
  rewardAmount?: number
  startAt?: string
  endAt?: string
  actionHref?: string
  actionLabel?: string
}

// ─── モックデータ ───────────────────────────────────────────────────

export const MOCK_CHALLENGES: Challenge[] = [
  {
    id: 'c-visit-2',
    title: '今月もう一度JISへ',
    description: '今月中に2回来店する',
    category: 'visit',
    periodType: 'monthly',
    current: 1,
    target: 2,
    unit: '回',
    status: 'active',
    rewardType: 'draw_ticket',
    rewardLabel: 'ラッキーくじ抽選券 ×1',
    rewardAmount: 1,
    endAt: '2026-08-31',
    actionHref: '/stores',
    actionLabel: '店舗を探す',
  },
  {
    id: 'c-visit-3',
    title: '今月の常連チャレンジ',
    description: '今月中に3回来店する',
    category: 'visit',
    periodType: 'monthly',
    current: 1,
    target: 3,
    unit: '回',
    status: 'active',
    rewardType: 'title_word',
    rewardLabel: '称号「常連」',
    endAt: '2026-08-31',
    actionHref: '/stores',
    actionLabel: '店舗を探す',
  },
  {
    id: 'c-rating-first',
    title: '初めての評価',
    description: '相席後に評価を1回送信する',
    category: 'rating',
    periodType: 'cumulative',
    current: 0,
    target: 1,
    unit: '回',
    status: 'active',
    rewardType: 'jileage',
    rewardLabel: 'Jレージ +50pt',
    rewardAmount: 50,
    actionHref: '/stores',
    actionLabel: '来店して評価する',
  },
  {
    id: 'c-rating-10',
    title: '評価を続けよう',
    description: '相席後の評価を連続10回送信する',
    note: '来店のたびに評価すると達成できます',
    category: 'rating',
    periodType: 'cumulative',
    current: 7,
    target: 10,
    unit: '回',
    status: 'active',
    rewardType: 'coupon',
    rewardLabel: '次回来店100円割引券',
    actionHref: '/stores',
    actionLabel: '来店して評価する',
  },
  {
    id: 'c-order-drink-5',
    title: '有料ドリンクチャレンジ',
    description: '有料ドリンクを累計5杯注文する',
    note: '複数回の来店で達成可能です。1日での大量飲酒は推奨しません',
    category: 'order',
    periodType: 'cumulative',
    current: 3,
    target: 5,
    unit: '杯',
    status: 'active',
    rewardType: 'draw_ticket',
    rewardLabel: 'ラッキーくじ抽選券 ×1',
    rewardAmount: 1,
    actionHref: '/order',
    actionLabel: 'メニューを見る',
  },
  {
    id: 'c-seating-300',
    title: 'JISを楽しもう',
    description: '累計相席時間を300分に到達させる',
    note: '複数回の来店で積み上がります',
    category: 'seating',
    periodType: 'cumulative',
    current: 240,
    target: 300,
    unit: '分',
    status: 'active',
    rewardType: 'trophy',
    rewardLabel: 'トロフィー「相席の達人」',
    actionHref: '/stores',
    actionLabel: '店舗を探す',
  },
]

// ─── 完了済み（表示用サンプル） ─────────────────────────────────────

export const MOCK_COMPLETED_CHALLENGES: Challenge[] = [
  {
    id: 'c-visit-first',
    title: '初来店チャレンジ',
    description: 'はじめてJISを訪れる',
    category: 'visit',
    periodType: 'cumulative',
    current: 1,
    target: 1,
    unit: '回',
    status: 'completed',
    rewardType: 'jileage',
    rewardLabel: 'Jレージ +20pt',
    rewardAmount: 20,
  },
  {
    id: 'c-profile-complete',
    title: 'プロフィールを完成させよう',
    description: 'プロフィール項目をすべて入力する',
    category: 'visit',
    periodType: 'cumulative',
    current: 1,
    target: 1,
    unit: '回',
    status: 'completed',
    rewardType: 'jileage',
    rewardLabel: 'Jレージ +30pt',
    rewardAmount: 30,
    actionHref: '/mypage/edit',
    actionLabel: 'プロフィールを編集',
  },
]

// ─── ユーティリティ ─────────────────────────────────────────────────

export const CATEGORY_LABEL: Record<ChallengeCategory, string> = {
  visit:   '来店',
  rating:  '評価',
  order:   '注文',
  seating: '相席',
  limited: '期間限定',
}

export const REWARD_ICON_PATH: Record<ChallengeRewardType, string> = {
  draw_ticket: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v6l4 2',
  jileage:     'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zm0 6v4h4',
  title_word:  'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
  trophy:      'M6 9H4a2 2 0 0 1-2-2V5h4m12 4h2a2 2 0 0 0 2-2V5h-4M6 9v2a6 6 0 0 0 12 0V9M9 21h6M12 17v4',
  coupon:      'M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6m16-4H4m0 0V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2',
}

export const ALL_CHALLENGES = [...MOCK_CHALLENGES, ...MOCK_COMPLETED_CHALLENGES]

export function getActiveCount() {
  return MOCK_CHALLENGES.filter(c => c.status === 'active').length
}

export function getNextChallenge(): Challenge | undefined {
  // 進捗率が最も高いもの（達成に一番近いもの）を「おすすめ」として返す
  return [...MOCK_CHALLENGES]
    .filter(c => c.status === 'active')
    .sort((a, b) => (b.current / b.target) - (a.current / a.target))[0]
}
