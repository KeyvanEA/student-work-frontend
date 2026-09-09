import type { ReactNode } from 'react'
import { BottomNav } from './BottomNav'
import { SideNav } from './SideNav'
import { TopBar } from './TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[1400px]">
      {/* در RTL اولین فرزند سمت راست می‌نشیند */}
      <SideNav />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-3 pb-24 pt-4 sm:px-5 lg:px-8 lg:pb-10 lg:pt-7">
          <div className="mx-auto w-full max-w-3xl xl:max-w-4xl">{children}</div>
        </main>
      </div>

      <BottomNav />
    </div>
  )
}
