import { Alert } from '@/components/ui/Alert'

/**
 * نشانگر صریح اینکه دادهٔ این صفحه از Mock Adapter می‌آید و هیچ درخواستی به
 * /api/admin/... ارسال نمی‌شود (چون بک‌اند هنوز آن مسیرها را ندارد).
 */
export function MockNotice({
  endpoints,
  className,
}: {
  endpoints: string[]
  className?: string
}) {
  return (
    <Alert tone="warning" title="داده این صفحه از Mock Adapter می‌آید" className={className}>
      بک‌اند هنوز APIهای ادمین را ندارد، بنابراین هیچ درخواستی به این مسیرها ارسال نمی‌شود. با
      ساخته‌شدن هرکدام، همان تابع در <code className="font-mono text-[11px]">adminApi.ts</code> به
      API واقعی وصل می‌شود.
      <ul className="mt-2 space-y-0.5 font-mono text-[11px]" dir="ltr">
        {endpoints.map((endpoint) => (
          <li key={endpoint}>• {endpoint}</li>
        ))}
      </ul>
    </Alert>
  )
}
