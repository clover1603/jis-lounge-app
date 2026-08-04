// ─── 共通型 ────────────────────────────────────────────────────────

export type PublishStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'ended'
export type Rarity = 'normal' | 'rare' | 'special'
export type GrantMethod = 'auto' | 'manual'
export type AdminRole = 'headquarters' | 'store' | 'viewer'

export const PUBLISH_STATUS_LABEL: Record<PublishStatus, string> = {
  draft:     '下書き',
  scheduled: '公開予約',
  active:    '公開中',
  paused:    '停止中',
  ended:     '終了',
}

export const PUBLISH_STATUS_COLOR: Record<PublishStatus, string> = {
  draft:     'bg-zinc-100 text-zinc-600',
  scheduled: 'bg-blue-50 text-blue-700',
  active:    'bg-emerald-50 text-emerald-700',
  paused:    'bg-amber-50 text-amber-700',
  ended:     'bg-zinc-100 text-zinc-400',
}

export const RARITY_LABEL: Record<Rarity, string> = {
  normal:  'NORMAL',
  rare:    'RARE',
  special: 'SPECIAL',
}

export const RARITY_COLOR: Record<Rarity, string> = {
  normal:  'bg-zinc-100 text-zinc-600',
  rare:    'bg-yellow-50 text-yellow-700',
  special: 'bg-purple-50 text-purple-700',
}

// ─── ダッシュボード統計 ─────────────────────────────────────────────

export type DashboardStats = {
  activeChallenges: number
  activeDraws: number
  achieversThisMonth: number
  drawsExecuted: number
  jileageExchanges: number
  nearExpiry: number
  grantErrors: number
}

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  activeChallenges:    6,
  activeDraws:         1,
  achieversThisMonth: 23,
  drawsExecuted:      47,
  jileageExchanges:   31,
  nearExpiry:          2,
  grantErrors:         0,
}

// ─── チャレンジ管理 ────────────────────────────────────────────────

export type PeriodType = 'permanent' | 'monthly' | 'limited'
export type ChallengeConditionType = 'visit_count' | 'rating_count' | 'drink_count' | 'seating_minutes'
export type ChallengeRewardType = 'draw_ticket' | 'jileage' | 'title_word' | 'trophy' | 'coupon'

export type AdminChallenge = {
  id: string
  title: string
  description: string
  note?: string
  periodType: PeriodType
  conditionType: ChallengeConditionType
  conditionTarget: number
  conditionUnit: string
  rewardType: ChallengeRewardType
  rewardLabel: string
  rewardAmount?: number
  targetStores: string[] | 'all'
  status: PublishStatus
  publishAt?: string
  endAt?: string
  sortOrder: number
  achieverCount: number
  createdAt: string
  updatedAt: string
}

