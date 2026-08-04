'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  loadState, saveState,
  type EngagementState, type StoredDraw,
} from '@/lib/engagement-storage'
import {
  executeSingleDraw, executeTenDraws, applyDrawResults,
  type SingleDrawResult,
} from '@/lib/mock-lucky-draw'

// ─── Constants ────────────────────────────────────────────────────

const ANIM_STANDARD = 10000
const ANIM_SHORT    = 3000
const SKIP_DELAY    = 1000

// step durations (ms) for 10-second sequence
const STEPS_STD = [0, 1200, 2600, 4000, 5400, 6600, 7600, 8600, 9600]
// compressed to ~3 seconds
const STEPS_SHORT = STEPS_STD.map(t => Math.round(t * 0.3))

type DrawPhase  = 'idle' | 'animating' | 'result'
type AnimStep   = 0|1|2|3|4|5|6|7|8 // 8 = complete
type ForcedRarity = 'none' | 'miss' | 'normal' | 'rare' | 'legend'

// ─── Heart colour by rarity ───────────────────────────────────────

const HEART_COLOR: Record<string, string> = {
  miss:   '#d1d5db',
  normal: '#f472b6',
  rare:   '#a855f7',
  legend: '#fbbf24',
}
// 3段階カラー変化: 白 → 中間 → フルレアリティ
const HEART_MID_COLOR: Record<string, string> = {
  miss:   '#e5e7eb',
  normal: '#fbcfe8',
  rare:   '#c4b5fd',
  legend: '#fde68a',
}
const HEART_GLOW: Record<string, string> = {
  miss:   'rgba(209,213,219,0.3)',
  normal: 'rgba(244,114,182,0.5)',
  rare:   'rgba(168,85,247,0.6)',
  legend: 'rgba(251,191,36,0.8)',
}
const RARITY_LABEL: Record<string, string> = {
  miss: 'はずれ', normal: 'ノーマル', rare: 'レア', legend: 'レジェンド',
}
const RARITY_BORDER: Record<string, string> = {
  miss:   'border-zinc-700',
  normal: 'border-pink-400',
  rare:   'border-purple-500',
  legend: 'border-amber-400',
}
const RARITY_BG: Record<string, string> = {
  miss:   'bg-zinc-900',
  normal: 'bg-pink-950/40',
  rare:   'bg-purple-950/50',
  legend: 'bg-amber-950/40',
}
const RARITY_BADGE: Record<string, string> = {
  miss:   'bg-zinc-800 text-zinc-500',
  normal: 'bg-pink-900 text-pink-300',
  rare:   'bg-purple-900 text-purple-300',
  legend: 'bg-amber-900 text-amber-300',
}

// ─── SVG helpers ──────────────────────────────────────────────────

function HeartSVG({ color, size = 48, glow = '' }: { color: string; size?: number; glow?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{ filter: glow ? `drop-shadow(0 0 12px ${glow})` : undefined }}>
      <path
        d="M50 85 C50 85 10 55 10 30 C10 15 20 5 35 5 C42 5 48 10 50 15 C52 10 58 5 65 5 C80 5 90 15 90 30 C90 55 50 85 50 85Z"
        fill={color}
        style={{ transition: 'fill 0.65s ease-in-out' }}
      />
    </svg>
  )
}

// Simple silhouette: male or female
function SilhouetteSVG({ type, height = 120, opacity = 1 }: { type: 'male'|'female'; height?: number; opacity?: number }) {
  const w = type === 'male' ? 48 : 42
  const h = height
  // 男=青系、女=ピンク系
  const bodyColor  = type === 'male' ? '#1e3a5f' : '#4a1030'
  const accentColor= type === 'male' ? '#2563a8' : '#9d174d'
  const headColor  = type === 'male' ? '#1e40af' : '#be185d'
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none" style={{ opacity }}>
      <ellipse cx={w/2} cy={12} rx={9} ry={10} fill={headColor} fillOpacity={0.85} />
      {type === 'male' ? (
        <>
          <path d={`M4 32 Q${w/2} 26 ${w-4} 32 L${w-6} ${h} L6 ${h}Z`} fill={bodyColor} />
          {/* スーツのライン */}
          <line x1={w/2} y1={32} x2={w/2} y2={h-36} stroke={accentColor} strokeWidth={1.5} strokeOpacity={0.5} />
          <rect x={10} y={h-36} width={11} height={36} rx={4} fill={bodyColor} />
          <rect x={w-21} y={h-36} width={11} height={36} rx={4} fill={bodyColor} />
        </>
      ) : (
        <>
          <path d={`M8 30 Q${w/2} 25 ${w-8} 30 L${w-2} ${h} L2 ${h}Z`} fill={bodyColor} />
          {/* ドレス裾フレア */}
          <path d={`M5 ${h-34} Q${w/2} ${h-22} ${w-5} ${h-34} L${w-1} ${h} L1 ${h}Z`} fill={accentColor} fillOpacity={0.5} />
        </>
      )}
    </svg>
  )
}

// ─── 木製彫刻扉 ───────────────────────────────────────────────────

const WD = '#3A1608'  // 最暗部・影
const WB = '#6B3015'  // 基本木色
const WM = '#8B4A20'  // 中間
const WL = '#A85C2A'  // 明るめ
const WH = '#C87535'  // ハイライト
const GD = '#7A5C00'  // 金・影
const GB = '#B8860B'  // 金・基本
const GL = '#DAA520'  // 金・明
const GH = '#FFD700'  // 金・最明

function CarvedPanel({ x, y, w, h, children }: {
  x: number; y: number; w: number; h: number; children?: React.ReactNode
}) {
  return (
    <g>
      <rect x={x}   y={y}   width={w}   height={h}   rx={5} fill={WD} />
      <rect x={x+3} y={y+3} width={w-6} height={h-6} rx={4} fill="#1E0803" />
      <rect x={x+8} y={y+8} width={w-16} height={h-16} rx={3} fill={WM} />
      <rect x={x+8}    y={y+8}    width={w-16} height={3}    rx={1} fill={WH} fillOpacity={0.35} />
      <rect x={x+8}    y={y+8}    width={3}    height={h-16} rx={1} fill={WH} fillOpacity={0.2} />
      <rect x={x+8}    y={y+h-16} width={w-16} height={3}    rx={1} fill={WD} fillOpacity={0.5} />
      <rect x={x+w-11} y={y+8}    width={3}    height={h-16} rx={1} fill={WD} fillOpacity={0.4} />
      {children}
    </g>
  )
}

