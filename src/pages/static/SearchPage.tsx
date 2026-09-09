import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { MOCK_CATEGORIES } from '@/lib/mock/categories'

/** صفحه Static — GET /api/tasks پارامتر جستجو/فیلتر ندارد. */
export default function SearchPage() {
  useDocumentTitle('جستجوی پیشرفته')
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  return (
    <div className="space-y-4">
      <PageHeader title="جستجوی پیشرفته" description="فیلتر تسک‌ها بر اساس دسته، بودجه و مهلت" />

      <StaticPageNotice>
        <code className="font-mono text-[11px]">GET /api/tasks</code> در بک‌اند فعلی هیچ پارامتر
        <span className="mx-1 font-mono text-[11px]">search / category / status / sort</span>
        نمی‌پذیرد و همیشه همهٔ تسک‌های باز را صفحه‌بندی‌شده برمی‌گرداند. فرم زیر فقط نمایشی است.
        {/* TODO(backend): پشتیبانی از فیلتر و جستجو در TaskController::index */}
      </StaticPageNotice>

      <Card>
        <CardHeader title="فیلترها" />
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <Field label="عبارت جستجو" className="sm:col-span-2">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="مثلاً: پروژه Laravel"
            />
          </Field>

          <Field label="دسته‌بندی">
            <Select defaultValue="">
              <option value="">همه دسته‌ها</option>
              {MOCK_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="مرتب‌سازی">
            <Select defaultValue="newest">
              <option value="newest">جدیدترین</option>
              <option value="budget-desc">بیشترین بودجه</option>
              <option value="deadline">نزدیک‌ترین مهلت</option>
            </Select>
          </Field>

          <Field label="حداقل بودجه (تومان)">
            <Input inputMode="numeric" dir="ltr" className="text-end" placeholder="500000" />
          </Field>

          <Field label="حداکثر بودجه (تومان)">
            <Input inputMode="numeric" dir="ltr" className="text-end" placeholder="5000000" />
          </Field>
        </CardBody>
      </Card>

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" disabled>
          اعمال فیلترها
        </Button>
        <Button onClick={() => navigate('/tasks')}>مشاهده همه تسک‌های باز (واقعی)</Button>
      </div>
    </div>
  )
}