export const MOCK_ADMIN_CHALLENGES: AdminChallenge[] = [
  {
    id: 'c-visit-2', title: '今月もう一度JISへ', description: '今月中に2回来店する',
    periodType: 'monthly', conditionType: 'visit_count', conditionTarget: 2, conditionUnit: '回',
    rewardType: 'draw_ticket', rewardLabel: 'ラッキーくじ抽選券 ×1', rewardAmount: 1,
    targetStores: 'all', status: 'active', endAt: '2026-08-31',
    sortOrder: 1, achieverCount: 12, createdAt: '2026-08-01', updatedAt: '2026-08-01',
  },
  {
    id: 'c-visit-3', title: '今月の常連チャレンジ', description: '今月中に3回来店する',
    periodType: 'monthly', conditionType: 'visit_count', conditionTarget: 3, conditionUnit: '回',
    rewardType: 'title_word', rewardLabel: '称号「常連」',
    targetStores: 'all', status: 'active', endAt: '2026-08-31',
    sortOrder: 2, achieverCount: 5, createdAt: '2026-08-01', updatedAt: '2026-08-01',
  },
  {
    id: 'c-rating-first', title: '初めての評価', description: '相席後に評価を1回送信する',
    periodType: 'permanent', conditionType: 'rating_count', conditionTarget: 1, conditionUnit: '回',
    rewardType: 'jileage', rewardLabel: 'Jレージ +50pt', rewardAmount: 50,
    targetStores: 'all', status: 'active',
    sortOrder: 3, achieverCount: 34, createdAt: '2026-07-01', updatedAt: '2026-07-01',
  },
  {
    id: 'c-rating-10', title: '評価を続けよう', description: '連続評価10回',
    note: '来店のたびに評価すると達成できます',
    periodType: 'permanent', conditionType: 'rating_count', conditionTarget: 10, conditionUnit: '回',
    rewardType: 'coupon', rewardLabel: '次回来店100円割引券',
    targetStores: 'all', status: 'active',
    sortOrder: 4, achieverCount: 8, createdAt: '2026-07-01', updatedAt: '2026-07-01',
  },
  {
    id: 'c-order-drink-5', title: '有料ドリンクチャレンジ', description: '有料ドリンク累計5杯',
    note: '複数回の来店で達成可能です',
    periodType: 'permanent', conditionType: 'drink_count', conditionTarget: 5, conditionUnit: '杯',
    rewardType: 'draw_ticket', rewardLabel: 'ラッキーくじ抽選券 ×1', rewardAmount: 1,
    targetStores: 'all', status: 'active',
    sortOrder: 5, achieverCount: 19, createdAt: '2026-07-01', updatedAt: '2026-07-01',
  },
  {
    id: 'c-seating-300', title: 'JISを楽しもう', description: '累計相席300分',
    periodType: 'permanent', conditionType: 'seating_minutes', conditionTarget: 300, conditionUnit: '分',
    rewardType: 'trophy', rewardLabel: 'トロフィー「相席の達人」',
    targetStores: 'all', status: 'active',
    sortOrder: 6, achieverCount: 4, createdAt: '2026-07-01', updatedAt: '2026-07-01',
  },
  {
    id: 'c-summer-draft', title: '夏の来店キャンペーン（草案）', description: '8月に梅田・茶屋町で2回来店',
    periodType: 'limited', conditionType: 'visit_count', conditionTarget: 2, conditionUnit: '回',
    rewardType: 'draw_ticket', rewardLabel: '特別抽選券 ×2', rewardAmount: 2,
    targetStores: ['UMEDA', 'CHAYA'], status: 'draft', publishAt: '2026-08-10', endAt: '2026-08-31',
    sortOrder: 7, achieverCount: 0, createdAt: '2026-08-04', updatedAt: '2026-08-04',
  },
]

// ─── トロフィー管理 ────────────────────────────────────────────────

export type AdminTrophy = {
  id: string
  title: string
  description: string
  iconKey: string
  condition: string
  rarity: Rarity
  status: 'active' | 'inactive'
  manualGrantable: boolean
  earnedCount: number
  createdAt: string
}

export const MOCK_ADMIN_TROPHIES: AdminTrophy[] = [
  { id: 'tr-1', title: '初回来店',        description: 'はじめてJISを訪れた',          iconKey: 'visit',   condition: '来店1回',        rarity: 'normal',  status: 'active', manualGrantable: false, earnedCount: 89, createdAt: '2026-07-01' },
  { id: 'tr-2', title: '5回来店',         description: '累計5回来店した',              iconKey: 'visit',   condition: '来店5回',        rarity: 'normal',  status: 'active', manualGrantable: false, earnedCount: 34, createdAt: '2026-07-01' },
  { id: 'tr-3', title: '10回来店',        description: '累計10回来店した',             iconKey: 'visit',   condition: '来店10回',       rarity: 'normal',  status: 'active', manualGrantable: false, earnedCount: 12, createdAt: '2026-07-01' },
  { id: 'tr-4', title: '3か月連続来店',   description: '3か月連続で来店した',          iconKey: 'streak',  condition: '月次連続3か月',  rarity: 'rare',    status: 'active', manualGrantable: false, earnedCount: 7,  createdAt: '2026-07-01' },
  { id: 'tr-5', title: '全店舗制覇',      description: 'すべての店舗を訪れた',         iconKey: 'store',   condition: '全店舗訪問',     rarity: 'special', status: 'active', manualGrantable: true,  earnedCount: 1,  createdAt: '2026-07-01' },
  { id: 'tr-6', title: '相席の達人',      description: '累計相席300分',               iconKey: 'seating', condition: '累計相席300分',  rarity: 'rare',    status: 'active', manualGrantable: false, earnedCount: 4,  createdAt: '2026-07-01' },
  { id: 'tr-7', title: '夏宵バッジ',      description: '2026年7〜8月来店',            iconKey: 'summer',  condition: '2026年7〜8月来店', rarity: 'rare',  status: 'active', manualGrantable: false, earnedCount: 23, createdAt: '2026-07-01' },
  { id: 'tr-8', title: '夏の宴バッジ',    description: '8月に3回来店',               iconKey: 'summer2', condition: '2026年8月3回来店', rarity: 'special', status: 'active', manualGrantable: false, earnedCount: 3, createdAt: '2026-08-01' },
]

