export type Post = {
  id: string
  userId: string
  nickname: string
  age: number
  prefecture: string
  targetPrefecture: string[]
  content: string
  likes: number
  createdAt: string
  liked?: boolean
}

export type Store = {
  id: string
  name: string
  nameEn: string
  male: number
  female: number
  total: number
  isFavorite?: boolean
}

export type Message = {
  id: string
  userId: string
  nickname: string
  lastMessage: string
  unread: number
  createdAt: string
}

export type ChatMessage = {
  id: string
  senderId: string
  content: string
  createdAt: string
}

export type MemberRank = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND'

export type Gender = 'male' | 'female'

export type Profile = {
  id: string
  memberId: string
  nickname: string
  age: number
  gender: Gender
  prefecture: string
  bio: string
  mbti: string
  job: string
  height: number
  bodyType: string
  rank: MemberRank
  mileage: number
  rating: number
  seatingHours: number
  photos: string[]
}

export type OrderItem = {
  id: string
  name: string
  price: number
  category: string
  description: string
  quantity?: number
}

export type CartItem = OrderItem & { quantity: number }

export type RankingUser = {
  rank: number
  nickname: string
  mileage: number
  memberRank: MemberRank
}
