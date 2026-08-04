import { MemberRank } from '@/lib/types'

// ─── 型定義 ────────────────────────────────────────────────

export type JourneyMission = {
  id: string
  title: string
  description: string
  target: number
  current: number
  unit: string
  rewardTitle: string
  completed: boolean
  completedAt?: string
}

export type AchievementCategory = 'visit' | 'order' | 'store' | 'profile'

export type Achievement = {
  id: string
  title: string
  description: string
  category: AchievementCategory
  isUnlocked: boolean
  unlockedAt?: string
}

export type MemberRankProgress = {
  currentRank: MemberRank
  nextRank: MemberRank | null
  seatingHours: number
  requiredHours: number
  rating: number
  requiredRating: number | null
}

export type MemberJourneyData = {
  monthlyMissions: JourneyMission[]
  completedMissions: JourneyMission[]
  totalVisitsThisMonth: number
  totalVisitsAllTime: number
  continuousMonths: number
  achievements: Achievement[]
  visitedStoreIds: string[]
}

// ─── モックデータ ────────────────────────────────────────────

export const MOCK_JOURNEY: MemberJourneyData = {
  monthlyMissions: [
    {
      id: 'm1',
      title: '今月3回来店',
      description: '今月中に3回来店する',
      target: 3,
      current: 2,
      unit: '回',
      rewardTitle: '常連の証',
      completed: false,
    },
    {
      id: 'm2',
      title: 'ドリンク5杯注文',
      description: '今月中にドリンクを5杯注文する',
      target: 5,
      current: 5,
      unit: '杯',
      rewardTitle: 'ドリンクマスター',
      completed: true,
      completedAt: '2026-07-28',
    },
    {
      id: 'm3',
      title: '2店舗訪問',
      description: '今月中に異なる2店舗を訪問する',
      target: 2,
      current: 1,
      unit: '店舗',
      rewardTitle: '店舗探訪者',
      completed: false,
    },
  ],
  completedMissions: [
    {
      id: 'cm1',
      title: '6月: 皆勤賞',
      description: '6月に4回来店した',
      target: 4,
      current: 4,
      unit: '回',
      rewardTitle: '6月皆勤',
      completed: true,
      completedAt: '2026-06-30',
    },
    {
      id: 'cm2',
      title: '5月: ドリンクマスター',
      description: '5月にドリンクを10杯注文した',
      target: 10,
      current: 10,
      unit: '杯',
      rewardTitle: 'ドリンクマスター',
      completed: true,
      completedAt: '2026-05-22',
    },
    {
      id: 'cm3',
      title: '4月: 初来店',
      description: '4月にはじめて来店した',
      target: 1,
      current: 1,
      unit: '回',
      rewardTitle: 'ファーストステップ',
      completed: true,
      completedAt: '2026-04-05',
    },
  ],
  totalVisitsThisMonth: 2,
  totalVisitsAllTime: 18,
  continuousMonths: 4,
  achievements: [
    { id: 'a1',  title: '初回来店',      description: 'はじめてJIS.barを訪れた',          category: 'visit',   isUnlocked: true,  unlockedAt: '2026-02-14' },
    { id: 'a2',  title: '5回来店',       description: '累計5回来店した',                  category: 'visit',   isUnlocked: true,  unlockedAt: '2026-04-03' },
    { id: 'a3',  title: '10回来店',      description: '累計10回来店した',                  category: 'visit',   isUnlocked: true,  unlockedAt: '2026-05-18' },
    { id: 'a4',  title: '20回来店',      description: '累計20回来店した',                  category: 'visit',   isUnlocked: false },
    { id: 'a5',  title: '3か月連続来店', description: '3か月連続で来店した',              category: 'visit',   isUnlocked: true,  unlockedAt: '2026-05-31' },
    { id: 'a6',  title: '6か月連続来店', description: '6か月連続で来店した',              category: 'visit',   isUnlocked: false },
    { id: 'a7',  title: '初注文',        description: 'はじめてオーダーした',              category: 'order',   isUnlocked: true,  unlockedAt: '2026-02-14' },
    { id: 'a8',  title: 'ボトル初注文',  description: 'はじめてボトルをオーダーした',     category: 'order',   isUnlocked: false },
    { id: 'a9',  title: 'シャンパン初注文', description: 'はじめてシャンパンをオーダーした', category: 'order', isUnlocked: false },
    { id: 'a10', title: '3店舗利用',     description: '異なる3店舗を訪れた',              category: 'store',   isUnlocked: true,  unlockedAt: '2026-06-10' },
    { id: 'a11', title: '5店舗利用',     description: '異なる5店舗を訪れた',              category: 'store',   isUnlocked: false },
    { id: 'a12', title: '全店舗制覇',    description: 'すべての店舗を訪れた',              category: 'store',   isUnlocked: false },
    { id: 'a13', title: 'プロフィール完成', description: 'プロフィールをすべて入力した',  category: 'profile', isUnlocked: true,  unlockedAt: '2026-02-14' },
  ],
  visitedStoreIds: ['UMEDA', 'CHAYA', 'NAMBA'],
}

export const MOCK_RANK_PROGRESS: MemberRankProgress = {
  currentRank: 'SILVER',
  nextRank: 'GOLD',
  seatingHours: 6.5,
  requiredHours: 10,
  rating: 3.4,
  requiredRating: 3.1,
}

// ─── ランク定義（UI用） ─────────────────────────────────────

export const RANK_GRADIENT: Record<MemberRank, string> = {
  BRONZE:   'from-amber-900 via-amber-700 to-amber-500',
  SILVER:   'from-zinc-700 via-zinc-500 to-zinc-300',
  GOLD:     'from-yellow-800 via-yellow-600 to-yellow-400',
  PLATINUM: 'from-cyan-900 via-cyan-700 to-cyan-400',
  DIAMOND:  'from-purple-900 via-purple-700 to-purple-400',
}

export const RANK_ACCENT: Record<MemberRank, string> = {
  BRONZE:   '#d97706',
  SILVER:   '#a1a1aa',
  GOLD:     '#eab308',
  PLATINUM: '#22d3ee',
  DIAMOND:  '#a855f7',
}

export const RANK_BENEFITS: Record<MemberRank, string[]> = {
  BRONZE:   ['アプリ内チェックイン', 'デジタル会員証発行', 'Journey機能利用'],
  SILVER:   ['優先チェックイン', 'ドリンク1杯サービス（月1回）', 'Memory機能解放'],
  GOLD:     ['専用ラウンジ優先案内', 'ボトルキープ割引（5%）', 'シーズンギフト'],
  PLATINUM: ['VIP席優先予約', 'ボトルキープ割引（10%）', 'シャンパンサービス（誕生月）'],
  DIAMOND:  ['プライベートルーム予約', '全サービス最大割引', '専任アテンダント'],
}

export const ALL_RANKS: MemberRank[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND']

export const STORE_NAMES: Record<string, string> = {
  SAPPORO:  'JIS札幌',
  SHINJUKU:  'JIS新宿',
  NSHINJUKU: 'JIS西新宿',
  CHAYA:     'JIS茶屋町',
  UMEDA:     'JIS梅田',
  NAMBA:     'JIS難波',
  FUKUOKA:   'JIS福岡',
  KUMAMOTO:  'JIS熊本',
}

export const CATEGORY_LABELS: Record<AchievementCategory, string> = {
  visit:   '来店',
  order:   '注文',
  store:   '店舗',
  profile: 'プロフィール',
}