function Knocker({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy-8} rx={22} ry={26} fill={GD} />
      <ellipse cx={cx} cy={cy-8} rx={20} ry={24} fill={GB} />
      <ellipse cx={cx} cy={cy-8} rx={17} ry={20} fill={GL} />
      {/* ライオン顔 */}
      <circle cx={cx} cy={cy-12} r={10} fill={GB} />
      <circle cx={cx} cy={cy-12} r={7}  fill={GL} />
      <circle cx={cx-3} cy={cy-15} r={2}  fill={GD} />
      <circle cx={cx+3} cy={cy-15} r={2}  fill={GD} />
      <ellipse cx={cx} cy={cy-10} rx={9} ry={5} fill={GB} fillOpacity={0.5} />
      <path d={`M${cx-4} ${cy-9} Q${cx} ${cy-6} ${cx+4} ${cy-9}`} stroke={GD} strokeWidth={1.5} fill="none" />
      {/* リング */}
      <circle cx={cx} cy={cy+14} r={15} fill="none" stroke={GD} strokeWidth={7} />
      <circle cx={cx} cy={cy+14} r={15} fill="none" stroke={GL} strokeWidth={4.5} />
      <circle cx={cx} cy={cy+14} r={15} fill="none" stroke={GH} strokeWidth={1.5} />
      {/* リング下部の止め具 */}
      <ellipse cx={cx} cy={cy-1} rx={5} ry={4} fill={GL} />
    </g>
  )
}

// 鳥の彫刻（羽を広げた鳥シルエット）
function BirdCarving({ cx, cy, flip }: { cx: number; cy: number; flip?: boolean }) {
  const s = flip ? -1 : 1
  return (
    <g transform={`translate(${cx} ${cy}) scale(${s} 1)`}>
      {/* 翼 */}
      <path d="M0 0 Q-18 -14 -35 -6 Q-22 2 -8 0Z" fill={WD} fillOpacity={0.55} />
      <path d="M0 0 Q-15 -8 -28 2 Q-16 8 -6 4Z"   fill={WD} fillOpacity={0.4} />
      {/* 胴体 */}
      <ellipse cx={4} cy={0} rx={7} ry={5} fill={WD} fillOpacity={0.6} />
      {/* 尾羽 */}
      <path d="M8 2 Q18 6 16 14 Q10 10 8 2Z" fill={WD} fillOpacity={0.5} />
      {/* 頭 */}
      <circle cx={-1} cy={-6} r={4} fill={WD} fillOpacity={0.6} />
      {/* くちばし */}
      <path d="M-3 -7 L-8 -9 L-4 -5Z" fill={WD} fillOpacity={0.5} />
    </g>
  )
}

// 花紋彫刻
function FloralCarving({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {[0,45,90,135,180,225,270,315].map((a, i) => {
        const r = (a * Math.PI) / 180
        const ex = cx + Math.cos(r) * 22
        const ey = cy + Math.sin(r) * 22
        return <ellipse key={i} cx={ex} cy={ey} rx={11} ry={6}
          transform={`rotate(${a} ${ex} ${ey})`} fill={WD} fillOpacity={0.4} />
      })}
      {[0,60,120,180,240,300].map((a, i) => {
        const r = (a * Math.PI) / 180
        const ex = cx + Math.cos(r) * 11
        const ey = cy + Math.sin(r) * 11
        return <circle key={i} cx={ex} cy={ey} r={4} fill={WH} fillOpacity={0.2} />
      })}
      <circle cx={cx} cy={cy} r={10} fill={WD} fillOpacity={0.45} />
      <circle cx={cx} cy={cy} r={6}  fill={WH} fillOpacity={0.2} />
    </g>
  )
}

// 象の彫刻
function ElephantCarving({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx}    cy={cy+10} rx={28} ry={20} fill={WD} fillOpacity={0.5} />
      <circle  cx={cx}    cy={cy-10} r={17}           fill={WD} fillOpacity={0.5} />
      <ellipse cx={cx+18} cy={cy-6}  rx={11} ry={15}  fill={WD} fillOpacity={0.35} />
      <path d={`M${cx-8} ${cy-2} Q${cx-22} ${cy+14} ${cx-16} ${cy+30}`}
        stroke={WD} strokeWidth={8} strokeOpacity={0.45} fill="none" strokeLinecap="round" />
      <path d={`M${cx+6} ${cy-4} Q${cx+24} ${cy} ${cx+26} ${cy+16}`}
        stroke={GL} strokeWidth={3} strokeOpacity={0.55} fill="none" strokeLinecap="round" />
      {[-18,-6,6,18].map((dx, i) => (
        <rect key={i} x={cx+dx-5} y={cy+28} width={9} height={16} rx={4} fill={WD} fillOpacity={0.45} />
      ))}
    </g>
  )
}

// ダイヤ格子紋
function DiamondPattern({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      {[-2,-1,0,1,2].flatMap(col => [-1,0,1].map(row => {
        const bx = cx + col * 28
        const by = cy + row * 22
        return <path key={`${col},${row}`}
          d={`M${bx} ${by-9} L${bx+11} ${by} L${bx} ${by+9} L${bx-11} ${by}Z`}
          fill={WD} fillOpacity={0.35} />
      }))}
    </g>
  )
}

// 扉1枚分
function DoorLeaf({ lx, hingeRight }: { lx: number; hingeRight: boolean }) {
  const LW = 183
  const cx = lx + LW / 2

  return (
    <g>
      {/* 基本木地 */}
      <rect x={lx} y={0} width={LW} height={760} fill={WB} />
      {/* 木目縦線 */}
      {[20,36,55,74,90,108,125,142,160,175].map((xo, i) => (
        <rect key={i} x={lx+xo} y={0} width={2} height={760} fill={WH} fillOpacity={0.04+0.015*(i%3)} />
      ))}
      {/* 蝶番側ハイライト */}
      <rect x={hingeRight ? lx+LW-10 : lx} y={0} width={10} height={760} fill={WH} fillOpacity={0.12} />
      {/* 合わせ面シャドウ */}
      <rect x={hingeRight ? lx : lx+LW-7} y={0} width={7} height={760} fill={WD} fillOpacity={0.5} />

      {/* ─ 彫刻パネル ─ */}

      {/* 1: 鳥パネル（上） */}
      <CarvedPanel x={lx+10} y={12} w={LW-20} h={110}>
        <BirdCarving cx={cx-24} cy={67} />
        <BirdCarving cx={cx+24} cy={67} flip />
        <circle cx={cx} cy={57} r={12} fill={WD} fillOpacity={0.35} />
        <circle cx={cx} cy={57} r={7}  fill={WH} fillOpacity={0.18} />
        {[0,90,180,270].map(a => {
          const r = a*Math.PI/180
          return <circle key={a} cx={cx+Math.cos(r)*12} cy={57+Math.sin(r)*12} r={3} fill={WH} fillOpacity={0.2} />
        })}
      </CarvedPanel>

      {/* 2: 花紋パネル */}
      <CarvedPanel x={lx+10} y={130} w={LW-20} h={96}>
        <FloralCarving cx={cx} cy={178} />
      </CarvedPanel>

      {/* 3: ノッカーパネル */}
      <CarvedPanel x={lx+10} y={234} w={LW-20} h={148}>
        <Knocker cx={cx} cy={318} />
        {/* 上下装飾ライン */}
        <rect x={cx-30} y={248} width={60} height={4} rx={2} fill={WD} fillOpacity={0.35} />
        <rect x={cx-30} y={372} width={60} height={4} rx={2} fill={WD} fillOpacity={0.35} />
      </CarvedPanel>

      {/* 4: 象パネル */}
      <CarvedPanel x={lx+10} y={390} w={LW-20} h={118}>
        <ElephantCarving cx={cx} cy={447} />
      </CarvedPanel>

      {/* 5: 花紋パネル */}
      <CarvedPanel x={lx+10} y={516} w={LW-20} h={106}>
        <FloralCarving cx={cx} cy={569} />
      </CarvedPanel>

      {/* 6: 底面ダイヤ格子 */}
      <CarvedPanel x={lx+10} y={630} w={LW-20} h={118}>
        <DiamondPattern cx={cx} cy={689} />
      </CarvedPanel>
    </g>
  )
}