// ─── 称号ワード管理 ────────────────────────────────────────────────

export type TitleAcquireMethod = 'challenge' | 'jileage' | 'lucky_draw' | 'auto' | 'manual'

export type AdminTitleWord = {
  id: string
  displayName: string
  prefix?: string
  suffix?: string
  description: string
  acquireMethod: TitleAcquireMethod
  rarity: Rarity
  isActive: boolean
  isJileageExchange: boolean
  jileageCost?: number
  isLuckyDrawPrize: boolean
  earnedCount: number
  createdAt: string
}

export const MOCK_ADMIN_TITLE_WORDS: AdminTitleWord[] = [
  { id: 'tw-1', displayName: '初来店',        suffix: '',         description: 'はじめての来店',       acquireMethod: 'auto',        rarity: 'normal',  isActive: true, isJileageExchange: false, isLuckyDrawPrize: false, earnedCount: 89, createdAt: '2026-07-01' },
  { id: 'tw-2', displayName: '常連',           suffix: '',         description: '月3回来店チャレンジ達成', acquireMethod: 'challenge',  rarity: 'normal',  isActive: true, isJileageExchange: false, isLuckyDrawPrize: false, earnedCount: 21, createdAt: '2026-07-01' },
  { id: 'tw-3', displayName: '3か月連続来店',  suffix: '',         description: '3か月連続来店',        acquireMethod: 'auto',        rarity: 'rare',    isActive: true, isJileageExchange: false, isLuckyDrawPrize: false, earnedCount: 9,  createdAt: '2026-07-01' },
  { id: 'tw-4', displayName: '夜の紳士',       prefix: '',         description: 'ラッキーくじ限定称号',  acquireMethod: 'lucky_draw',  rarity: 'special', isActive: true, isJileageExchange: false, isLuckyDrawPrize: true,  earnedCount: 3,  createdAt: '2026-08-01' },
  { id: 'tw-5', displayName: '常連の風格',     suffix: '',         description: 'Jレージ交換限定',      acquireMethod: 'jileage',     rarity: 'rare',    isActive: true, isJileageExchange: true,  jileageCost: 800, isLuckyDrawPrize: false, earnedCount: 5, createdAt: '2026-08-01' },
  { id: 'tw-6', displayName: '相席マスター',   suffix: '',         description: '将来追加予定（無効）',  acquireMethod: 'challenge',   rarity: 'special', isActive: false, isJileageExchange: false, isLuckyDrawPrize: false, earnedCount: 0, createdAt: '2026-08-04' },
]

// ─── ラッキーくじ管理 ──────────────────────────────────────────────

export type DrawPrize = {
  id: string
  title: string
  rewardType: ChallengeRewardType | 'decoration'
  rewardLabel: string
  probability: number
  stock?: number
  duplicateAction: 'allow' | 'replace_jileage'
  replacementJileage?: number
}

export type AdminLuckyDraw = {
  id: string
  name: string
  description: string
  requiredTickets: number
  prizes: DrawPrize[]
  status: PublishStatus
  publishAt?: string
  endAt?: string
  totalDraws: number
  createdAt: string
}

