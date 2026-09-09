import { Alert } from '@/components/ui/Alert'

/**
 * نشانگر صریح صفحاتی که هنوز endpoint واقعی ندارند.
 * برای ارائه دانشگاهی مهم است که Static بودن صفحه پنهان نشود.
 */
export function StaticPageNotice({ children }: { children: React.ReactNode }) {
  return (
    <Alert tone="warning" title="این صفحه با داده نمونه (Mock) نمایش داده می‌شود" className="mb-5">
      {children}
    </Alert>
  )
}
