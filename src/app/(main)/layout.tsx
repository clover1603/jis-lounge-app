import BottomNav from '@/components/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-black max-w-[430px] mx-auto">
      <div className="pb-16">{children}</div>
      <BottomNav />
    </div>
  )
}
