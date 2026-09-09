import { IdLookupCard } from '@/components/domain/IdLookupCard'
import { RecentEntries } from '@/components/domain/RecentEntries'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

export default function ProjectsPage() {
  useDocumentTitle('پروژه‌ها')

  return (
    <div className="space-y-4">
      <PageHeader
        title="پروژه‌ها"
        description="پروژه‌ها پس از پذیرش یک درخواست همکاری ساخته می‌شوند."
      />

      <StaticPageNotice>
        بک‌اند فعلی هیچ endpoint ای برای <b>فهرست پروژه‌ها</b> ندارد (فقط{' '}
        <code className="font-mono text-[11px]">GET /api/projects/{'{'}id{'}'}</code> موجود است) و
        پاسخ پذیرش درخواست هم <code className="font-mono text-[11px]">project_id</code> برنمی‌گرداند.
        بنابراین این صفحه فهرست نمی‌سازد؛ با وارد کردن شناسهٔ پروژه، صفحهٔ پروژه با{' '}
        <b>داده‌های کاملاً واقعی</b> باز می‌شود.
        {/* TODO(backend): GET /api/projects (پروژه‌های کاربر جاری) */}
      </StaticPageNotice>

      <IdLookupCard
        title="ورود به پروژه با شناسه"
        description="شناسهٔ عددی پروژه را وارد کنید تا اطلاعات آن از API خوانده شود."
        label="شناسه پروژه"
        placeholder="مثلاً ۱"
        basePath="/projects"
      />

      <Card>
        <CardHeader
          title="پروژه‌های اخیر شما"
          description="پروژه‌هایی که در این مرورگر با موفقیت باز شده‌اند"
        />
        <CardBody>
          <RecentEntries
            kind="project"
            emptyTitle="هنوز پروژه‌ای باز نکرده‌اید"
            emptyDescription="با وارد کردن شناسهٔ پروژه در کادر بالا شروع کنید."
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="تحویل‌های اخیر" description="تحویل‌هایی که در این مرورگر دیده‌اید" />
        <CardBody>
          <RecentEntries
            kind="delivery"
            emptyTitle="هنوز تحویلی باز نکرده‌اید"
            emptyDescription="از داخل صفحهٔ پروژه، تحویل ثبت‌شده را باز کنید."
          />
        </CardBody>
      </Card>
    </div>
  )
}
