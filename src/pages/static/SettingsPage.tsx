import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { LinkButton } from '@/components/ui/Button'
import { API_BASE_URL } from '@/api/client'
import { cn } from '@/lib/cn'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

function Toggle({
  label,
  description,
  defaultOn = false,
}: {
  label: string
  description: string
  defaultOn?: boolean
}) {
  const [on, setOn] = useState(defaultOn)
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-ink-800">{label}</p>
        <p className="mt-0.5 text-[12px] leading-6 text-ink-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(!on)}
        className={cn(
          'relative mt-1 h-6 w-11 shrink-0 rounded-full transition-colors',
          on ? 'bg-brand-600' : 'bg-ink-300',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 size-5 rounded-full bg-white shadow transition-all',
            on ? 'end-0.5' : 'end-5.5',
          )}
        />
      </button>
    </div>
  )
}

/** صفحه Static — بک‌اند endpoint تنظیمات ندارد. */
export default function SettingsPage() {
  useDocumentTitle('تنظیمات')

  return (
    <div className="space-y-4">
      <PageHeader title="تنظیمات" description="ترجیحات حساب کاربری" />

      <StaticPageNotice>
        هیچ endpoint ای برای ذخیرهٔ تنظیمات در بک‌اند وجود ندارد؛ کلیدهای زیر فقط نمایشی هستند.
      </StaticPageNotice>

      <Card>
        <CardHeader title="اعلان‌ها" />
        <CardBody className="divide-y divide-ink-100 py-0">
          <Toggle label="اعلان درخواست همکاری جدید" description="وقتی کسی برای تسک شما درخواست بفرستد." defaultOn />
          <Toggle label="اعلان تحویل پروژه" description="وقتی کارجو فایل تحویل را ثبت کند." defaultOn />
          <Toggle label="اعلان پیام جدید" description="پیام‌های گفتگوی پروژه." />
          <Toggle label="خبرنامه ایمیلی" description="اخبار و به‌روزرسانی‌های استودنت‌ورک." />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="حریم خصوصی" />
        <CardBody className="divide-y divide-ink-100 py-0">
          <Toggle label="نمایش پروفایل عمومی" description="کارفرماها بتوانند پروفایل شما را ببینند." defaultOn />
          <Toggle label="نمایش شماره دانشجویی" description="شماره دانشجویی در پروفایل عمومی دیده شود." />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="اطلاعات فنی" description="برای دیباگ در زمان ارائه" />
        <CardBody>
          <dl className="divide-y divide-ink-100">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[13px] text-ink-500">آدرس بک‌اند</dt>
              <dd dir="ltr" className="font-mono text-[12px] text-ink-800">
                {API_BASE_URL}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[13px] text-ink-500">روش احراز هویت</dt>
              <dd className="text-[13px] font-semibold text-ink-800">Sanctum — Bearer Token</dd>
            </div>
          </dl>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="پشتیبانی" />
        <CardBody className="flex flex-wrap gap-2">
          <LinkButton to="/complaints" size="sm" variant="outline">
            ثبت شکایت درباره یک پروژه
          </LinkButton>
          <LinkButton to="/search" size="sm" variant="ghost">
            جستجوی پیشرفته
          </LinkButton>
        </CardBody>
      </Card>
    </div>
  )
}
