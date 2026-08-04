// 称号ワード モックデータ
// Phase 2 MVP: 組み合わせ称号の社内UI検証用

export type TitleWord = {
  id: string
  label: string
  position: 'prefix' | 'suffix'
  language: 'ja' | 'en'
  unlocked: boolean
  acquisitionLabel: string
  rarity: 'standard' | 'rare' | 'special'
  status: 'draft' | 'published' | 'stopped'
  description: string
  acquisitionMethod: 'initial' | 'challenge' | 'jileage' | 'lucky_draw' | 'rank'
  isJileageExchange: boolean
  jileageCost?: number
  isLuckyDrawPrize: boolean
  sortOrder: number
  earnedCount: number
}

export type TitleSelection = {
  prefixId: string | null
  suffixId: string | null
}

const LS_KEY = 'jis_title_selection'

export const DEFAULT_SELECTION: TitleSelection = { prefixId: 'p1', suffixId: 's1' }

export function loadTitleSelection(): TitleSelection {
  if (typeof window === 'undefined') return DEFAULT_SELECTION
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return DEFAULT_SELECTION
    return JSON.parse(raw) as TitleSelection
  } catch {
    return DEFAULT_SELECTION
  }
}

export function saveTitleSelection(sel: TitleSelection): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LS_KEY, JSON.stringify(sel))
}

export function buildTitleText(
  prefixId: string | null,
  suffixId: string | null,
): string | null {
  if (!prefixId || !suffixId) return null
  const prefix = TITLE_WORDS.find(w => w.id === prefixId)
  const suffix = TITLE_WORDS.find(w => w.id === suffixId)
  if (!prefix || !suffix) return null
  const sep = prefix.language === 'en' && suffix.language === 'ja' ? ' ' : ''
  return `${prefix.label}${sep}${suffix.label}`
}

