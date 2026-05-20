import { Sidebar } from "@/components/admin/Sidebar"

export const dynamic = 'force-dynamic'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen p-3 md:p-4"
      style={{
        background: `linear-gradient(135deg, hsl(var(--page-outer-from)), hsl(var(--page-outer-to)))`,
      }}
    >
      <div className="flex h-[calc(100vh-1.5rem)] md:h-[calc(100vh-2rem)] rounded-2xl overflow-hidden shadow-sm border border-white/40">
        <Sidebar />
        <main className="flex-1 bg-background overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}