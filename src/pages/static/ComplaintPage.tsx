import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { FileInput } from '@/components/ui/FileInput'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'

/** صفحه Static — جدول complaints هست ولی endpoint ثبت نشده است. */
export default function ComplaintPage() {
  useDocumentTitle('ثبت شکایت')
  const [files, setFiles] = useState<File[]>([])

  return (
    <div className="space-y-4">
      <PageHeader
        title="ثبت شکایت"
        description="اگر پروژه‌ای طبق توافق پیش نرفته است، برای بررسی ادمین شکایت ثبت کنید."
      />

      <StaticPageNotice>
        جدول‌های <code className="font-mono text-[11px]">complaints</code> و{' '}
        <code className="font-mono text-[11px]">complaint_files</code> در دیتابیس ساخته شده‌اند اما
        هیچ route یا controller ای برای آن‌ها وجود ندارد. این فرم چیزی ارسال نمی‌کند.
      </StaticPageNotice>

      <Alert tone="info">
        طبق قانون بک‌اند، کارفرما حداکثر <b>۳ بار</b> می‌تواند یک تحویل را رد کند؛ پس از آن مسیر
        درست، ثبت شکایت است.
      </Alert>

      <Card>
        <CardHeader title="اطلاعات شکایت" />
        <CardBody className="space-y-4">
          <Field label="شناسه پروژه" required>
            <Input inputMode="numeric" placeholder="مثلاً ۱" />
          </Field>

          <Field label="موضوع" required>
            <Select defaultValue="">
              <option value="">انتخاب کنید…</option>
              <option value="quality">کیفیت نامناسب تحویل</option>
              <option value="late">تأخیر در تحویل</option>
              <option value="no-response">عدم پاسخ‌گویی طرف مقابل</option>
              <option value="payment">مشکل در پرداخت</option>
              <option value="other">سایر</option>
            </Select>
          </Field>

          <Field label="شرح ماجرا" required hint="هرچه دقیق‌تر بنویسید، بررسی سریع‌تر انجام می‌شود.">
            <Textarea rows={6} placeholder="آنچه اتفاق افتاده را به ترتیب زمانی توضیح دهید…" />
          </Field>

          <Field label="مدارک و مستندات">
            <FileInput files={files} onChange={setFiles} max={3} maxSizeMb={10} />
          </Field>
        </CardBody>
      </Card>

      <div className="flex justify-end">
        <Button disabled className="sm:w-48">
          ارسال شکایت
        </Button>
      </div>
    </div>
  )
}
