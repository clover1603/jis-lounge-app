// engagement-storage.ts
// 会員施策機能のlocalState管理 (Phase 2 モック / Supabase非接続)

export const MOCK_DATE = '2026-08-04'
const LS_KEY = 'jis_engagement_v1'

// ─── 型定義 ────────────────────────────────────────────────────────

export type DrawRarity = 'miss' | 'normal' | 'rare' | 'legend'

export type DrawType =
  | 'ticket_single'
  | 'ticket_ten'
  | 'jileage_single'
  | 'jileage_ten'

export interface StoredDraw {
  id: string
  drawnAt: string
  drawType: DrawType
  rewardIds: string[]
  rarities: DrawRarity[]
}

export interface DailyProgress {
  date: string                  // MOCK_DATE に固定
  completedChallengeIds: string[]
  ticket1Claimed: boolean       // 2件達成後に受け取り済み
  ticket2Claimed: boolean       // 3件達成後に受け取り済み
}

export interface EngagementState {
  tickets: number
  jileage: number
  ownedFrameIds: string[]
  ownedBadgeIds: string[]
  unlockedPrefixWordIds: string[]
  unlockedSuffixWordIds: string[]
  equippedFrameId: string | null
  equippedBadgeIds: string[]    // 最大3件、順序あり
  titlePrefixId: string | null
  titleSuffixId: string | null
  dailyProgress: DailyProgress
  drawHistory: StoredDraw[]
  newItemIds: string[]          // NEW表示対象
}

// ─── デフォルト値 ────────────────────────────────────────────────

export function getDefaultState(): EngagementState {
  return {
    tickets: 2,
    jileage: 680,
    ownedFrameIds: ['frame_none', 'frame_silver'],
    ownedBadgeIds: ['badge_first_visit'],
    unlockedPrefixWordIds: ['p1', 'p2', 'p4', 'p5'],
    unlockedSuffixWordIds: ['s1', 's2', 's3', 's6', 's9', 's10'],
    equippedFrameId: 'frame_none',
    equippedBadgeIds: ['badge_first_visit'],
    titlePrefixId: 'p1',
    titleSuffixId: 's1',
    dailyProgress: {
      date: MOCK_DATE,
      completedChallengeIds: ['daily-1', 'daily-2'],
      ticket1Claimed: false,
      ticket2Claimed: false,
    },
    drawHistory: [],
    newItemIds: [],
  }
}

// ─── localStorage CRUD ───────────────────────────────────────────

export function loadState(): EngagementState {
  if (typeof window === 'undefined') return getDefaultState()
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return getDefaultState()
    const parsed = JSON.parse(raw) as Partial<EngagementState>
    return { ...getDefaultState(), ...parsed }
  } catch {
    return getDefaultState()
  }
}

export function saveState(state: EngagementState): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(state))
}

export function resetState(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(LS_KEY)
}

// ─── Daily チャレンジ判定 ─────────────────────────────────────────

export function getDailyCount(state: EngagementState): number {
  if (state.dailyProgress.date !== MOCK_DATE) return 0
  return state.dailyProgress.completedChallengeIds.length
}

export function canClaimTicket1(state: EngagementState): boolean {
  return (
    state.dailyProgress.date === MOCK_DATE &&
    state.dailyProgress.completedChallengeIds.length >= 2 &&
    !state.dailyProgress.ticket1Claimed
  )
}

export function canClaimTicket2(state: EngagementState): boolean {
  return (
    state.dailyProgress.date === MOCK_DATE &&
    state.dailyProgress.completedChallengeIds.length >= 3 &&
    !state.dailyProgress.ticket2Claimed
  )
}

export function completeDaily(
  state: EngagementState,
  challengeId: string,
): EngagementState {
  const ids = state.dailyProgress.completedChallengeIds
  if (ids.includes(challengeId)) return state
  return {
    ...state,
    dailyProgress: {
      ...state.dailyProgress,
      date: MOCK_DATE,
      completedChallengeIds: [...ids, challengeId].slice(0, 3),
    },
  }
}

export function claimDailyReward(
  state: EngagementState,
  tier: 1 | 2,
): EngagementState {
  const count = getDailyCount(state)
  if (tier === 1 && count >= 2 && !state.dailyProgress.ticket1Claimed) {
    return {
      ...state,
      tickets: state.tickets + 1,
      dailyProgress: { ...state.dailyProgress, ticket1Claimed: true },
    }
  }
  if (tier === 2 && count >= 3 && !state.dailyProgress.ticket2Claimed) {
    return {
      ...state,
      tickets: state.tickets + 1,
      dailyProgress: { ...state.dailyProgress, ticket2Claimed: true },
    }
  }
  return state
}

// ─── 重複時Jレージ補填 ──────────────────────────────────────────

export function getDuplicateJileage(rarity: DrawRarity): number {
  if (rarity === 'legend') return 500
  if (rarity === 'rare') return 100
  return 10
}

// ─── Equipped state helpers ──────────────────────────────────────

export function equipFrame(
  state: EngagementState,
  frameId: string,
): EngagementState {
  return { ...state, equippedFrameId: frameId }
}

export function toggleBadge(
  state: EngagementState,
  badgeId: string,
): EngagementState {
  const current = state.equippedBadgeIds
  if (current.includes(badgeId)) {
    return { ...state, equippedBadgeIds: current.filter(id => id !== badgeId) }
  }
  if (current.length >= 3) return state // 上限3個
  return { ...state, equippedBadgeIds: [...current, badgeId] }
}

export function setTitle(
  state: EngagementState,
  prefixId: string | null,
  suffixId: string | null,
): EngagementState {
  return { ...state, titlePrefixId: prefixId, titleSuffixId: suffixId }
}

export function clearNewItem(
  state: EngagementState,
  itemId: string,
): EngagementState {
  return { ...state, newItemIds: state.newItemIds.filter(id => id !== itemId) }
}
