// mock-lucky-draw.ts
// フレーム・バッジ・くじ報酬プール定義 + 抽選ロジック (モック)

import type { DrawRarity } from './engagement-storage'
import { getDuplicateJileage } from './engagement-storage'

// ─── フレーム ────────────────────────────────────────────────────

export type FrameRarity = 'standard' | 'rare' | 'legend'

export interface ProfileFrame {
  id: string
  label: string
  description: string
  rarity: FrameRarity
  cssGradient: string     // border に使うgradient
  glowColor: string       // 光彩 rgba
  isDefault: boolean
}

export const PROFILE_FRAMES: ProfileFrame[] = [
  {
    id: 'frame_none',
    label: 'なし',
    description: 'フレームなし',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #3f3f46, #52525b)',
    glowColor: 'rgba(0,0,0,0)',
    isDefault: true,
  },
  // 20色バリアント
  {
    id: 'frame_silver',
    label: 'シルバー',
    description: 'クールなシルバーフレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #94a3b8, #cbd5e1, #94a3b8)',
    glowColor: 'rgba(148,163,184,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_rose',
    label: 'ローズ',
    description: 'ピンクのバラフレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #fb7185, #fda4af, #fb7185)',
    glowColor: 'rgba(251,113,133,0.45)',
    isDefault: false,
  },
  {
    id: 'frame_sky',
    label: 'スカイ',
    description: '爽やかな空色フレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #38bdf8, #7dd3fc, #38bdf8)',
    glowColor: 'rgba(56,189,248,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_emerald',
    label: 'エメラルド',
    description: '緑のエメラルドフレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #34d399, #6ee7b7, #34d399)',
    glowColor: 'rgba(52,211,153,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_amber',
    label: 'アンバー',
    description: '温かみのある琥珀フレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #f59e0b, #fcd34d, #f59e0b)',
    glowColor: 'rgba(245,158,11,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_violet',
    label: 'ヴァイオレット',
    description: '神秘的な紫フレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #8b5cf6, #c4b5fd, #8b5cf6)',
    glowColor: 'rgba(139,92,246,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_coral',
    label: 'コーラル',
    description: 'サンゴ色のフレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #f97316, #fdba74, #f97316)',
    glowColor: 'rgba(249,115,22,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_teal',
    label: 'ティール',
    description: '深みのある青緑フレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #14b8a6, #5eead4, #14b8a6)',
    glowColor: 'rgba(20,184,166,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_indigo',
    label: 'インディゴ',
    description: '深い藍色フレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #6366f1, #a5b4fc, #6366f1)',
    glowColor: 'rgba(99,102,241,0.4)',
    isDefault: false,
  },
  {
    id: 'frame_crimson',
    label: 'クリムゾン',
    description: '情熱的な深紅フレーム',
    rarity: 'standard',
    cssGradient: 'linear-gradient(135deg, #dc2626, #fca5a5, #dc2626)',
    glowColor: 'rgba(220,38,38,0.4)',
    isDefault: false,
  },
  // レアフレーム
  {
    id: 'frame_aurora',
    label: 'オーロラ',
    description: 'オーロラのような幻想フレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #ec4899, #f59e0b)',
    glowColor: 'rgba(139,92,246,0.5)',
    isDefault: false,
  },
  {
    id: 'frame_sunset',
    label: 'サンセット',
    description: '夕焼け色のグラデーションフレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #f97316, #f43f5e, #8b5cf6)',
    glowColor: 'rgba(249,115,22,0.5)',
    isDefault: false,
  },
  {
    id: 'frame_ocean',
    label: 'オーシャン',
    description: '深海のような青フレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #0ea5e9, #2563eb, #4f46e5)',
    glowColor: 'rgba(14,165,233,0.5)',
    isDefault: false,
  },
  {
    id: 'frame_sakura',
    label: '桜',
    description: '桜の花びらイメージ',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #fda4af, #fbcfe8, #f9a8d4, #fda4af)',
    glowColor: 'rgba(253,164,175,0.55)',
    isDefault: false,
  },
  {
    id: 'frame_midnight',
    label: 'ミッドナイト',
    description: '夜空のような深い黒青フレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #1e1b4b, #312e81, #1e3a5f, #0f172a)',
    glowColor: 'rgba(99,102,241,0.5)',
    isDefault: false,
  },
  {
    id: 'frame_neon_green',
    label: 'ネオングリーン',
    description: 'サイバーなネオン緑フレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #22c55e, #86efac, #22c55e)',
    glowColor: 'rgba(34,197,94,0.6)',
    isDefault: false,
  },
  {
    id: 'frame_neon_pink',
    label: 'ネオンピンク',
    description: 'サイバーなネオンピンクフレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #ec4899, #f9a8d4, #ec4899)',
    glowColor: 'rgba(236,72,153,0.6)',
    isDefault: false,
  },
  {
    id: 'frame_galaxy',
    label: 'ギャラクシー',
    description: '銀河をイメージした宇宙フレーム',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e, #9d50bb)',
    glowColor: 'rgba(157,80,187,0.55)',
    isDefault: false,
  },
  {
    id: 'frame_diamond',
    label: 'ダイヤモンド',
    description: 'ダイヤモンドの輝きをイメージ',
    rarity: 'rare',
    cssGradient: 'linear-gradient(135deg, #e0f2fe, #bae6fd, #7dd3fc, #e0f2fe)',
    glowColor: 'rgba(125,211,252,0.55)',
    isDefault: false,
  },
  // レジェンドフレーム
  {
    id: 'frame_legend_gold',
    label: 'レジェンドゴールド',
    description: '最高レアリティの黄金フレーム。入手確率は極めて低い。',
    rarity: 'legend',
    cssGradient: 'linear-gradient(135deg, #92400e, #d97706, #fbbf24, #fef08a, #d97706, #92400e)',
    glowColor: 'rgba(251,191,36,0.7)',
    isDefault: false,
  },
]

