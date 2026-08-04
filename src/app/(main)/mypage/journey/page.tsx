'use client'

import { useRouter } from 'next/navigation'
import { MOCK_JOURNEY } from '@/lib/mock-member-journey'
import type { JourneyMission } from '@/lib/mock-member-journey'

function ProgressBar({ value, max, accent = false }: { value: number; max: number; accent?: boolean }) {
  const pct = Math.min(100, max > 0 ? Math.round((value / max) * 100) : 0)
  return (
    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${accent ? 'bg-yellow-400' : 'bg-white'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function MissionCard({ mission }: { mission: JourneyMission }) {
  const pct = Math.min(100, mission.target > 0 ? Math.round((mission.current / mission.target) * 100) : 0)
  const remaining = mission.target - mission.current

  return (
    <div className={`rounded-2xl border p-4 ${mission.completed ? 'border-zinc-700 bg-zinc-900/50' : 'border-zinc-800 bg-zinc-900'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 pr-3">
          <p className={`font-semibold text-sm ${mission.completed ? 'text-zinc-400' : 'text-white'}`}>
            {mission.title}
          </p>
          <p className="text-zinc-500 text-xs mt-0.5">{mission.description}</p>
        </div>
        {mission.completed ? (
          <span className="flex-shrink-0 text-xs font-semibold text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">達成済み</span>
        ) : (
          <span className="flex-shrink-0 text-xs font-semibold text-zinc-300 tabular-nums">
            {mission.current}<span className="text-zinc-600">/{mission.target}</span>
          </span>
        )}
      </div>

      <ProgressBar value={mission.current} max={mission.target} accent={!mission.completed} />

      <div className="flex items-center justify-between mt-2">
        {mission.completed ? (
          <p className="text-zinc-500 text-xs">
            {mission.completedAt ? new Date(mission.completedAt).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' }) + ' 達成' : '達成済み'}
          </p>
        ) : remaining === 1 ? (
          <p className="text-yellow-400 text-xs font-semibold">あと{remaining}{mission.unit}で達成</p>
        ) : (
          <p className="text-zinc-500 text-xs">あと{remaining}{mission.unit}</p>
        )}
        <p className="text-zinc-600 text-xs">称号: <span className="text-zinc-400">{mission.rewardTitle}</span></p>
      </div>
    </div>
  )
}

function StreakCard({ months, visits }: { months: number; visits: number }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
      <p className="text-xs text-zinc-500 mb-3 tracking-wider uppercase">継続の記録</p>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-3xl font-black text-white tabular-nums">{months}</p>
          <p className="text-xs text-zinc-500 mt-1">か月連続来店</p>
        </div>
        <div className="text-center border-l border-zinc-800">
          <p className="text-3xl font-black text-white tabular-nums">{visits}</p>
          <p className="text-xs text-zinc-500 mt-1">累計来店回数</p>
        </div>
      </div>
      <div className="mt-4 flex gap-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-1.5 rounded-full ${i < months ? 'bg-white' : 'bg-zinc-800'}`}
          />
        ))}
      </div>
      <p className="text-zinc-600 text-[10px] mt-2 text-right">直近6か月</p>
    </div>
  )
}

export default function JourneyPage() {
  const router = useRouter()
  const data = MOCK_JOURNEY
  const activeMissions = data.monthlyMissions.filter(m => !m.completed)
  const completedThisMonth = data.monthlyMissions.filter(m => m.completed)

  return (
    <div className="flex flex-col min-h-screen bg-black">
      <header className="sticky top-0 z-40 bg-black border-b border-zinc-800 flex items-center px-4 h-14">
        <button onClick={() => router.back()} className="p-2 -ml-2 mr-2" aria-label="戻る">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <h1 className="text-base font-bold">Journey</h1>
        <span className="ml-2 text-xs text-zinc-500">体験の記録</span>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

        {/* 今月のサマリー */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
          <p className="text-xs text-zinc-500 mb-3 tracking-wider uppercase">今月のJourney</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-black text-white tabular-nums">{data.totalVisitsThisMonth}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">今月来店</p>
            </div>
            <div className="border-x border-zinc-800">
              <p className="text-2xl font-black text-white tabular-nums">{completedThisMonth.length}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">達成済み</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white tabular-nums">{activeMissions.length}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">進行中</p>
            </div>
          </div>
        </div>

        {/* 進行中ミッション */}
        {activeMissions.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3">進行中</h2>
            <div className="space-y-3">
              {activeMissions.map(m => <MissionCard key={m.id} mission={m} />)}
            </div>
          </section>
        )}

        {/* 今月達成済み */}
        {completedThisMonth.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3">今月の達成</h2>
            <div className="space-y-3">
              {completedThisMonth.map(m => <MissionCard key={m.id} mission={m} />)}
            </div>
          </section>
        )}

        {/* 継続記録 */}
        <StreakCard months={data.continuousMonths} visits={data.totalVisitsAllTime} />

        {/* 過去のJourney */}
        <section>
          <h2 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase mb-3">完了済みJourney</h2>
          <div className="space-y-2">
            {data.completedMissions.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800">
                <div>
                  <p className="text-sm font-semibold text-zinc-300">{m.title}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">称号「{m.rewardTitle}」獲得</p>
                </div>
                <p className="text-xs text-zinc-600 flex-shrink-0 ml-3">
                  {m.completedAt ? new Date(m.completedAt).toLocaleDateString('ja-JP', { year: 'numeric', month: 'short' }) : ''}
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-zinc-700 text-xs text-center pb-2">
          ※ UIデモ表示 ｜ 実データはPhase 2で連携予定
        </p>
      </div>
    </div>
  )
}