export const MOCK_ADMIN_LUCKY_DRAWS: AdminLuckyDraw[] = [
  {
    id: 'draw-aug2026',
    name: '8月 夏宵くじ',
    description: '8月限定のラッキーくじ。夏にちなんだ特別景品を用意。',
    requiredTickets: 1,
    prizes: [
      { id: 'p1', title: 'ゴールドスターバッジ',     rewardType: 'trophy',      rewardLabel: 'ゴールドスターバッジ',         probability: 20, duplicateAction: 'replace_jileage', replacementJileage: 50 },
      { id: 'p2', title: '限定称号「夜の紳士」',     rewardType: 'title_word',  rewardLabel: '称号「夜の紳士」',             probability: 5,  duplicateAction: 'replace_jileage', replacementJileage: 100 },
      { id: 'p3', title: '限定会員証テーマ「宵夜」', rewardType: 'decoration',  rewardLabel: 'テーマ「宵夜」',               probability: 10, duplicateAction: 'replace_jileage', replacementJileage: 80 },
      { id: 'p4', title: 'Jレージ 50pt',            rewardType: 'jileage',     rewardLabel: 'Jレージ +50pt',               probability: 30, duplicateAction: 'allow' },
      { id: 'p5', title: 'Jレージ 100pt',           rewardType: 'jileage',     rewardLabel: 'Jレージ +100pt',              probability: 10, duplicateAction: 'allow' },
      { id: 'p6', title: 'デジタルバッジ「星の宴」', rewardType: 'trophy',      rewardLabel: 'バッジ「星の宴」',             probability: 20, duplicateAction: 'replace_jileage', replacementJileage: 40 },
      { id: 'p7', title: '次回来店特典',            rewardType: 'coupon',      rewardLabel: '次回来店100円割引券',          probability: 5,  duplicateAction: 'allow' },
    ],
    status: 'active',
    publishAt: '2026-08-01',
    endAt: '2026-08-31',
    totalDraws: 47,
    createdAt: '2026-07-28',
  },
  {
    id: 'draw-sep2026-draft',
    name: '9月 秋風くじ（草案）',
    description: '9月向けのくじ。景品は調整中。',
    requiredTickets: 1,
    prizes: [
      { id: 'q1', title: '秋限定バッジ',   rewardType: 'trophy',  rewardLabel: '秋限定バッジ',  probability: 50, duplicateAction: 'replace_jileage', replacementJileage: 30 },
      { id: 'q2', title: 'Jレージ 50pt',  rewardType: 'jileage', rewardLabel: 'Jレージ +50pt', probability: 50, duplicateAction: 'allow' },
    ],
    status: 'draft',
    publishAt: '2026-09-01',
    endAt: '2026-09-30',
    totalDraws: 0,
    createdAt: '2026-08-04',
  },
]

// ─── 報酬管理 ──────────────────────────────────────────────────────

export type RewardCategory = 'jileage' | 'draw_ticket' | 'coupon' | 'title_word' | 'trophy' | 'badge' | 'decoration'

export type AdminReward = {
  id: string
  name: string
  category: RewardCategory
  description: string
  isActive: boolean
  issuedCount: number
  createdAt: string
}

export const REWARD_CATEGORY_LABEL: Record<RewardCategory, string> = {
  jileage:     'Jレージ',
  draw_ticket: 'ラッキーくじ抽選券',
  coupon:      '割引券',
  title_word:  '称号',
  trophy:      'トロフィー',
  badge:       'バッジ',
  decoration:  'プロフィール装飾',
}

export const MOCK_ADMIN_REWARDS: AdminReward[] = [
  { id: 'r-1', name: 'Jレージ付与',            category: 'jileage',     description: '汎用Jレージ付与。金額はチャレンジ・くじで指定', isActive: true, issuedCount: 312, createdAt: '2026-07-01' },
  { id: 'r-2', name: 'ラッキーくじ抽選券',     category: 'draw_ticket', description: 'チャレンジ達成・Jレージ交換で付与',              isActive: true, issuedCount: 89,  createdAt: '2026-07-01' },
  { id: 'r-3', name: '次回来店100円割引券',    category: 'coupon',      description: '来店時に提示で100円引き',                       isActive: true, issuedCount: 23,  createdAt: '2026-07-01' },
  { id: 'r-4', name: '称号付与',              category: 'title_word',  description: '称号ワードテーブルから選択',                     isActive: true, issuedCount: 127, createdAt: '2026-07-01' },
  { id: 'r-5', name: 'トロフィー付与',        category: 'trophy',      description: 'トロフィーテーブルから選択',                     isActive: true, issuedCount: 156, createdAt: '2026-07-01' },
  { id: 'r-6', name: 'デジタルバッジ付与',    category: 'badge',       description: 'くじ・実績・期間限定で付与',                    isActive: true, issuedCount: 43,  createdAt: '2026-07-01' },
  { id: 'r-7', name: 'プロフィール装飾',      category: 'decoration',  description: '将来実装予定。現在はJレージ交換のみ対応',        isActive: false, issuedCount: 8,  createdAt: '2026-08-01' },
]

