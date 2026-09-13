import { useCallback } from 'react'
import { fetchSatisfaction } from '@/api/reviews'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatNumber, toPersianDigits } from '@/lib/format'
import type { SatisfactionSide } from '@/types/models'

function SatisfactionBlock({ title, side }: { title: string; side: SatisfactionSide }) {
  const total = side.satisfied_count + side.dissatisfied_count
  const satisfiedPercent = total === 0 ? 0 : Math.round((side.satisfied_count / total) * 100)

  return (
    <Card>
      <CardHeader
        title={title}
        description={
          total === 0
            ? 'هنوز ارزیابی‌ای ثبت نشده است'
            : `${toPersianDigits(total)} ارزیابی ثبت‌شده`
        }
      />
      <CardBody className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-emerald-50 px-4 py-3.5 text-center">
            <p className="text-[12px] font-semibold text-emerald-700">رضایت</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-800">
              {formatNumber(side.satisfied_count)}
            </p>
          </div>
          <div className="rounded-xl bg-rose-50 px-4 py-3.5 text-center">
            <p className="text-[12px] font-semibold text-rose-700">نارضایتی</p>
            <p className="mt-1 text-2xl font-extrabold text-rose-800">
              {formatNumber(side.dissatisfied_count)}
            </p>
          </div>
        </div>

        {total > 0 ? (
          <div>
            <div className="flex items-center justify-between text-[12px] font-semibold text-ink-500">
              <span>نسبت رضایت</span>
              <span>{toPersianDigits(satisfiedPercent)}٪</span>
            </div>
            <div
              className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-rose-200"
              role="img"
              aria-label={`${satisfiedPercent} درصد رضایت`}
            >
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${satisfiedPercent}%` }}
              />
            </div>
          </div>
        ) : null}
      </CardBody>
    </Card>
  )
}

/** میزان رضایت — GET /api/profile/satisfaction */
export default function SatisfactionPage() {
  useDocumentTitle('میزان رضایت')

  const loader = useCallback((signal: AbortSignal) => fetchSatisfaction(signal), [])
  const satisfaction = useApiResource(loader, [])

  return (
    <div className="space-y-4">
      <PageHeader
        title="میزان رضایت"
        description="ارزیابی‌هایی که طرف‌های همکاری دربارهٔ شما ثبت کرده‌اند"
      />

      <Alert tone="info">
        در این نسخه ارزیابی فقط دو حالت دارد: <b>رضایت</b> یا <b>نارضایتی</b>. امتیاز عددی یا متن نظر
        وجود ندارد. هر طرف پس از تکمیل و پرداخت پروژه می‌تواند یک بار ارزیابی ثبت کند.
      </Alert>

      {satisfaction.loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      ) : satisfaction.error ? (
        <ErrorState error={satisfaction.error} onRetry={satisfaction.reload} />
      ) : satisfaction.data ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <SatisfactionBlock title="به عنوان کارجو" side={satisfaction.data.as_worker} />
          <SatisfactionBlock title="به عنوان کارفرما" side={satisfaction.data.as_employer} />
        </div>
      ) : null}
    </div>
  )
}
