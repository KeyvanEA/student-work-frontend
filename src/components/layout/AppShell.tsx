import { Outlet } from 'react-router-dom'
import { DashboardStatsProvider } from '@/dashboard/DashboardStatsContext'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

/** پوستهٔ داشبورد کاربر: Sidebar دسکتاپ + نوار بالا و کشوی موبایل + ناوبری پایین */
export function AppShell() {
  return (
    <DashboardStatsProvider>
      <div className="mx-auto flex min-h-dvh w-full max-w-[1400px] bg-ink-100">
        {/* در RTL اولین فرزند سمت راست می‌نشیند */}
        <SideNav />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          <main className="flex-1 px-3 pb-24 pt-4 sm:px-5 lg:px-8 lg:pb-10 lg:pt-7">
            <div className="mx-auto w-full max-w-3xl xl:max-w-4xl">
              <Outlet />
            </div>
          </main>
        </div>

        <BottomNav />
      </div>
    </DashboardStatsProvider>
  )
}
