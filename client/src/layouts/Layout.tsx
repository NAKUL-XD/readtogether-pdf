import { Outlet } from 'react-router-dom'
import { Header, Sidebar } from '@/components/layout'

export function Layout() {
  return (
    <div className="min-h-screen bg-paper-light dark:bg-charcoal-900 sepia:bg-paper-sepia transition-colors duration-300">
      <Header title="ReadTogether" />
      <main className="pt-16 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>
      <Sidebar />
    </div>
  )
}