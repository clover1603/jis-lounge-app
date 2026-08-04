import { MemberRank } from '@/lib/types'

// ─── 型定義 ────────────────────────────────────────────────────

export type DrawRarity = 'STANDARD' | 'GOLD' | 'SPECIAL'

export type LuckyDrawReward = {
  id: string
  title: string
  description: string
  rarity: DrawRarity
  category: 'badge' | 'title' | 'card_theme' | 'jileage' | 'benefit'
}

export type DrawHistory = {
  id: string
  drawnAt: string
  reward: LuckyDrawReward
}

export type TicketConditionProgress = {
  id: string
  title: string
  description: string
  current: number
  target: number
  unit: string
  completed: boolean
}

export type JileageExchangeItem = {
  id: string
  title: string
  description: string
  cost: number
  category: 'lucky_ticket' | 'card_theme' | 'title' | 'decoration' | 'seasonal_badge' | 'merchandise'
  isAvailable: boolean
  limitedUntil?: string
  isNew?: boolean
}

export type MemberTitle = {
  id: string
  title: string
  description: string
  isEarned: boolean
  earnedAt?: string
  isSelected: boolean
}

export type MemberStreak = {
  visitStreak: number
  visitStreakBest: number
  ratingStreak: number
  ratingStreakBest: number
  ratingStreakReward: number
  ratingStreakCap: number
}

export type Achievement = {
  id: string
  title: string
  description: string
  category: 'visit' | 'order' | 'store' | 'profile' | 'evaluation' | 'hidden' | 'seasonal'
  isUnlocked: boolean
  unlockedAt?: string
  isHidden: boolean
  isLimited: boolean
  limitedUntil?: string
  rarity: 'normal' | 'rare' | 'special'
}

export type AgeGroup = '20-22' | '23-25' | '26-29' | '30+'

export type CollectionCategory = 'store' | 'age_group' | 'seasonal' | 'badge'

// ─── モックデータ ────────────────────────────────────────────────

export const MOCK_TICKETS_COUNT = 2

export const MOCK_REWARDS_POOL: LuckyDrawReward[] = [
  { id: 'r1', title: 'ゴールドスターバッジ',    description: '8月限定のゴールドバッジ',               rarity: 'GOLD',     category: 'badge'      },
  { id: 'r2', title: '限定称号「夜の紳士」',     description: '今月限定の特別称号',                   rarity: 'SPECIAL',  category: 'title'      },
  { id: 'r3', title: '限定会員証テーマ「宵夜」', description: '深夜をイメージした限定デザイン',         rarity: 'GOLD',     category: 'card_theme' },
  { id: 'r4', title: 'Jレージ 50pt',            description: 'Jレージ50ポイント',                   rarity: 'STANDARD', category: 'jileage'    },
  { id: 'r5', title: 'Jレージ 100pt',           description: 'Jレージ100ポイント',                  rarity: 'GOLD',     category: 'jileage'    },
  { id: 'r6', title: 'デジタルバッジ「星の宴」', description: '特別なデジタルバッジ',                  rarity: 'STANDARD', category: 'badge'      },
  { id: 'r7', title: '次回来店特典',             description: '次回来店時に使用できる小額特典',         rarity: 'STANDARD', category: 'benefit'    },
  { id: 'r8', title: 'プロフィール装飾「金縁」', description: 'アバターを金縁フレームで装飾',           rarity: 'GOLD',     category: 'badge'      },
]

export const MOCK_DRAW_HISTORY: DrawHistory[] = [
  { id: 'h1', drawnAt: '2026-07-22', reward: MOCK_REWARDS_POOL[5] },
  { id: 'h2', drawnAt: '2026-06-30', reward: MOCK_REWARDS_POOL[3] },
  { id: 'h3', drawnAt: '2026-05-14', reward: MOCK_REWARDS_POOL[6] },
]

export const MOCK_TICKET_CONDITIONS: TicketConditionProgress[] = [
  {
    id: 'c1', title: '来店チャレンジ全達成',
    description: '今月のミッションをすべて達成する',
    current: 2, target: 3, unit: 'ミッション', completed: false,
  },
  {
    id: 'c2', title: 'アルコールドリンク累計10杯',
    description: '複数回の来店で累計注文。1日での大量飲酒は推奨しません',
    current: 7, target: 10, unit: '杯（累計）', completed: false,
  },
  {
    id: 'c3', title: '有料ドリンク累計5杯',
    description: '複数回来店での累計注文（完了済み）',
    current: 5, target: 5, unit: '杯（累計）', completed: true,
  },
  {
    id: 'c4', title: 'Jレージ500で交換',
    description: 'Jレージページから交換可能',
    current: 0, target: 500, unit: 'Jレージ', completed: false,
  },
]

