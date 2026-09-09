import { useParams } from 'react-router-dom'
import { PageHeader } from '@/components/layout/PageHeader'
import { StaticPageNotice } from '@/components/layout/StaticPageNotice'
import { Avatar } from '@/components/ui/Avatar'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { toPersianDigits } from '@/lib/format'
import { MOCK_PUBLIC_PROFILE, MOCK_REVIEWS } from '@/lib/mock/staticData'

/** صفحه Static — endpoint GET /users/{id} در بک‌اند ثبت نشده است. */
export default function PublicProfilePage() {
  const { userId } = useParams()
  useDocumentTitle('پروفایل عمومی')
  const profile = MOCK_PUBLIC_PROFILE

  return (
    <div className="space-y-4">
      <PageHeader title="پروفایل عمومی" description={`شناسه کاربر: ${toPersianDigits(userId ?? '—')}`} />

      <StaticPageNotice>
        بک‌اند مسیری برای مشاهدهٔ پروفایل عمومی سایر کاربران ندارد (نه{' '}
        <code className="font-mono text-[11px]">GET /api/users/{'{'}id{'}'}</code> و نه امتیازها).
        محتوای زیر نمونه است.
      </StaticPageNotice>

      <Card>
        <CardBody className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-start">
          <Avatar name={profile.full_name} size="lg" />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-ink-900">{profile.full_name}</h2>
            <p className="mt-0.5 text-[12.5px] text-ink-500">
              {profile.field_of_study} · {profile.university_name}
            </p>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'پروژه تکمیل‌شده', value: toPersianDigits(profile.stats.completed) },
          { label: 'میانگین امتیاز', value: toPersianDigits(profile.stats.rating) },
          { label: 'تحویل به‌موقع', value: `${toPersianDigits(profile.stats.onTime)}٪` },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardBody className="text-center">
              <p className="text-lg font-extrabold text-brand-700">{stat.value}</p>
              <p className="mt-0.5 text-[11px] text-ink-500">{stat.label}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader title="درباره" />
        <CardBody>
          <p className="text-[13.5px] leading-8 text-ink-600">{profile.bio}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="مهارت‌ها" />
        <CardBody>
          <ul className="flex flex-wrap gap-1.5">
            {profile.skills.map((skill) => (
              <li key={skill} className="rounded-lg bg-ink-100 px-2.5 py-1 text-[12px] font-medium text-ink-600">
                {skill}
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="نظرات کارفرمایان" />
        <CardBody className="space-y-3">
          {MOCK_REVIEWS.map((review) => (
            <div key={review.id} className="rounded-xl border border-ink-200 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[13px] font-bold text-ink-800">{review.reviewer}</p>
                <p className="text-[12px] text-amber-500" aria-label={`امتیاز ${review.rating} از ۵`}>
                  {'★'.repeat(review.rating)}
                  <span className="text-ink-300">{'★'.repeat(5 - review.rating)}</span>
                </p>
              </div>
              <p className="mt-1.5 text-[12.5px] leading-7 text-ink-600">{review.comment}</p>
              <p className="mt-1 text-[11px] text-ink-400">{review.at}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  )
}