export const TITLE_WORDS: TitleWord[] = [
  // ─── 最初のことば (prefix) ────────────────────────────────────────
  {
    id: 'p1',  label: '夜の',     position: 'prefix', language: 'ja',
    unlocked: true,  acquisitionLabel: '初期解放',
    rarity: 'standard', status: 'published',
    description: '夜の雰囲気を纏う称号',
    acquisitionMethod: 'initial', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 1, earnedCount: 142,
  },
  {
    id: 'p2',  label: '週末の',   position: 'prefix', language: 'ja',
    unlocked: true,  acquisitionLabel: '週末に3回来店',
    rarity: 'standard', status: 'published',
    description: '週末を愛する人のために',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 2, earnedCount: 87,
  },
  {
    id: 'p3',  label: '幸運な',   position: 'prefix', language: 'ja',
    unlocked: false, acquisitionLabel: 'ラッキーくじで当選',
    rarity: 'rare', status: 'published',
    description: '幸運の女神に選ばれた人',
    acquisitionMethod: 'lucky_draw', isJileageExchange: false, isLuckyDrawPrize: true,
    sortOrder: 3, earnedCount: 23,
  },
  {
    id: 'p4',  label: '新米',     position: 'prefix', language: 'ja',
    unlocked: true,  acquisitionLabel: '初来店で解放',
    rarity: 'standard', status: 'published',
    description: 'はじめての来店を記念して',
    acquisitionMethod: 'initial', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 4, earnedCount: 312,
  },
  {
    id: 'p5',  label: '熟練の',   position: 'prefix', language: 'ja',
    unlocked: true,  acquisitionLabel: '累計10回来店',
    rarity: 'standard', status: 'published',
    description: '経験を積んだ証',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 5, earnedCount: 64,
  },
  {
    id: 'p6',  label: '社交的な', position: 'prefix', language: 'ja',
    unlocked: false, acquisitionLabel: '掲示板に3回投稿',
    rarity: 'standard', status: 'published',
    description: '積極的なコミュニケーターへ',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 6, earnedCount: 39,
  },
  {
    id: 'p7',  label: 'JIS',      position: 'prefix', language: 'en',
    unlocked: false, acquisitionLabel: 'Jレージ500pt交換',
    rarity: 'rare', status: 'published',
    description: 'JISの名を冠する特別称号',
    acquisitionMethod: 'jileage', isJileageExchange: true, jileageCost: 500, isLuckyDrawPrize: false,
    sortOrder: 7, earnedCount: 18,
  },
  {
    id: 'p8',  label: 'Night',    position: 'prefix', language: 'en',
    unlocked: false, acquisitionLabel: 'ラッキーくじで当選',
    rarity: 'rare', status: 'published',
    description: '夜の特別な雰囲気を持つ称号',
    acquisitionMethod: 'lucky_draw', isJileageExchange: false, isLuckyDrawPrize: true,
    sortOrder: 8, earnedCount: 15,
  },
  {
    id: 'p9',  label: 'Lucky',    position: 'prefix', language: 'en',
    unlocked: false, acquisitionLabel: 'ラッキーくじで当選',
    rarity: 'special', status: 'published',
    description: '特別な幸運を引き寄せた人',
    acquisitionMethod: 'lucky_draw', isJileageExchange: false, isLuckyDrawPrize: true,
    sortOrder: 9, earnedCount: 8,
  },
  {
    id: 'p10', label: 'Gold',     position: 'prefix', language: 'en',
    unlocked: false, acquisitionLabel: 'GOLDランク到達',
    rarity: 'special', status: 'published',
    description: 'GOLDメンバーの証',
    acquisitionMethod: 'rank', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 10, earnedCount: 31,
  },

  // ─── 次のことば (suffix) ─────────────────────────────────────────
  {
    id: 's1',  label: '探検家',    position: 'suffix', language: 'ja',
    unlocked: true,  acquisitionLabel: '初期解放',
    rarity: 'standard', status: 'published',
    description: '未知を探索する勇敢な人',
    acquisitionMethod: 'initial', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 1, earnedCount: 156,
  },
  {
    id: 's2',  label: '常連',      position: 'suffix', language: 'ja',
    unlocked: true,  acquisitionLabel: '累計5回来店',
    rarity: 'standard', status: 'published',
    description: '顔なじみの存在',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 2, earnedCount: 98,
  },
  {
    id: 's3',  label: '挑戦者',    position: 'suffix', language: 'ja',
    unlocked: true,  acquisitionLabel: 'チャレンジ達成',
    rarity: 'standard', status: 'published',
    description: '挑戦し続ける精神の持ち主',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 3, earnedCount: 74,
  },
  {
    id: 's4',  label: '達人',      position: 'suffix', language: 'ja',
    unlocked: false, acquisitionLabel: '累計20回来店',
    rarity: 'rare', status: 'published',
    description: '極めた者だけが持つ称号',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 4, earnedCount: 27,
  },
  {
    id: 's5',  label: 'コレクター', position: 'suffix', language: 'ja',
    unlocked: false, acquisitionLabel: 'トロフィー5個獲得',
    rarity: 'rare', status: 'published',
    description: 'あらゆるものを集める人',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 5, earnedCount: 19,
  },
  {
    id: 's6',  label: '愛好家',    position: 'suffix', language: 'ja',
    unlocked: true,  acquisitionLabel: '評価を10回投稿',
    rarity: 'standard', status: 'published',
    description: '深い愛着を持つ人',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 6, earnedCount: 52,
  },
  {
    id: 's7',  label: '旅人',      position: 'suffix', language: 'ja',
    unlocked: false, acquisitionLabel: '3店舗に来店',
    rarity: 'standard', status: 'published',
    description: '様々な場所を旅する人',
    acquisitionMethod: 'challenge', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 7, earnedCount: 43,
  },
  {
    id: 's8',  label: 'Master',    position: 'suffix', language: 'en',
    unlocked: false, acquisitionLabel: 'Jレージ800pt交換',
    rarity: 'special', status: 'published',
    description: 'その道を極めた者',
    acquisitionMethod: 'jileage', isJileageExchange: true, jileageCost: 800, isLuckyDrawPrize: false,
    sortOrder: 8, earnedCount: 11,
  },
  {
    id: 's9',  label: 'Player',    position: 'suffix', language: 'en',
    unlocked: true,  acquisitionLabel: '初期解放',
    rarity: 'standard', status: 'published',
    description: 'ゲームを楽しむ人',
    acquisitionMethod: 'initial', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 9, earnedCount: 201,
  },
  {
    id: 's10', label: 'Member',    position: 'suffix', language: 'en',
    unlocked: true,  acquisitionLabel: '会員登録で解放',
    rarity: 'standard', status: 'published',
    description: 'JIS.barメンバーの証',
    acquisitionMethod: 'initial', isJileageExchange: false, isLuckyDrawPrize: false,
    sortOrder: 10, earnedCount: 312,
  },
]

export const PREFIX_WORDS = TITLE_WORDS.filter(w => w.position === 'prefix')
export const SUFFIX_WORDS = TITLE_WORDS.filter(w => w.position === 'suffix')

export const RARITY_LABEL: Record<TitleWord['rarity'], string> = {
  standard: 'スタンダード',
  rare:     'レア',
  special:  'スペシャル',
}

export const RARITY_COLOR: Record<TitleWord['rarity'], string> = {
  standard: 'bg-zinc-100 text-zinc-600',
  rare:     'bg-blue-50 text-blue-700',
  special:  'bg-amber-50 text-amber-700',
}

export const METHOD_LABEL: Record<TitleWord['acquisitionMethod'], string> = {
  initial:    '初期解放',
  challenge:  'チャレンジ',
  jileage:    'Jレージ交換',
  lucky_draw: 'ラッキーくじ',
  rank:       'ランク到達',
}

export const METHOD_COLOR: Record<TitleWord['acquisitionMethod'], string> = {
  initial:    'bg-zinc-100 text-zinc-600',
  challenge:  'bg-blue-50 text-blue-700',
  jileage:    'bg-amber-50 text-amber-700',
  lucky_draw: 'bg-purple-50 text-purple-700',
  rank:       'bg-emerald-50 text-emerald-700',
}

// 掲示板モック用: 投稿に見せるデモ称号リスト
export const BOARD_DEMO_TITLES = [
  '夜の探検家',
  '熟練の常連',
  '新米挑戦者',
  '週末の愛好家',
  'Night Player',
  '夜の常連',
  '熟練の探検家',
  null,
  null,
  null,
]