// 彫刻木製観音開き扉（画面いっぱい）
function DoorSVG({ openAngle }: { openAngle: number }) {
  const scale = Math.max(0.015, 1 - openAngle)
  return (
    <svg className="w-full h-full" viewBox="0 0 390 760" preserveAspectRatio="xMidYMid slice" fill="none">
      <defs>
        <linearGradient id="woodSheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor={WD}  stopOpacity="0.35" />
          <stop offset="40%"  stopColor={WH}   stopOpacity="0.06" />
          <stop offset="60%"  stopColor={WH}   stopOpacity="0.06" />
          <stop offset="100%" stopColor={WD}  stopOpacity="0.35" />
        </linearGradient>
      </defs>

      {/* 奥の暗闇（扉が開いたとき見える） */}
      <rect x={0} y={0} width={390} height={760} fill="#030303" />
      {/* 差し込む暖かい光 */}
      {openAngle > 0.05 && (
        <ellipse cx={195} cy={380} rx={180 * openAngle} ry={340 * openAngle}
          fill="#b45309" fillOpacity={openAngle * 0.18} />
      )}

      {/* 外枠装飾（額縁） */}
      <rect x={0}   y={0}   width={390} height={760} fill="#2A1005" />
      {/* 縦柱 */}
      <rect x={0}   y={0}   width={11}  height={760} fill={WD} />
      <rect x={379} y={0}   width={11}  height={760} fill={WD} />
      {/* 中央仕切り */}
      <rect x={190} y={0}   width={10}  height={760} fill={WD} />
      <rect x={192} y={0}   width={6}   height={760} fill={WB} fillOpacity={0.3} />
      {/* 上下横桟 */}
      <rect x={0}   y={0}   width={390} height={10}  fill={WD} />
      <rect x={0}   y={750} width={390} height={10}  fill={WD} />
      {/* 枠内の縦装飾ライン */}
      {[14,18,372,376].map((x,i) => (
        <rect key={i} x={x} y={10} width={2} height={740} fill={WH} fillOpacity={0.12} />
      ))}
      {/* 上下の彫刻ドット装飾 */}
      {[30,65,100,135,165,200,225,260,295,330,360].map((x,i) => (
        <g key={i}>
          <circle cx={x} cy={5}   r={3} fill={WH} fillOpacity={0.25} />
          <circle cx={x} cy={755} r={3} fill={WH} fillOpacity={0.25} />
        </g>
      ))}
      {[40,100,160,220,290,360,430,500,570,640,710].map((y,i) => (
        <g key={i}>
          <circle cx={5}   cy={y} r={3} fill={WH} fillOpacity={0.2} />
          <circle cx={385} cy={y} r={3} fill={WH} fillOpacity={0.2} />
        </g>
      ))}

      {/* 左扉葉 — 左端(x=11)が蝶番 */}
      <g style={{ transformOrigin: '11px 380px', transform: `scaleX(${scale})` }}>
        <DoorLeaf lx={11} hingeRight={false} />
        <rect x={11} y={0} width={179} height={760} fill="url(#woodSheen)" />
      </g>

      {/* 右扉葉 — 右端(x=379)が蝶番 */}
      <g style={{ transformOrigin: '379px 380px', transform: `scaleX(${scale})` }}>
        <DoorLeaf lx={200} hingeRight={true} />
        <rect x={200} y={0} width={179} height={760} fill="url(#woodSheen)" />
      </g>
    </svg>
  )
}

// Lounge interior background
function LoungeInteriorSVG() {
  return (
    <svg width="340" height="260" viewBox="0 0 340 260" fill="none">
      {/* floor */}
      <rect x={0} y={180} width={340} height={80} fill="#0a0a0b" />
      {/* bar counter back */}
      <rect x={0} y={60} width={340} height={120} fill="#0d0d0f" />
      {/* bar shelf */}
      <rect x={20} y={70} width={300} height={6} rx={2} fill="#1c1c1e" />
      <rect x={20} y={95} width={300} height={4} rx={2} fill="#1c1c1e" />
      {/* bottles silhouette */}
      {[40,65,88,108,128,160,180,200,225,248,270,290].map((x,i) => (
        <rect key={i} x={x} y={50} width={8} height={i%3===0?30:i%3===1?24:28} rx={3} fill="#1f1f21" />
      ))}
      {/* ambient light from bar */}
      <ellipse cx={170} cy={80} rx={120} ry={18} fill="#d97706" fillOpacity={0.04} />
      {/* floor table left */}
      <ellipse cx={60} cy={215} rx={35} ry={10} fill="#1a1a1c" />
      <rect x={56} y={185} width={8} height={30} rx={2} fill="#1c1c1e" />
      {/* floor table right */}
      <ellipse cx={280} cy={215} rx={35} ry={10} fill="#1a1a1c" />
      <rect x={276} y={185} width={8} height={30} rx={2} fill="#1c1c1e" />
      {/* candle glow */}
      <ellipse cx={60} cy={180} rx={12} ry={4} fill="#d97706" fillOpacity={0.2} />
      <ellipse cx={280} cy={180} rx={12} ry={4} fill="#d97706" fillOpacity={0.2} />
      {/* spotlight beam */}
      <path d="M170 0 L120 200 L220 200Z" fill="#fbbf24" fillOpacity={0.02} />
    </svg>
  )
}