// ─── 付与履歴 ──────────────────────────────────────────────────────

export type GrantStatus = 'completed' | 'cancelled' | 'error'

export type AdminGrant = {
  id: string
  userId: string
  userNickname: string
  rewardCategory: RewardCategory
  rewardDetail: string
  grantReason: string
  grantMethod: GrantMethod
  operatorName?: string
  grantedAt: string
  status: GrantStatus
}

export const MOCK_ADMIN_GRANTS: AdminGrant[] = [
  { id: 'g-001', userId: 'u001', userNickname: 'Taro',   rewardCategory: 'draw_ticket', rewardDetail: 'ラッキーくじ抽選券 ×1', grantReason: 'チャレンジ達成: 今月もう一度JISへ', grantMethod: 'auto', grantedAt: '2026-08-03 22:14', status: 'completed' },
  { id: 'g-002', userId: 'u002', userNickname: 'Hanako', rewardCategory: 'jileage',     rewardDetail: 'Jレージ +50pt',         grantReason: 'チャレンジ達成: 初めての評価',       grantMethod: 'auto', grantedAt: '2026-08-03 21:05', status: 'completed' },
  { id: 'g-003', userId: 'u003', userNickname: 'Ken',    rewardCategory: 'title_word',  rewardDetail: '称号「夜の紳士」',       grantReason: 'ラッキーくじ当選: 8月夏宵くじ',     grantMethod: 'auto', grantedAt: '2026-08-03 20:33', status: 'completed' },
  { id: 'g-004', userId: 'u004', userNickname: 'Yuki',   rewardCategory: 'trophy',      rewardDetail: '夏宵バッジ',             grantReason: '期間条件達成: 7〜8月来店',           grantMethod: 'auto', grantedAt: '2026-08-03 19:58', status: 'completed' },
  { id: 'g-005', userId: 'u001', userNickname: 'Taro',   rewardCategory: 'jileage',     rewardDetail: 'Jレージ +100pt',        grantReason: 'ラッキーくじ当選: 8月夏宵くじ',     grantMethod: 'auto', grantedAt: '2026-08-02 23:41', status: 'completed' },
  { id: 'g-006', userId: 'u005', userNickname: 'Mika',   rewardCategory: 'coupon',      rewardDetail: '100円割引券',            grantReason: 'チャレンジ達成: 評価を続けよう',     grantMethod: 'auto', grantedAt: '2026-08-02 18:22', status: 'completed' },
  { id: 'g-007', userId: 'u006', userNickname: 'Ryo',    rewardCategory: 'trophy',      rewardDetail: '全店舗制覇',             grantReason: '手動付与: 全店舗訪問確認済み',       grantMethod: 'manual', operatorName: '本部 山田', grantedAt: '2026-08-01 14:00', status: 'completed' },
  { id: 'g-008', userId: 'u007', userNickname: 'Ai',     rewardCategory: 'draw_ticket', rewardDetail: 'ラッキーくじ抽選券 ×1', grantReason: 'チャレンジ達成: 有料ドリンクチャレンジ', grantMethod: 'auto', grantedAt: '2026-08-01 11:17', status: 'cancelled' },
]

export const GRANT_STATUS_LABEL: Record<GrantStatus, string> = {
  completed: '完了',
  cancelled: '取消済み',
  error:     'エラー',
}

export const GRANT_STATUS_COLOR: Record<GrantStatus, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-zinc-100 text-zinc-500',
  error:     'bg-red-50 text-red-700',
}
