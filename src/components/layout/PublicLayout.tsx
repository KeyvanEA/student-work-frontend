import { Outlet } from 'react-router-dom'
import { PublicFooter } from './PublicFooter'
import { PublicHeader } from './PublicHeader'

/** پوستهٔ سایت عمومی: Header + محتوا + Footer (بدون Sidebar داشبورد) */
export function PublicLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-white">
      <PublicHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <PublicFooter />
    </div>
  )
}

/** همان پوسته، ولی برای صفحات داخلی عمومی (تسک‌ها) با عرض محدود و پس‌زمینهٔ روشن */
export function PublicContentLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-ink-100">
      <PublicHeader />
      <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-3xl xl:max-w-4xl">
          <Outlet />
        </div>
      </main>
      <PublicFooter />
    </div>
  )
}
