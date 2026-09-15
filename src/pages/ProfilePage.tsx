import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { storedFileUrl } from '@/api/files'
import { fetchProfile } from '@/api/profile'
import { useAuth } from '@/auth/AuthContext'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { SkillChips } from '@/components/domain/SkillChips'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button, LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { ErrorState } from '@/components/ui/ErrorState'
import { IconDownload, IconFile, IconLogout } from '@/components/ui/Icons'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { formatDate, toPersianDigits } from '@/lib/format'

export default function ProfilePage() {
  useDocumentTitle('پروفایل من')
  const navigate = useNavigate()
  const toast = useToast()
  const { logout } = useAuth()

  const loader = useCallback((signal: AbortSignal) => fetchProfile(signal), [])
  const profile = useApiResource(loader, [])

  const [logoutOpen, setLogoutOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await logout()
      toast.success('از حساب خود خارج شدید.')
      navigate('/login', { replace: true })
    } finally {
      setLoggingOut(false)
      setLogoutOpen(false)
    }
  }

  if (profile.loading) {
    return (
      <div>
        <PageHeader title="پروفایل من" />
        <SkeletonDetail />
      </div>
    )
  }

  if (profile.error || !profile.data) {
    return (
      <div>
        <PageHeader title="پروفایل من" />
        {profile.error ? <ErrorState error={profile.error} onRetry={profile.reload} /> : null}
      </div>
    )
  }

  const user = profile.data
  const resumeUrl = storedFileUrl(user.resume_file)
  const resumeName = user.resume_file?.split('/').pop() ?? 'resume.pdf'
  const incomplete = !user.full_name || !user.student_number || !user.field_of_study || !user.university_name

  return (
    <div className="space-y-4">
      <PageHeader
        title="پروفایل من"
        action={
          <LinkButton to="/profile/edit" size="sm" variant="outline">
            ویرایش پروفایل
          </LinkButton>
        }
      />

      {incomplete ? (
        <Alert tone="warning" title="پروفایل شما کامل نیست">
          تا زمانی که نام، شماره دانشجویی، رشته و دانشگاه تکمیل نشود، بک‌اند در اولین ویرایش همهٔ این
          فیلدها را الزامی می‌کند.
          <div className="mt-3">
            <LinkButton to="/profile/edit" size="sm" variant="outline">
              تکمیل پروفایل
            </LinkButton>
          </div>
        </Alert>
      ) : null}

      <Card>
        <CardBody className="flex items-center gap-4">
          <Avatar name={user.full_name} src={user.avatar} size="lg" />
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-ink-900">{user.full_name}</h2>
            <p className="mt-0.5 truncate text-[12.5px] text-ink-500">
              {user.field_of_study || 'رشته ثبت نشده'} · {user.university_name || 'دانشگاه ثبت نشده'}
            </p>
          </div>
        </CardBody>
      </Card>

      {user.bio ? (
        <Card>
          <CardHeader title="درباره من" />
          <CardBody>
            <p className="whitespace-pre-line text-[13.5px] leading-8 text-ink-600">{user.bio}</p>
          </CardBody>
        </Card>
      ) : null}

      <Card>
        <CardHeader title="اطلاعات دانشجویی" />
        <CardBody>
          <DetailList>
            <DetailRow
              label="شماره موبایل"
              value={<span dir="ltr">{toPersianDigits(user.mobile ?? '—')}</span>}
            />
            <DetailRow
              label="شماره دانشجویی"
              value={user.student_number ? toPersianDigits(user.student_number) : '—'}
            />
            <DetailRow label="رشته تحصیلی" value={user.field_of_study || '—'} />
            <DetailRow label="دانشگاه" value={user.university_name || '—'} />
            <DetailRow
              label="ایمیل"
              value={user.email ? <span dir="ltr">{user.email}</span> : '—'}
            />
            <DetailRow label="عضویت از" value={formatDate(user.created_at)} />
          </DetailList>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="مهارت‌ها"
          action={
            <LinkButton to="/profile/edit#skills" size="sm" variant="ghost">
              ویرایش
            </LinkButton>
          }
        />
        <CardBody>
          <SkillChips skills={user.skills} empty="هنوز مهارتی ثبت نکرده‌اید." />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="رزومه" />
        <CardBody>
          {/*
            بک‌اند فقط ستون `resume_file` (مسیر ذخیره‌سازی) را می‌دهد و هیچ accessor ای
            برای نشانی دانلود ندارد. همان قرارداد Storage::url() که خود بک‌اند برای
            سایر فایل‌ها استفاده می‌کند اینجا هم اعمال می‌شود.
          */}
          {resumeUrl ? (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="flex min-w-0 items-center gap-2.5">
                <IconFile className="size-5 shrink-0 text-ink-400" />
                <span className="truncate text-[13px] text-ink-700" dir="ltr">
                  {resumeName}
                </span>
              </span>
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-brand-200 px-3.5 text-[13px] font-semibold text-brand-700 hover:bg-brand-50"
              >
                <IconDownload className="size-4" />
                دانلود رزومه
              </a>
            </div>
          ) : (
            <p className="text-[13px] text-ink-400">هنوز رزومه‌ای آپلود نکرده‌اید.</p>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="میان‌برها" />
        <CardBody className="flex flex-wrap gap-2">
          <LinkButton to="/my-tasks" size="sm" variant="outline">
            تسک‌های ثبت‌شده
          </LinkButton>
          <LinkButton to="/projects/active/worker" size="sm" variant="outline">
            پروژه‌های فعال
          </LinkButton>
          <LinkButton to="/applications/sent" size="sm" variant="outline">
            درخواست‌های همکاری
          </LinkButton>
          <LinkButton to="/satisfaction" size="sm" variant="ghost">
            میزان رضایت
          </LinkButton>
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <Button
            variant="secondary"
            block
            icon={<IconLogout className="size-[18px]" />}
            onClick={() => setLogoutOpen(true)}
          >
            خروج از حساب کاربری
          </Button>
        </CardBody>
      </Card>

      <ConfirmDialog
        open={logoutOpen}
        title="خروج از حساب"
        description="برای ادامه کار باید دوباره وارد شوید."
        confirmLabel="خروج"
        tone="danger"
        loading={loggingOut}
        onConfirm={() => void handleLogout()}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  )
}