export const FRAME_MAP: Record<string, ProfileFrame> = Object.fromEntries(
  PROFILE_FRAMES.map(f => [f.id, f])
)

export const FRAME_RARITY_LABEL: Record<FrameRarity, string> = {
  standard: 'スタンダード',
  rare: 'レア',
  legend: 'レジェンド',
}

export const FRAME_RARITY_COLOR: Record<FrameRarity, string> = {
  standard: 'bg-zinc-100 text-zinc-600',
  rare: 'bg-blue-50 text-blue-700',
  legend: 'bg-amber-50 text-amber-700',
}

// ─── バッジ ─────────────────────────────────────────────────────

export type BadgeRarity = 'standard' | 'rare' | 'legend'

export interface ProfileBadge {
  id: string
  label: string
  emoji: string
  description: string
  rarity: BadgeRarity
  acquisitionHint: string
}

export const PROFILE_BADGES: ProfileBadge[] = [
  {
    id: 'badge_first_visit',
    label: 'はじめての来店',
    emoji: '🎉',
    description: '初めて来店した証のバッジ',
    rarity: 'standard',
    acquisitionHint: '初回来店で取得',
  },
  {
    id: 'badge_regular',
    label: 'リピーター',
    emoji: '🔁',
    description: '5回以上来店した証のバッジ',
    rarity: 'standard',
    acquisitionHint: '来店5回で取得',
  },
  {
    id: 'badge_challenger',
    label: 'チャレンジャー',
    emoji: '🏆',
    description: 'チャレンジを10回クリアした証',
    rarity: 'standard',
    acquisitionHint: 'チャレンジ10回クリアで取得',
  },
  {
    id: 'badge_lucky',
    label: 'ラッキー',
    emoji: '🍀',
    description: 'ラッキーくじでレア以上を引いた証',
    rarity: 'rare',
    acquisitionHint: 'くじでレア以上を引くと取得',
  },
  {
    id: 'badge_night_owl',
    label: 'ナイトオウル',
    emoji: '🦉',
    description: '深夜に5回来店した証のバッジ',
    rarity: 'rare',
    acquisitionHint: '深夜来店5回で取得',
  },
  {
    id: 'badge_collector',
    label: 'コレクター',
    emoji: '💎',
    description: 'フレームを5種類以上取得した証',
    rarity: 'rare',
    acquisitionHint: 'フレーム5種取得で取得',
  },
  {
    id: 'badge_legend',
    label: 'レジェンド',
    emoji: '👑',
    description: 'レジェンドゴールドフレームを持つ者の証',
    rarity: 'legend',
    acquisitionHint: 'レジェンドゴールド取得で解放',
  },
  {
    id: 'badge_birthday',
    label: 'バースデー',
    emoji: '🎂',
    description: '誕生日月に来店した証',
    rarity: 'standard',
    acquisitionHint: '誕生月に来店で取得',
  },
]

export const BADGE_MAP: Record<string, ProfileBadge> = Object.fromEntries(
  PROFILE_BADGES.map(b => [b.id, b])
)

// ─── 報酬プール定義 ──────────────────────────────────────────────

export type RewardCategory = 'frame' | 'badge' | 'title_word' | 'jileage' | 'miss'