export const JILEAGE_EXCHANGE_ITEMS: JileageExchangeItem[] = [
  // 既存景品
  { id: 'j1', title: 'ソフトドリンク1杯',     description: '次回来店時に使用可能',         cost: 300,  category: 'merchandise',   isAvailable: true },
  { id: 'j2', title: 'おつまみ1品',           description: '次回来店時に使用可能',         cost: 500,  category: 'merchandise',   isAvailable: true },
  { id: 'j3', title: 'デザート1品',           description: '次回来店時に使用可能',         cost: 400,  category: 'merchandise',   isAvailable: true },
  // 新規追加アプリ内特典
  { id: 'j4', title: 'ラッキーくじ抽選券',    description: 'ラッキーくじを1回引ける',      cost: 500,  category: 'lucky_ticket',  isAvailable: true, isNew: true },
  { id: 'j5', title: '限定会員証テーマ「深夜の煌」', description: '期間限定グラデーションデザイン', cost: 1000, category: 'card_theme',    isAvailable: true, limitedUntil: '2026-08-31', isNew: true },
  { id: 'j6', title: '称号「常連の風格」',     description: 'プロフィールに表示可能な称号', cost: 800,  category: 'title',         isAvailable: true, isNew: true },
  { id: 'j7', title: 'プロフィール装飾「金縁フレーム」', description: 'アバターを金縁で装飾', cost: 600,  category: 'decoration',    isAvailable: true, isNew: true },
  { id: 'j8', title: '期間限定バッジ「夏宵」', description: '2026年8月限定',              cost: 400,  category: 'seasonal_badge', isAvailable: true, limitedUntil: '2026-08-31', isNew: true },
]

export const MOCK_TITLES: MemberTitle[] = [
  { id: 'tl0', title: 'なし',           description: '称号を表示しない',        isEarned: true,  isSelected: false },
  { id: 'tl1', title: '初来店',         description: 'はじめてJIS.barを訪れた', isEarned: true,  earnedAt: '2026-02-14', isSelected: false },
  { id: 'tl2', title: '常連',           description: '5回以上来店した',         isEarned: true,  earnedAt: '2026-04-03', isSelected: true  },
  { id: 'tl3', title: '3か月連続来店',  description: '3か月連続で来店した',     isEarned: true,  earnedAt: '2026-05-31', isSelected: false },
  { id: 'tl4', title: '夜の紳士',       description: 'ラッキーくじで獲得',      isEarned: false, isSelected: false },
  { id: 'tl5', title: '常連の風格',     description: 'Jレージ交換で獲得',       isEarned: false, isSelected: false },
]