// エキストラ群: 男=青、女=ピンク、奥ほど小さく・薄く
function CrowdSVG() {
  // [x, y_head, scale, type]  奥=小
  const extras: [number, number, number, 'male'|'female'][] = [
    // 奥の列（小・薄め）
    [30,  30, 0.55, 'male'],
    [55,  25, 0.50, 'female'],
    [80,  28, 0.52, 'male'],
    [108, 22, 0.48, 'female'],
    [195, 26, 0.50, 'male'],
    [220, 20, 0.46, 'female'],
    [248, 28, 0.53, 'male'],
    [275, 24, 0.49, 'female'],
    [300, 30, 0.52, 'male'],
    // 手前の列（大・はっきり）
    [15,  70, 0.72, 'female'],
    [50,  68, 0.75, 'male'],
    [88,  65, 0.70, 'female'],
    [120, 62, 0.68, 'male'],
    [215, 64, 0.71, 'male'],
    [248, 66, 0.74, 'female'],
    [280, 62, 0.70, 'male'],
    [310, 68, 0.73, 'female'],
  ]
  const maleBody  = '#1e3a5f'
  const femaleBody= '#4a1030'
  const maleHead  = '#1e40af'
  const femaleHead= '#be185d'
  const maleFill  = maleBody
  const femaleFill= femaleBody
  return (
    <svg width="340" height="200" viewBox="0 0 340 200" fill="none">
      {extras.map(([x, y, sc, type], i) => {
        const hc = type === 'male' ? maleHead : femaleHead
        const bc = type === 'male' ? maleFill : femaleFill
        const fc = type === 'male' ? '#2563a8' : '#9d174d'
        const w  = type === 'male' ? 28 : 24
        const bh = 70 * sc
        const hr = 9 * sc
        const opac = 0.35 + sc * 0.55
        return (
          <g key={i} transform={`translate(${x - w/2} ${y})`} opacity={opac}>
            {/* head */}
            <ellipse cx={w/2} cy={hr} rx={hr*0.9} ry={hr} fill={hc} fillOpacity={0.9} />
            {type === 'male' ? (
              <>
                <path d={`M${w*0.08} ${hr*2.8} Q${w/2} ${hr*2.2} ${w*0.92} ${hr*2.8} L${w*0.88} ${bh} L${w*0.12} ${bh}Z`} fill={bc} />
                <line x1={w/2} y1={hr*2.8} x2={w/2} y2={bh-bh*0.25} stroke={fc} strokeWidth={1} strokeOpacity={0.45} />
                <rect x={w*0.18} y={bh-bh*0.28} width={w*0.25} height={bh*0.28} rx={w*0.06} fill={bc} />
                <rect x={w*0.57} y={bh-bh*0.28} width={w*0.25} height={bh*0.28} rx={w*0.06} fill={bc} />
              </>
            ) : (
              <>
                <path d={`M${w*0.1} ${hr*2.6} Q${w/2} ${hr*2.1} ${w*0.9} ${hr*2.6} L${w*0.97} ${bh} L${w*0.03} ${bh}Z`} fill={bc} />
                <path d={`M${w*0.06} ${bh-bh*0.28} Q${w/2} ${bh-bh*0.18} ${w*0.94} ${bh-bh*0.28} L${w*0.97} ${bh} L${w*0.03} ${bh}Z`} fill={fc} fillOpacity={0.45} />
              </>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// Champagne tower silhouette (legend only)
function ChampagneTowerSVG({ visible }: { visible: boolean }) {
  return (
    <svg
      width="80" height="100" viewBox="0 0 80 100" fill="none"
      style={{
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.4s ease-in',
        filter: 'drop-shadow(0 0 14px rgba(251,191,36,0.9))',
      }}
    >
      {/* glasses tier 1 - top */}
      <path d="M32 12 L48 12 L44 28 L36 28Z" fill="#fbbf24" fillOpacity={0.7} />
      {/* glasses tier 2 */}
      <path d="M22 30 L58 30 L52 48 L28 48Z" fill="#fbbf24" fillOpacity={0.6} />
      {/* glasses tier 3 */}
      <path d="M10 50 L70 50 L62 70 L18 70Z" fill="#fbbf24" fillOpacity={0.5} />
      {/* base */}
      <rect x={25} y={70} width={30} height={6} rx={2} fill="#d97706" />
      {/* stems */}
      <rect x={38} y={28} width={4} height={4} rx={1} fill="#d97706" />
      <rect x={27} y={48} width={4} height={4} rx={1} fill="#d97706" />
      <rect x={49} y={48} width={4} height={4} rx={1} fill="#d97706" />
      {/* sparkle dots */}
      {[[20,20],[55,15],[15,45],[65,40]].map(([x,y],i)=>(
        <circle key={i} cx={x} cy={y} r={2} fill="#fef3c7" opacity={0.9} />
      ))}
    </svg>
  )
}

// Gold particles for legend
function GoldParticles() {
  const particles = Array.from({length:20}, (_,i) => ({
    x: Math.sin(i * 0.314) * 140 + 170,
    y: Math.cos(i * 0.314) * 140 + 220,
    r: 2 + (i % 3),
    delay: (i * 0.12).toFixed(2),
    dur: (1.2 + (i % 4) * 0.3).toFixed(1),
  }))
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 2 }}>
      {particles.map((p,i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#fbbf24"
          style={{ animation: `goldParticle ${p.dur}s ease-out ${p.delay}s both` }} />
      ))}
    </svg>
  )
}

// ─── RewardCard ──────────────────────────────────────────────────

function RewardCard({ result, index, reduced, isNew }: {
  result: SingleDrawResult; index: number; reduced: boolean; isNew: boolean
}) {
  const { reward, isDuplicate, duplicateJileage } = result
  const isLegend = reward.rarity === 'legend'
  const isRare   = reward.rarity === 'rare'
  const delay    = reduced ? 0 : index * 90
  return (
    <div
      className={`relative rounded-xl border-2 ${RARITY_BORDER[reward.rarity]} ${RARITY_BG[reward.rarity]}
        flex flex-col items-center justify-center p-3 gap-1 overflow-hidden min-h-[90px]`}
      style={{
        animation: reduced ? 'none' : `prizeReveal 0.4s ease-out ${delay}ms both`,
        boxShadow: isLegend ? '0 0 28px rgba(251,191,36,0.5)'
          : isRare ? '0 0 18px rgba(168,85,247,0.45)' : 'none',
      }}
    >
      {isLegend && !reduced && (
        <div className="absolute inset-0 rounded-xl" style={{ animation: 'goldPulse 2s ease-in-out infinite' }} />
      )}
      {isNew && !isDuplicate && reward.rarity !== 'miss' && (
        <span className="absolute top-1.5 left-1.5 text-[9px] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full tracking-wide z-10">
          NEW
        </span>
      )}
      <span className="text-3xl leading-none select-none relative z-10">{reward.emoji}</span>
      <span className="text-xs text-zinc-200 font-medium text-center leading-tight relative z-10">
        {reward.rarity === 'miss' ? 'はずれ +1J' : reward.label}
      </span>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full relative z-10 ${RARITY_BADGE[reward.rarity]}`}>
        {RARITY_LABEL[reward.rarity]}
      </span>
      {isDuplicate && reward.rarity !== 'miss' && (
        <div className="absolute inset-0 rounded-xl bg-black/75 flex flex-col items-center justify-center gap-0.5 z-20">
          <span className="text-[10px] text-zinc-400">すでに所持</span>
          <span className="text-xs text-amber-400 font-bold">+{duplicateJileage}J</span>
        </div>
      )}
    </div>
  )
}

// ─── CTASection ──────────────────────────────────────────────────

function CTASection({ results }: { results: SingleDrawResult[] }) {
  const hasFrame = results.some(r => !r.isDuplicate && r.reward.category === 'frame' && r.reward.rarity !== 'miss')
  const hasBadge = results.some(r => !r.isDuplicate && r.reward.category === 'badge' && r.reward.rarity !== 'miss')
  const hasTitle = results.some(r => !r.isDuplicate && r.reward.category === 'title_word' && r.reward.rarity !== 'miss')
  const jileageGained = results.reduce((s, r) => {
    if (r.reward.rarity === 'miss') return s + 1
    if (r.isDuplicate) return s + r.duplicateJileage
    return s
  }, 0)
  if (!hasFrame && !hasBadge && !hasTitle) return jileageGained > 0
    ? <p className="mt-4 text-xs text-amber-400 text-center">Jレージ +{jileageGained}J を獲得しました</p>
    : null
  return (
    <div className="mt-5 flex flex-col gap-2 w-full">
      <p className="text-xs text-zinc-500 text-center">獲得アイテムを設定する</p>
      {hasFrame && (
        <Link href="/mypage/frames" className="w-full py-3 rounded-xl bg-zinc-800 text-sm font-semibold text-white text-center active:bg-zinc-700 flex items-center justify-center gap-2">
          <span>🖼</span>フレームを設定する
        </Link>
      )}
      {hasBadge && (
        <Link href="/mypage/badges" className="w-full py-3 rounded-xl bg-zinc-800 text-sm font-semibold text-white text-center active:bg-zinc-700 flex items-center justify-center gap-2">
          <span>🏅</span>バッジを設定する
        </Link>
      )}
      {hasTitle && (
        <Link href="/mypage/titles/edit" className="w-full py-3 rounded-xl bg-zinc-800 text-sm font-semibold text-white text-center active:bg-zinc-700 flex items-center justify-center gap-2">
          <span>✨</span>称号を設定する
        </Link>
      )}
      {jileageGained > 0 && (
        <p className="text-xs text-amber-400 text-center">Jレージ +{jileageGained}J を獲得しました</p>
      )}
    </div>
  )
}

// ─── DrawAnimation ───────────────────────────────────────────────
// Pure CSS + SVG animation sequence: 運命の出会い

function DrawAnimation({
  rarity, shortMode, reduced, onComplete,
}: {
  rarity: 'miss'|'normal'|'rare'|'legend'
  shortMode: boolean
  reduced: boolean
  onComplete: () => void
}) {
  const [step, setStep] = useState<AnimStep>(0)
  const [doorAngle, setDoorAngle] = useState(0)
  const [showChampagne, setShowChampagne] = useState(false)
  const [flash, setFlash] = useState(false)
  const [heartDisplayColor, setHeartDisplayColor] = useState('#ffffff')
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const steps = shortMode ? STEPS_SHORT : STEPS_STD
  const hColor = HEART_COLOR[rarity]
  const hGlow  = HEART_GLOW[rarity]

  // ハート出現時: 白 → 中間色 → フルレアリティ の3段階
  useEffect(() => {
    if (step !== 5) return
    setHeartDisplayColor('#ffffff')
    const t1 = setTimeout(() => setHeartDisplayColor(HEART_MID_COLOR[rarity] ?? hColor), shortMode ? 300 : 700)
    const t2 = setTimeout(() => setHeartDisplayColor(hColor),                              shortMode ? 600 : 1400)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [step, rarity, hColor, shortMode])

  useEffect(() => {
    if (reduced) { onComplete(); return }

    function at(t: number, fn: () => void) {
      const id = setTimeout(fn, t)
      timers.current.push(id)
    }

    // door swings open — ease-out quad で自然な減速
    const doorDur = steps[1] - steps[0]
    for (let i = 0; i <= 30; i++) {
      const t = steps[0] + (doorDur * i) / 30
      const linear = i / 30
      // ease-out cubic: 速く始まり最後にゆっくり止まる
      const eased = 1 - Math.pow(1 - linear, 3)
      at(t, () => setDoorAngle(eased))
    }

    at(steps[1], () => setStep(1)) // interior visible
    at(steps[2], () => setStep(2)) // zoom to couple
    at(steps[3], () => setStep(3)) // approach
    at(steps[4], () => setStep(4)) // pause before touch
    at(steps[5], () => {           // touch + heart
      setStep(5)
      if (rarity === 'legend') setShowChampagne(true)
      if (rarity === 'legend') {
        at(200, () => setFlash(true))
        at(600, () => setFlash(false))
      }
    })
    at(steps[6], () => setStep(6)) // heart zoom
    at(steps[7], () => setStep(7)) // burst
    at(steps[8], () => onComplete())

    return () => timers.current.forEach(clearTimeout)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Legend flash overlay
  const flashOverlay = flash ? (
    <div className="absolute inset-0 bg-amber-200/30 z-50 pointer-events-none" style={{ animation: 'flashIn 0.3s ease-out both' }} />
  ) : null

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden select-none">
      {flashOverlay}

      {/* Step 0–1: Door scene */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          opacity: step <= 1 ? 1 : 0,
          transition: step === 2 ? 'opacity 0.8s ease-in-out' : 'none',
          pointerEvents: 'none',
        }}
      >
        {/* ambient bar light */}
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 30% at 50% 65%, rgba(161,103,27,0.08) 0%, transparent 70%)' }} />
        <div className="absolute inset-0">
          <DoorSVG openAngle={doorAngle} />
        </div>
        {/* "JIS Lounge" floor text */}
        <p style={{
          position: 'relative', zIndex: 2,
          opacity: doorAngle > 0.3 ? Math.min(1, (doorAngle - 0.3) / 0.4) : 0,
          transition: 'opacity 0.3s',
          color: '#52525b',
          fontSize: 11,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          marginTop: 16,
        }}>
          JIS Lounge
        </p>
      </div>

      {/* Step 1–4: Lounge interior + crowd + couple approach */}
      <div
        className="absolute inset-0 flex flex-col items-end justify-center"
        style={{
          opacity: step >= 1 && step <= 4 ? 1 : 0,
          transition: `opacity ${step === 1 ? '0.6s' : step >= 5 ? '0.6s' : '0.3s'} ease-in-out`,
          pointerEvents: 'none',
        }}
      >
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <LoungeInteriorSVG />
        </div>
        <div className="absolute inset-0 flex items-center justify-center" style={{ paddingBottom: 60 }}>
          <CrowdSVG />
        </div>

        {/* Couple – male left, female right – walk toward each other */}
        {/* At step 1-2: far apart. step 3: closer. step 4: very close */}
        {(() => {
          const gapMap: Record<number, number> = { 0: 160, 1: 160, 2: 100, 3: 44, 4: 20, 5: 20 }
          const gap = gapMap[Math.min(step, 5)] ?? 20
          const transitionDur = step === 3 ? '1.4s' : step === 4 ? '1.0s' : '0.4s'
          return (
            <div
              className="absolute flex items-end justify-center"
              style={{ bottom: 60, left: 0, right: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap, transition: `gap ${transitionDur} cubic-bezier(0.25,0.1,0.25,1)` }}>
                <div style={{ transition: `transform ${transitionDur} ease-in-out`, transform: step >= 4 ? 'translateX(4px)' : 'none' }}>
                  <SilhouetteSVG type="male" height={130} />
                </div>
                <div style={{ transition: `transform ${transitionDur} ease-in-out`, transform: step >= 4 ? 'translateX(-4px)' : 'none' }}>
                  <SilhouetteSVG type="female" height={118} />
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Champagne tower (legend only) */}
      {rarity === 'legend' && (
        <div className="absolute z-20" style={{ bottom: 80, right: '18%' }}>
          <ChampagneTowerSVG visible={showChampagne} />
        </div>
      )}

      {/* Step 5: Heart appear (fingertips touch) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{
          opacity: step >= 5 && step <= 6 ? 1 : 0,
          transition: `opacity 0.4s ease-in-out`,
          pointerEvents: 'none',
          zIndex: 10,
        }}
      >
        {/* Faded couple behind heart */}
        <div className="absolute flex items-end justify-center" style={{ bottom: 60, left: 0, right: 0, opacity: 0.35 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 18 }}>
            <SilhouetteSVG type="male" height={130} />
            <SilhouetteSVG type="female" height={118} />
          </div>
        </div>

        {/* Heart beat-in */}
        <div
          style={{
            animation: step >= 5 && !reduced ? 'heartAppear 0.55s cubic-bezier(0.175,0.885,0.32,1.275) both' : 'none',
            filter: `drop-shadow(0 0 20px ${hGlow})`,
            marginBottom: 40,
          }}
        >
          <HeartSVG color={heartDisplayColor} size={step >= 6 ? 80 : 64} glow={hGlow} />
        </div>

        {rarity === 'legend' && (
          <GoldParticles />
        )}

      </div>

      {/* Step 6–7: Heart zoom to centre */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          opacity: step >= 6 ? 1 : 0,
          transition: 'opacity 0.4s ease-in',
          pointerEvents: 'none',
          zIndex: 20,
          background: step >= 6 ? 'radial-gradient(ellipse 50% 50% at 50% 50%, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.95) 100%)' : 'transparent',
        }}
      >
        <div style={{
          animation: step >= 6 && !reduced ? 'heartZoom 1.0s cubic-bezier(0.23,1,0.32,1) both' : 'none',
          filter: `drop-shadow(0 0 40px ${hGlow})`,
        }}>
          <HeartSVG color={heartDisplayColor} size={step >= 7 ? 200 : 120} glow={hGlow} />
        </div>

        {rarity === 'legend' && step >= 6 && (
          <>
            <GoldParticles />
            {/* extra full-screen gold shimmer */}
            <div className="absolute inset-0" style={{
              background: `radial-gradient(ellipse 70% 70% at 50% 50%, ${hGlow} 0%, transparent 70%)`,
              animation: 'goldScreenGlow 1.5s ease-in-out infinite',
              pointerEvents: 'none',
            }} />
          </>
        )}
      </div>

      {/* Step 7: Burst flash */}
      {step >= 7 && (
        <div className="absolute inset-0 z-30 pointer-events-none"
          style={{ background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${hGlow} 0%, transparent 70%)`, animation: 'burstFlash 0.5s ease-out both' }} />
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────

export default function LuckyDrawPage() {
  const router = useRouter()
  const [state, setState]       = useState<EngagementState | null>(null)
  const [phase, setPhase]       = useState<DrawPhase>('idle')
  const [results, setResults]   = useState<SingleDrawResult[]>([])
  const [topRarity, setTopRarity] = useState<'miss'|'normal'|'rare'|'legend'>('miss')
  const [showSkip, setShowSkip] = useState(false)
  const [reduced, setReduced]   = useState(false)
  // dev panel
  const [devMode, setDevMode]       = useState(false)
  const [shortAnim, setShortAnim]   = useState(false)
  const [forcedRarity, setForcedRarity] = useState<ForcedRarity>('none')
  const tapCount = useRef(0)
  const tapTimer = useRef<ReturnType<typeof setTimeout>|null>(null)
  const skipTimer = useRef<ReturnType<typeof setTimeout>|null>(null)

  useEffect(() => {
    setState(loadState())
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    if (typeof window !== 'undefined' && window.location.search.includes('dev=1')) setDevMode(true)
  }, [])

  function handleTitleTap() {
    tapCount.current += 1
    if (tapTimer.current) clearTimeout(tapTimer.current)
    tapTimer.current = setTimeout(() => { tapCount.current = 0 }, 1500)
    if (tapCount.current >= 7) { tapCount.current = 0; setDevMode(v => !v) }
  }

  function resolveTopRarity(drawResults: SingleDrawResult[]): 'miss'|'normal'|'rare'|'legend' {
    if (drawResults.some(r => r.reward.rarity === 'legend')) return 'legend'
    if (drawResults.some(r => r.reward.rarity === 'rare'))   return 'rare'
    if (drawResults.some(r => r.reward.rarity === 'normal')) return 'normal'
    return 'miss'
  }

  const startDraw = useCallback((
    drawFn: (owned: string[]) => SingleDrawResult[],
    costType: 'ticket1'|'ticket10'|'jileage500'|'jileage5000',
    drawType: StoredDraw['drawType'],
  ) => {
    if (!state || phase === 'animating') return
    let next = { ...state }
    if (costType === 'ticket1')      next = { ...next, tickets: next.tickets - 1 }
    else if (costType === 'ticket10')     next = { ...next, tickets: next.tickets - 10 }
    else if (costType === 'jileage500')   next = { ...next, jileage: next.jileage - 500 }
    else if (costType === 'jileage5000')  next = { ...next, jileage: next.jileage - 5000 }

    const owned = [...next.ownedFrameIds, ...next.ownedBadgeIds]
    let drawResults: SingleDrawResult[]

    if (forcedRarity !== 'none') {
      const forced: Record<ForcedRarity, SingleDrawResult> = {
        none: { reward: { id:'miss', category:'miss', label:'はずれ', rarity:'miss', emoji:'💨' }, isDuplicate:false, duplicateJileage:0 },
        miss: { reward: { id:'miss', category:'miss', label:'はずれ', rarity:'miss', emoji:'💨' }, isDuplicate:false, duplicateJileage:0 },
        normal: { reward: { id:'frame_silver', category:'frame', label:'シルバーフレーム', rarity:'normal', emoji:'🪞', refId:'frame_silver' }, isDuplicate: owned.includes('frame_silver'), duplicateJileage: owned.includes('frame_silver') ? 10 : 0 },
        rare:   { reward: { id:'frame_aurora', category:'frame', label:'オーロラフレーム', rarity:'rare', emoji:'🌌', refId:'frame_aurora' }, isDuplicate: owned.includes('frame_aurora'), duplicateJileage: owned.includes('frame_aurora') ? 100 : 0 },
        legend: { reward: { id:'frame_legend_gold', category:'frame', label:'レジェンドゴールドフレーム', rarity:'legend', emoji:'👑', refId:'frame_legend_gold' }, isDuplicate: owned.includes('frame_legend_gold'), duplicateJileage: owned.includes('frame_legend_gold') ? 500 : 0 },
      }
      drawResults = [forced[forcedRarity]]
    } else {
      drawResults = drawFn(owned)
    }

    setResults(drawResults)
    setTopRarity(resolveTopRarity(drawResults))

    const applied = applyDrawResults(next, drawResults, drawType)
    saveState(applied)
    setState(applied)

    if (reduced) {
      setPhase('result')
      return
    }

    setPhase('animating')
    setShowSkip(false)
    skipTimer.current = setTimeout(() => setShowSkip(true), SKIP_DELAY)
  }, [state, phase, reduced, forcedRarity])

  const onAnimComplete = useCallback(() => {
    setPhase('result')
    setShowSkip(false)
    if (skipTimer.current) clearTimeout(skipTimer.current)
  }, [])

  const skipAnim = useCallback(() => {
    if (skipTimer.current) clearTimeout(skipTimer.current)
    setPhase('result')
    setShowSkip(false)
  }, [])

  const closeResult = useCallback(() => {
    setPhase('idle'); setResults([])
  }, [])

  function devAddTickets(amount = 5) { if (!state) return; const n = { ...state, tickets: state.tickets + amount }; saveState(n); setState(n) }
  function devAddJileage() { if (!state) return; const n = { ...state, jileage: state.jileage + 5000 }; saveState(n); setState(n) }
  function devReset() {
    if (typeof window === 'undefined') return
    localStorage.removeItem('jis_engagement_v1')
    window.location.reload()
  }

  if (!state) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const canT1  = state.tickets >= 1  && phase !== 'animating'
  const canT10 = state.tickets >= 10 && phase !== 'animating'
  const canJ1  = state.jileage >= 500  && phase !== 'animating'
  const canJ10 = state.jileage >= 5000 && phase !== 'animating'
  const newIds = new Set(state.newItemIds)

  return (
    <>
      <style>{`
        @keyframes prizeReveal {
          0%{opacity:0;transform:scale(0.5) rotate(-10deg)}
          60%{transform:scale(1.1) rotate(2deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes heartAppear {
          0%{opacity:0;transform:scale(0.2) rotate(-15deg)}
          70%{transform:scale(1.15) rotate(5deg)}
          100%{opacity:1;transform:scale(1) rotate(0)}
        }
        @keyframes heartZoom {
          0%{transform:scale(1)}
          100%{transform:scale(2.2)}
        }
        @keyframes burstFlash {
          0%{opacity:0.9}
          100%{opacity:0}
        }
        @keyframes flashIn {
          0%{opacity:0}50%{opacity:1}100%{opacity:0}
        }
        @keyframes fadeInUp {
          from{opacity:0;transform:translateY(16px)}
          to{opacity:1;transform:translateY(0)}
        }
        @keyframes goldPulse {
          0%,100%{opacity:0.6;box-shadow:0 0 20px rgba(251,191,36,0.35)}
          50%{opacity:1;box-shadow:0 0 70px rgba(251,191,36,1)}
        }
        @keyframes goldParticle {
          0%{opacity:1;transform:translate(0,0) scale(1)}
          100%{opacity:0;transform:translate(var(--tx,20px),var(--ty,-40px)) scale(0.3)}
        }
        @keyframes goldScreenGlow {
          0%,100%{opacity:0.3}
          50%{opacity:0.7}
        }
        @keyframes shimmer {
          0%{background-position:-200% center}
          100%{background-position:200% center}
        }
        .shimmer-gold {
          background: linear-gradient(90deg,#92400e,#d97706,#fef3c7,#d97706,#92400e);
          background-size:200% auto;
          -webkit-background-clip:text;
          -webkit-text-fill-color:transparent;
          background-clip:text;
          animation:shimmer 2.5s linear infinite;
        }
        @media (prefers-reduced-motion:reduce){
          .shimmer-gold{animation:none;}
        }
      `}</style>

      {/* ── Animation overlay ───────────────────────────────────── */}
      {phase === 'animating' && (
        <>
          <DrawAnimation
            rarity={topRarity}
            shortMode={shortAnim}
            reduced={reduced}
            onComplete={onAnimComplete}
          />
          {showSkip && (
            <button
              onClick={skipAnim}
              className="fixed top-12 right-5 z-[60] px-4 py-1.5 rounded-full bg-zinc-800/90 text-zinc-300 text-sm font-medium border border-zinc-700 active:bg-zinc-700 transition-colors"
              style={{ animation: 'fadeInUp 0.25s ease-out both' }}
            >
              SKIP
            </button>
          )}
        </>
      )}

      {/* ── Result overlay ──────────────────────────────────────── */}
      {phase === 'result' && results.length > 0 && (() => {
        const hasLegend = results.some(r => r.reward.rarity === 'legend')
        const hasRare   = results.some(r => r.reward.rarity === 'rare' && !r.isDuplicate)
        return (
          <div className="fixed inset-0 z-50 bg-black/97 flex flex-col overflow-y-auto">
            <div className="flex flex-col items-center w-full max-w-[430px] mx-auto px-4 pt-12 pb-8 min-h-full">
              <h2
                className={`text-xl font-bold mb-4 ${hasLegend ? 'shimmer-gold' : hasRare ? 'text-purple-300' : 'text-white'}`}
                style={{ animation: reduced ? 'none' : 'fadeInUp 0.35s ease-out both' }}
              >
                {results.length === 1 ? '運命の結果' : '10連結果'}
              </h2>

              {hasLegend && (
                <div className="mb-4 w-full py-2 text-center text-sm font-bold text-amber-300 rounded-xl"
                  style={{ background:'linear-gradient(90deg,#92400e,#d97706,#fbbf24,#d97706,#92400e)', backgroundSize:'200% auto', animation: reduced?'none':'shimmer 3s linear infinite' }}>
                  👑 LEGEND 獲得！ 👑
                </div>
              )}

              {results.length === 1 && (
                <div className="w-44 aspect-square">
                  <RewardCard result={results[0]} index={0} reduced={reduced}
                    isNew={results[0].reward.refId ? newIds.has(results[0].reward.refId) : false} />
                </div>
              )}

              {results.length > 1 && (
                <div className="grid grid-cols-2 gap-3 w-full">
                  {results.map((r, i) => (
                    <RewardCard key={i} result={r} index={i} reduced={reduced}
                      isNew={r.reward.refId ? newIds.has(r.reward.refId) : false} />
                  ))}
                </div>
              )}

              <CTASection results={results} />

              <div className="mt-6 flex flex-col gap-2 w-full max-w-xs">
                <button
                  onClick={() => { closeResult() }}
                  className="w-full py-3.5 rounded-2xl bg-amber-700 text-white font-bold text-sm active:bg-amber-600 transition-colors"
                  style={{ animation: reduced ? 'none' : `fadeInUp 0.4s ease-out ${results.length * 90 + 400}ms both` }}
                >
                  もう一度引く
                </button>
                <button
                  onClick={closeResult}
                  className="w-full py-3 rounded-2xl bg-zinc-800 text-zinc-400 font-medium text-sm active:bg-zinc-700 transition-colors"
                  style={{ animation: reduced ? 'none' : `fadeInUp 0.4s ease-out ${results.length * 90 + 500}ms both` }}
                >
                  閉じる
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── Idle: main page ─────────────────────────────────────── */}
      <div className="min-h-screen bg-zinc-950 text-white max-w-[430px] mx-auto flex flex-col pb-10">
        <header className="flex items-center gap-3 px-4 pt-12 pb-4">
          <button onClick={() => router.push('/mypage')}
            className="w-9 h-9 flex items-center justify-center rounded-full bg-zinc-800 active:bg-zinc-700"
            aria-label="戻る">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-zinc-300">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 className="text-lg font-bold tracking-wide select-none cursor-default" onClick={handleTitleTap}>
            ラッキーくじ
          </h1>
        </header>

        {/* Balance */}
        <div className="mx-4 mb-5 rounded-2xl bg-zinc-900 border border-zinc-800 p-4 flex gap-4">
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 font-medium">チケット</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">🎫</span>
              <span className="text-2xl font-bold tabular-nums">{state.tickets}</span>
              <span className="text-sm text-zinc-400">枚</span>
            </div>
          </div>
          <div className="w-px bg-zinc-800" />
          <div className="flex-1 flex flex-col items-center gap-1">
            <span className="text-xs text-zinc-500 font-medium">Jレージ</span>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl">💎</span>
              <span className="text-2xl font-bold text-amber-400 tabular-nums">{state.jileage.toLocaleString()}</span>
              <span className="text-sm text-zinc-400">J</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="mx-4 flex flex-col gap-3">
          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest">チケットで引く</p>
          <div className="grid grid-cols-2 gap-3">
            <button disabled={!canT1}
              onClick={() => startDraw(o => [executeSingleDraw(o)], 'ticket1', 'ticket_single')}
              className="rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all disabled:opacity-40 enabled:active:scale-95 bg-gradient-to-br from-amber-600 to-amber-800 text-white shadow-lg enabled:shadow-amber-900/50">
              <span className="text-xl">🎫</span><span>1回引く</span>
              <span className="text-xs text-amber-200 font-normal">チケット 1枚</span>
            </button>
            <button disabled={!canT10}
              onClick={() => startDraw(executeTenDraws, 'ticket10', 'ticket_ten')}
              className="rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all disabled:opacity-40 enabled:active:scale-95 bg-gradient-to-br from-yellow-500 to-amber-700 text-white shadow-lg enabled:shadow-yellow-900/50">
              <span className="text-xl">🎫🎫</span><span>10連引く</span>
              <span className="text-xs text-yellow-100 font-normal">チケット 10枚</span>
            </button>
          </div>

          <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mt-2">Jレージで引く</p>
          <div className="grid grid-cols-2 gap-3">
            <button disabled={!canJ1}
              onClick={() => startDraw(o => [executeSingleDraw(o)], 'jileage500', 'jileage_single')}
              className="rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all disabled:opacity-40 enabled:active:scale-95 bg-gradient-to-br from-blue-700 to-indigo-900 text-white shadow-lg enabled:shadow-blue-950/60">
              <span className="text-xl">💎</span><span>1回引く</span>
              <span className="text-xs text-blue-200 font-normal">500J</span>
            </button>
            <button disabled={!canJ10}
              onClick={() => startDraw(executeTenDraws, 'jileage5000', 'jileage_ten')}
              className="rounded-xl py-4 flex flex-col items-center gap-1 font-bold text-sm transition-all disabled:opacity-40 enabled:active:scale-95 bg-gradient-to-br from-indigo-600 to-violet-900 text-white shadow-lg enabled:shadow-violet-950/60">
              <span className="text-xl">💎💎</span><span>10連引く</span>
              <span className="text-xs text-indigo-200 font-normal">5,000J</span>
            </button>
          </div>
        </div>

        {/* 排出率: 非表示 */}

        {/* Recent history */}
        {state.drawHistory.length > 0 && (
          <div className="mx-4 mt-5">
            <p className="text-xs text-zinc-500 font-semibold uppercase tracking-widest mb-2">最近の履歴</p>
            <div className="flex flex-col gap-2">
              {state.drawHistory.slice(0,3).map(draw => {
                const lc = draw.rarities.filter(r=>r==='legend').length
                const rc = draw.rarities.filter(r=>r==='rare').length
                const nc = draw.rarities.filter(r=>r==='normal').length
                const mc = draw.rarities.filter(r=>r==='miss').length
                const dtLabel = (t: StoredDraw['drawType']) =>
                  t==='ticket_single'?'チケット1回':t==='ticket_ten'?'チケット10連':t==='jileage_single'?'Jレ1回':'Jレ10連'
                const fmt = (iso:string) => { const d=new Date(iso); return `${d.getMonth()+1}/${d.getDate()} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}` }
                return (
                  <div key={draw.id} className="rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2.5 flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-zinc-300 font-medium">{dtLabel(draw.drawType)}</span>
                      <span className="text-[10px] text-zinc-600">{fmt(draw.drawnAt)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap justify-end">
                      {lc>0&&<span className="bg-amber-900 text-amber-300 px-1.5 py-0.5 rounded-full">L×{lc}</span>}
                      {rc>0&&<span className="bg-purple-900 text-purple-300 px-1.5 py-0.5 rounded-full">R×{rc}</span>}
                      {nc>0&&<span className="bg-zinc-700 text-zinc-300 px-1.5 py-0.5 rounded-full">N×{nc}</span>}
                      {mc>0&&<span className="bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full">×{mc}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
            <Link href="/mypage/rewards" className="block text-xs text-zinc-500 text-right mt-2 underline underline-offset-2">全履歴を見る</Link>
          </div>
        )}

        {/* Dev panel */}
        {devMode && (
          <div className="mx-4 mt-6 rounded-xl border-2 border-dashed border-amber-700/60 bg-amber-950/20 p-4">
            <p className="text-xs font-bold text-amber-500 mb-3">🛠 社内レビュー専用パネル（本番非表示）</p>
            <label className="flex items-center gap-1.5 text-xs text-zinc-300 mb-3">
              <input type="checkbox" checked={shortAnim} onChange={e=>setShortAnim(e.target.checked)} className="rounded" />
              短縮演出 3秒（通常10秒）
            </label>
            <p className="text-xs text-zinc-400 mb-1.5">強制排出レア度</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {(['none','miss','normal','rare','legend'] as ForcedRarity[]).map(r=>(
                <button key={r} onClick={()=>setForcedRarity(r)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${forcedRarity===r?'bg-amber-600 text-white':'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                  {r==='none'?'ランダム':RARITY_LABEL[r]}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => devAddTickets(100)} className="text-xs bg-amber-800 text-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-700 font-bold">チケット +100</button>
              <button onClick={() => devAddTickets(5)} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">チケット +5</button>
              <button onClick={devAddJileage} className="text-xs bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg hover:bg-zinc-700">Jレージ +5000</button>
              <button onClick={devReset} className="text-xs bg-red-950 text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-900">localStorage初期化</button>
            </div>
            <p className="text-[10px] text-zinc-600 mt-2">タイトル7回タップ or ?dev=1 でパネル切替</p>
          </div>
        )}
      </div>
    </>
  )
}