export interface DrawReward {
  id: string
  category: RewardCategory
  label: string
  rarity: DrawRarity
  emoji: string
  // フレーム/バッジ/称号の場合、該当IDを格納
  refId?: string
  // Jレージ報酬の場合の付与量
  jileageAmount?: number
}

export const MISS_REWARD: DrawReward = {
  id: 'miss',
  category: 'miss',
  label: 'はずれ',
  rarity: 'miss',
  emoji: '💨',
}

const NORMAL_POOL: DrawReward[] = [
  { id: 'frame_silver', category: 'frame', label: 'シルバーフレーム', rarity: 'normal', emoji: '🪞', refId: 'frame_silver' },
  { id: 'frame_rose', category: 'frame', label: 'ローズフレーム', rarity: 'normal', emoji: '🌹', refId: 'frame_rose' },
  { id: 'frame_sky', category: 'frame', label: 'スカイフレーム', rarity: 'normal', emoji: '🌤', refId: 'frame_sky' },
  { id: 'frame_emerald', category: 'frame', label: 'エメラルドフレーム', rarity: 'normal', emoji: '💚', refId: 'frame_emerald' },
  { id: 'frame_amber', category: 'frame', label: 'アンバーフレーム', rarity: 'normal', emoji: '🟡', refId: 'frame_amber' },
  { id: 'frame_violet', category: 'frame', label: 'ヴァイオレットフレーム', rarity: 'normal', emoji: '🟣', refId: 'frame_violet' },
  { id: 'frame_coral', category: 'frame', label: 'コーラルフレーム', rarity: 'normal', emoji: '🪸', refId: 'frame_coral' },
  { id: 'frame_teal', category: 'frame', label: 'ティールフレーム', rarity: 'normal', emoji: '🌊', refId: 'frame_teal' },
  { id: 'frame_indigo', category: 'frame', label: 'インディゴフレーム', rarity: 'normal', emoji: '🔷', refId: 'frame_indigo' },
  { id: 'frame_crimson', category: 'frame', label: 'クリムゾンフレーム', rarity: 'normal', emoji: '🔴', refId: 'frame_crimson' },
  { id: 'badge_first_visit', category: 'badge', label: 'はじめての来店バッジ', rarity: 'normal', emoji: '🎉', refId: 'badge_first_visit' },
  { id: 'badge_regular', category: 'badge', label: 'リピーターバッジ', rarity: 'normal', emoji: '🔁', refId: 'badge_regular' },
  { id: 'badge_birthday', category: 'badge', label: 'バースデーバッジ', rarity: 'normal', emoji: '🎂', refId: 'badge_birthday' },
  { id: 'badge_challenger', category: 'badge', label: 'チャレンジャーバッジ', rarity: 'normal', emoji: '🏆', refId: 'badge_challenger' },
]

const RARE_POOL: DrawReward[] = [
  { id: 'frame_aurora', category: 'frame', label: 'オーロラフレーム', rarity: 'rare', emoji: '🌌', refId: 'frame_aurora' },
  { id: 'frame_sunset', category: 'frame', label: 'サンセットフレーム', rarity: 'rare', emoji: '🌅', refId: 'frame_sunset' },
  { id: 'frame_ocean', category: 'frame', label: 'オーシャンフレーム', rarity: 'rare', emoji: '🌊', refId: 'frame_ocean' },
  { id: 'frame_sakura', category: 'frame', label: '桜フレーム', rarity: 'rare', emoji: '🌸', refId: 'frame_sakura' },
  { id: 'frame_midnight', category: 'frame', label: 'ミッドナイトフレーム', rarity: 'rare', emoji: '🌃', refId: 'frame_midnight' },
  { id: 'frame_neon_green', category: 'frame', label: 'ネオングリーンフレーム', rarity: 'rare', emoji: '💚', refId: 'frame_neon_green' },
  { id: 'frame_neon_pink', category: 'frame', label: 'ネオンピンクフレーム', rarity: 'rare', emoji: '💗', refId: 'frame_neon_pink' },
  { id: 'frame_galaxy', category: 'frame', label: 'ギャラクシーフレーム', rarity: 'rare', emoji: '🌌', refId: 'frame_galaxy' },
  { id: 'frame_diamond', category: 'frame', label: 'ダイヤモンドフレーム', rarity: 'rare', emoji: '💠', refId: 'frame_diamond' },
  { id: 'badge_lucky', category: 'badge', label: 'ラッキーバッジ', rarity: 'rare', emoji: '🍀', refId: 'badge_lucky' },
  { id: 'badge_night_owl', category: 'badge', label: 'ナイトオウルバッジ', rarity: 'rare', emoji: '🦉', refId: 'badge_night_owl' },
  { id: 'badge_collector', category: 'badge', label: 'コレクターバッジ', rarity: 'rare', emoji: '💎', refId: 'badge_collector' },
  { id: 'title_p9', category: 'title_word', label: '称号ワード「Lucky」', rarity: 'rare', emoji: '✨', refId: 'p9' },
  { id: 'title_s8', category: 'title_word', label: '称号ワード「Master」', rarity: 'rare', emoji: '🎓', refId: 's8' },
]