export const MOCK_STREAK: MemberStreak = {
  visitStreak:     4,
  visitStreakBest: 6,
  ratingStreak:    8,
  ratingStreakBest: 8,
  ratingStreakReward: Math.min(300, 8 * 10),
  ratingStreakCap: 300,
}

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  // 来店
  { id: 'a1',  title: '初回来店',      description: 'はじめてJIS.barを訪れた',        category: 'visit',      isUnlocked: true,  unlockedAt: '2026-02-14', isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a2',  title: '5回来店',       description: '累計5回来店した',                 category: 'visit',      isUnlocked: true,  unlockedAt: '2026-04-03', isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a3',  title: '10回来店',      description: '累計10回来店した',                 category: 'visit',      isUnlocked: true,  unlockedAt: '2026-05-18', isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a4',  title: '20回来店',      description: '累計20回来店した',                 category: 'visit',      isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a5',  title: '3か月連続来店', description: '3か月連続で来店した',             category: 'visit',      isUnlocked: true,  unlockedAt: '2026-05-31', isHidden: false, isLimited: false, rarity: 'rare'    },
  { id: 'a6',  title: '6か月連続来店', description: '6か月連続で来店した',             category: 'visit',      isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'rare'    },
  // 注文
  { id: 'a7',  title: '初注文',        description: 'はじめてオーダーした',             category: 'order',      isUnlocked: true,  unlockedAt: '2026-02-14', isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a8',  title: 'ボトル初注文',  description: 'はじめてボトルをオーダーした',    category: 'order',      isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a9',  title: 'シャンパン初注文', description: 'はじめてシャンパンをオーダー', category: 'order',      isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'rare'    },
  // 店舗
  { id: 'a10', title: '3店舗利用',     description: '異なる3店舗を訪れた',             category: 'store',      isUnlocked: true,  unlockedAt: '2026-06-10', isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a11', title: '5店舗利用',     description: '異なる5店舗を訪れた',             category: 'store',      isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'rare'    },
  { id: 'a12', title: '全店舗制覇',    description: 'すべての店舗を訪れた',             category: 'store',      isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'special' },
  // プロフィール
  { id: 'a13', title: 'プロフィール完成', description: 'プロフィールをすべて入力した', category: 'profile',    isUnlocked: true,  unlockedAt: '2026-02-14', isHidden: false, isLimited: false, rarity: 'normal'  },
  // 評価
  { id: 'a14', title: '評価3回連続',   description: '相席後の評価を3回連続で行った',   category: 'evaluation', isUnlocked: true,  unlockedAt: '2026-03-01', isHidden: false, isLimited: false, rarity: 'normal'  },
  { id: 'a15', title: '評価10回連続',  description: '相席後の評価を10回連続で行った',  category: 'evaluation', isUnlocked: false,                            isHidden: false, isLimited: false, rarity: 'rare'    },
  // 隠し実績
  { id: 'a16', title: '???',           description: '特定の行動で解除される隠し実績',  category: 'hidden',     isUnlocked: false,                            isHidden: true,  isLimited: false, rarity: 'special' },
  { id: 'a17', title: '???',           description: '特定の行動で解除される隠し実績',  category: 'hidden',     isUnlocked: false,                            isHidden: true,  isLimited: false, rarity: 'special' },
  // 期間限定
  { id: 'a18', title: '夏宵バッジ',    description: '2026年7〜8月の来店で獲得',       category: 'seasonal',   isUnlocked: true,  unlockedAt: '2026-07-10', isHidden: false, isLimited: true,  limitedUntil: '2026-08-31', rarity: 'rare'    },
  { id: 'a19', title: '夏の宴バッジ',  description: '2026年8月に3回来店で獲得',       category: 'seasonal',   isUnlocked: false,                            isHidden: false, isLimited: true,  limitedUntil: '2026-08-31', rarity: 'special' },
]

export const VISITED_STORE_IDS = ['UMEDA', 'CHAYA', 'NAMBA']

export const ALL_STORE_IDS_MAP: Record<string, string> = {
  SAPPORO:  'JIS札幌', SHINJUKU:  'JIS新宿', NSHINJUKU: 'JIS西新宿',
  CHAYA:    'JIS茶屋町', UMEDA:   'JIS梅田',  NAMBA:     'JIS難波',
  FUKUOKA:  'JIS福岡', KUMAMOTO:  'JIS熊本',
}

export const AGE_GROUPS: { id: AgeGroup; label: string; description: string; isUnlocked: boolean }[] = [
  { id: '20-22', label: '20〜22歳', description: '20〜22歳の方との30分以上の相席で解除', isUnlocked: true  },
  { id: '23-25', label: '23〜25歳', description: '23〜25歳の方との30分以上の相席で解除', isUnlocked: true  },
  { id: '26-29', label: '26〜29歳', description: '26〜29歳の方との30分以上の相席で解除', isUnlocked: false },
  { id: '30+',   label: '30歳以上', description: '30歳以上の方との30分以上の相席で解除', isUnlocked: false },
]

export const MOCK_JILEAGE_BALANCE = 680

export const RARITY_GLOW: Record<DrawRarity, string> = {
  STANDARD: '0 0 30px #ffffff55',
  GOLD:     '0 0 50px #eab30888',
  SPECIAL:  '0 0 60px #a855f788',
}

export const RARITY_COLOR: Record<DrawRarity, string> = {
  STANDARD: '#a1a1aa',
  GOLD:     '#eab308',
  SPECIAL:  '#a855f7',
}

export const RARITY_LABEL: Record<DrawRarity, string> = {
  STANDARD: 'STANDARD',
  GOLD:     'GOLD',
  SPECIAL:  'SPECIAL',
}

export type MemberStatusSummary = {
  rank: MemberRank
  selectedTitle: string
  achievementCount: number
  achievementTotal: number
  visitStreak: number
  ratingStreak: number
  ratingStreakReward: number
}

export const MOCK_STATUS_SUMMARY: MemberStatusSummary = {
  rank: 'SILVER',
  selectedTitle: '常連',
  achievementCount: MOCK_ACHIEVEMENTS.filter(a => a.isUnlocked).length,
  achievementTotal: MOCK_ACHIEVEMENTS.length,
  visitStreak: MOCK_STREAK.visitStreak,
  ratingStreak: MOCK_STREAK.ratingStreak,
  ratingStreakReward: MOCK_STREAK.ratingStreakReward,
}
