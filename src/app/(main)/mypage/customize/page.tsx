'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  loadState,
  type EngagementState,
} from '@/lib/engagement-storage'
import {
  FRAME_MAP,
  BADGE_MAP,
} from '@/lib/mock-lucky-draw'
import {
  buildTitleText,
  loadTitleSelection,
} from '@/lib/mock-title-words'

// ─── Chevron SVG ─────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  )
}

function BackArrow() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
  )
}

// ─── Avatar with gradient frame border ───────────────────────────

function Avatar({
  frameId,
  size = 80,
}: {
  frameId: string | null
  size?: number
}) {
  const frame = frameId ? FRAME_MAP[frameId] : null
  const gradient =
    frame && !frame.isDefault
      ? frame.cssGradient
      : 'linear-gradient(135deg, #3f3f46, #52525b)'
  const glowColor =
    frame && !frame.isDefault ? frame.glowColor : 'rgba(0,0,0,0)'
  const hasGlow = frame && !frame.isDefault

  const borderWidth = 3
  const innerSize = size - borderWidth * 2

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        padding: borderWidth,
        background: gradient,
        boxShadow: hasGlow
          ? `0 0 18px 4px ${glowColor}, 0 0 6px 1px ${glowColor}`
          : 'none',
        flexShrink: 0,
        transition: 'box-shadow 0.3s ease',
      }}
    >
      <div
        style={{
          width: innerSize,
          height: innerSize,
          borderRadius: '50%',
          background: '#18181b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.35,
          fontWeight: 700,
          color: '#e4e4e7',
          letterSpacing: '-0.01em',
          userSelect: 'none',
        }}
      >
        J
      </div>
    </div>
  )
}

// ─── Small gradient swatch ────────────────────────────────────────

function FrameSwatch({ gradient, glowColor }: { gradient: string; glowColor: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 20,
        height: 20,
        borderRadius: '50%',
        background: gradient,
        boxShadow: `0 0 6px 1px ${glowColor}`,
        flexShrink: 0,
      }}
      aria-hidden="true"
    />
  )
}

// ─── Nav card ────────────────────────────────────────────────────

function NavCard({
  label,
  value,
  href,
  prefix,
}: {
  label: string
  value: React.ReactNode
  href: string
  prefix?: React.ReactNode
}) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => router.push(href)}
      className="w-full text-left"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        background: '#18181b',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 14,
        padding: '14px 16px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'background 0.15s ease',
      }}
      onPointerEnter={e => {
        ;(e.currentTarget as HTMLButtonElement).style.background = '#1f1f23'
      }}
      onPointerLeave={e => {
        ;(e.currentTarget as HTMLButtonElement).style.background = '#18181b'
      }}
    >
      {prefix && <div style={{ flexShrink: 0 }}>{prefix}</div>}

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            color: '#71717a',
            textTransform: 'uppercase',
            marginBottom: 3,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: '#e4e4e7',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {value}
        </div>
      </div>

      <div style={{ color: '#52525b', flexShrink: 0 }}>
        <ChevronRight />
      </div>
    </button>
  )
}

// ─── Main page ────────────────────────────────────────────────────