const LEGEND_POOL: DrawReward[] = [
  { id: 'frame_legend_gold', category: 'frame', label: 'レジェンドゴールドフレーム', rarity: 'legend', emoji: '👑', refId: 'frame_legend_gold' },
  { id: 'badge_legend', category: 'badge', label: 'レジェンドバッジ', rarity: 'legend', emoji: '👑', refId: 'badge_legend' },
  { id: 'title_p10', category: 'title_word', label: '称号ワード「Gold」', rarity: 'legend', emoji: '🏅', refId: 'p10' },
]

// ─── 抽選ロジック ────────────────────────────────────────────────

function pickRarity(): DrawRarity {
  const r = Math.random() * 100
  if (r < 50) return 'miss'
  if (r < 85) return 'normal'
  if (r < 95) return 'rare'
  return 'legend'
}

function pickFromPool(pool: DrawReward[]): DrawReward {
  return pool[Math.floor(Math.random() * pool.length)]
}

export interface SingleDrawResult {
  reward: DrawReward
  isDuplicate: boolean
  duplicateJileage: number
}

export function executeSingleDraw(ownedIds: string[]): SingleDrawResult {
  const rarity = pickRarity()
  if (rarity === 'miss') {
    return { reward: MISS_REWARD, isDuplicate: false, duplicateJileage: 0 }
  }

  const pool =
    rarity === 'legend' ? LEGEND_POOL :
    rarity === 'rare'   ? RARE_POOL :
                          NORMAL_POOL

  const reward = pickFromPool(pool)
  const isDuplicate = ownedIds.includes(reward.id)
  const duplicateJileage = isDuplicate ? getDuplicateJileage(rarity) : 0

  return { reward, isDuplicate, duplicateJileage }
}

export function executeTenDraws(ownedIds: string[]): SingleDrawResult[] {
  return Array.from({ length: 10 }, () => executeSingleDraw(ownedIds))
}

// ─── 報酬をstateに適用（純粋関数版） ─────────────────────────────

import type { EngagementState } from './engagement-storage'

export function applyDrawResults(
  state: EngagementState,
  results: SingleDrawResult[],
  drawType: import('./engagement-storage').DrawType,
): EngagementState {
  let next = { ...state }
  const rewardIds: string[] = []
  const rarities: DrawRarity[] = []
  const newItemIds = [...next.newItemIds]

  for (const result of results) {
    const { reward, isDuplicate, duplicateJileage } = result
    rarities.push(reward.rarity)
    rewardIds.push(reward.id)

    if (reward.rarity === 'miss') {
      next = { ...next, jileage: next.jileage + 1 }
      continue
    }

    if (isDuplicate) {
      next = { ...next, jileage: next.jileage + duplicateJileage }
      continue
    }

    newItemIds.push(reward.id)

    if (reward.category === 'frame' && reward.refId) {
      if (!next.ownedFrameIds.includes(reward.refId)) {
        next = { ...next, ownedFrameIds: [...next.ownedFrameIds, reward.refId] }
      }
    } else if (reward.category === 'badge' && reward.refId) {
      if (!next.ownedBadgeIds.includes(reward.refId)) {
        next = { ...next, ownedBadgeIds: [...next.ownedBadgeIds, reward.refId] }
      }
    } else if (reward.category === 'title_word' && reward.refId) {
      const refId = reward.refId
      if (refId.startsWith('p') && !next.unlockedPrefixWordIds.includes(refId)) {
        next = { ...next, unlockedPrefixWordIds: [...next.unlockedPrefixWordIds, refId] }
      } else if (refId.startsWith('s') && !next.unlockedSuffixWordIds.includes(refId)) {
        next = { ...next, unlockedSuffixWordIds: [...next.unlockedSuffixWordIds, refId] }
      }
    }
  }

  const drawRecord = {
    id: `draw_${Date.now()}`,
    drawnAt: new Date().toISOString(),
    drawType,
    rewardIds,
    rarities,
  }

  return {
    ...next,
    newItemIds,
    drawHistory: [drawRecord, ...next.drawHistory].slice(0, 50),
  }
}