export default function CustomizePage() {
  const router = useRouter()
  const [state, setState] = useState<EngagementState | null>(null)
  const [titleText, setTitleText] = useState<string | null>(null)

  useEffect(() => {
    const s = loadState()
    setState(s)
    const sel = loadTitleSelection()
    const txt = buildTitleText(sel.prefixId, sel.suffixId)
    setTitleText(txt)
  }, [])

  const equippedFrame = state?.equippedFrameId
    ? FRAME_MAP[state.equippedFrameId] ?? null
    : null

  const equippedBadges = (state?.equippedBadgeIds ?? [])
    .map(id => BADGE_MAP[id])
    .filter(Boolean)

  const frameLabel =
    equippedFrame && !equippedFrame.isDefault ? equippedFrame.label : 'なし'
  const badgeDisplay =
    equippedBadges.length > 0
      ? equippedBadges.map(b => b.emoji).join('  ')
      : '未設定'
  const titleDisplay = titleText ?? '未設定'

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: '#09090b',
        color: '#e4e4e7',
        fontFamily:
          "'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Noto Sans JP', system-ui, sans-serif",
        WebkitFontSmoothing: 'antialiased',
        maxWidth: 430,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '16px 20px 12px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          position: 'sticky',
          top: 0,
          background: '#09090b',
          zIndex: 10,
        }}
      >
        <button
          type="button"
          onClick={() => router.push('/mypage')}
          aria-label="マイページに戻る"
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: 'none',
            borderRadius: 10,
            width: 36,
            height: 36,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#a1a1aa',
            cursor: 'pointer',
            flexShrink: 0,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <BackArrow />
        </button>
        <h1
          style={{
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: '0.02em',
            margin: 0,
            color: '#f4f4f5',
          }}
        >
          プロフィール装飾
        </h1>
      </header>

      <div style={{ padding: '24px 20px 40px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Profile preview card */}
        <section>
          <div
            style={{
              background: '#18181b',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 20,
              padding: '28px 20px 22px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* Avatar */}
            <Avatar frameId={state?.equippedFrameId ?? null} size={80} />

            {/* Badges row */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                minHeight: 26,
                alignItems: 'center',
              }}
            >
              {equippedBadges.length > 0 ? (
                equippedBadges.map(badge => (
                  <span
                    key={badge.id}
                    title={badge.label}
                    style={{
                      fontSize: 20,
                      lineHeight: 1,
                      filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
                    }}
                  >
                    {badge.emoji}
                  </span>
                ))
              ) : (
                <span style={{ fontSize: 12, color: '#52525b' }}>バッジなし</span>
              )}
            </div>

            {/* Nickname */}
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: '#f4f4f5',
                letterSpacing: '0.01em',
              }}
            >
              あなたのニックネーム
            </div>

            {/* Title */}
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                color:
                  titleText
                    ? 'rgba(251,191,36,0.9)'
                    : '#52525b',
                letterSpacing: '0.05em',
                background:
                  titleText
                    ? 'rgba(251,191,36,0.08)'
                    : 'transparent',
                padding: titleText ? '3px 10px' : '0',
                borderRadius: 20,
                border: titleText
                  ? '1px solid rgba(251,191,36,0.18)'
                  : 'none',
              }}
            >
              {titleDisplay === '未設定' ? '称号未設定' : titleDisplay}
            </div>

            {/* Preview label */}
            <div
              style={{
                marginTop: 4,
                fontSize: 10,
                letterSpacing: '0.1em',
                color: '#3f3f46',
                textTransform: 'uppercase',
                fontWeight: 600,
              }}
            >
              プレビュー（実際の表示イメージ）
            </div>
          </div>
        </section>

        {/* Navigation sections */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Frame */}
          <NavCard
            label="フレーム"
            href="/mypage/frames"
            prefix={
              equippedFrame && !equippedFrame.isDefault ? (
                <FrameSwatch
                  gradient={equippedFrame.cssGradient}
                  glowColor={equippedFrame.glowColor}
                />
              ) : (
                <span
                  style={{
                    display: 'inline-block',
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#27272a',
                    border: '1.5px solid #3f3f46',
                    flexShrink: 0,
                  }}
                />
              )
            }
            value={frameLabel}
          />

          {/* Badges */}
          <NavCard
            label="バッジ"
            href="/mypage/badges"
            value={
              equippedBadges.length > 0 ? (
                <span style={{ letterSpacing: '0.1em' }}>{badgeDisplay}</span>
              ) : (
                <span style={{ color: '#52525b' }}>未設定</span>
              )
            }
          />

          {/* Title */}
          <NavCard
            label="称号"
            href="/mypage/titles"
            value={
              titleText ? (
                <span style={{ color: 'rgba(251,191,36,0.85)' }}>{titleText}</span>
              ) : (
                <span style={{ color: '#52525b' }}>未設定</span>
              )
            }
          />
        </section>
      </div>
    </div>
  )
}
