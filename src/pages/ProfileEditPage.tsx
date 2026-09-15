import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { storedFileUrl } from '@/api/files'
import { fetchProfile, fetchSkills, updateMySkills, updateProfile } from '@/api/profile'
import { useAuth } from '@/auth/AuthContext'
import { SkillPicker } from '@/components/domain/SkillPicker'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { SkeletonDetail } from '@/components/ui/Skeleton'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { toEnglishDigits } from '@/lib/format'

export default function ProfileEditPage() {
  useDocumentTitle('ویرایش پروفایل')
  const navigate = useNavigate()
  const toast = useToast()
  const { setUser } = useAuth()

  const profileLoader = useCallback((signal: AbortSignal) => fetchProfile(signal), [])
  const profile = useApiResource(profileLoader, [])

  const skillsLoader = useCallback((signal: AbortSignal) => fetchSkills(signal), [])
  const skills = useApiResource(skillsLoader, [])

  const [form, setForm] = useState({
    full_name: '',
    field_of_study: '',
    university_name: '',
    student_number: '',
    email: '',
    bio: '',
  })
  const [avatar, setAvatar] = useState<File | null>(null)
  const [resume, setResume] = useState<File | null>(null)
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    if (!profile.data) return
    setForm({
      full_name: profile.data.full_name ?? '',
      field_of_study: profile.data.field_of_study ?? '',
      university_name: profile.data.university_name ?? '',
      student_number: profile.data.student_number ?? '',
      email: profile.data.email ?? '',
      bio: profile.data.bio ?? '',
    })
    setSelectedSkills((profile.data.skills ?? []).map((skill) => skill.id))
  }, [profile.data])

  const currentResumeUrl = storedFileUrl(profile.data?.resume_file)
  const studentNumber = toEnglishDigits(form.student_number).trim()

  const errors = {
    full_name:
      form.full_name.trim().length < 5
        ? 'نام کامل باید حداقل ۵ کاراکتر باشد.'
        : form.full_name.trim().length > 100
          ? 'نام کامل حداکثر ۱۰۰ کاراکتر است.'
          : undefined,
    field_of_study: !form.field_of_study.trim() ? 'رشته تحصیلی الزامی است.' : undefined,
    university_name: !form.university_name.trim() ? 'نام دانشگاه الزامی است.' : undefined,
    student_number:
      studentNumber.length !== 9 ? 'شماره دانشجویی باید دقیقاً ۹ رقم باشد.' : undefined,
    email:
      form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ? 'قالب ایمیل معتبر نیست.'
        : undefined,
    bio: form.bio.length > 1000 ? 'حداکثر ۱۰۰۰ کاراکتر مجاز است.' : undefined,
  }

  const isValid = Object.values(errors).every((value) => value === undefined)

  const profileMutation = useMutation(
    () =>
      updateProfile({
        full_name: form.full_name.trim(),
        field_of_study: form.field_of_study.trim(),
        university_name: form.university_name.trim(),
        student_number: studentNumber,
        email: form.email.trim() || null,
        bio: form.bio.trim() || null,
        avatar,
        resume_file: resume,
      }),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        setUser(result.user)
        setAvatar(null)
        setResume(null)
        profile.reload()
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const skillsMutation = useMutation(() => updateMySkills(selectedSkills), {
    onSuccess: (result) => {
      toast.success(result.message)
      setUser(result.user)
      profile.reload()
    },
    onError: (error) => toast.error(error.message),
  })

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!isValid) return
    void profileMutation.run()
  }

  const showError = (key: keyof typeof errors) =>
    touched ? errors[key] ?? profileMutation.error?.fieldError(key) : profileMutation.error?.fieldError(key)

  if (profile.loading) {
    return (
      <div>
        <PageHeader title="ویرایش پروفایل" backTo="/profile" backLabel="پروفایل من" />
        <SkeletonDetail />
      </div>
    )
  }

  if (profile.error) {
    return (
      <div>
        <PageHeader title="ویرایش پروفایل" backTo="/profile" backLabel="پروفایل من" />
        <ErrorState error={profile.error} onRetry={profile.reload} />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="ویرایش پروفایل"
        description="اطلاعات دانشجویی خود را کامل کنید تا کارفرماها بهتر شما را بشناسند."
        backTo="/profile"
        backLabel="پروفایل من"
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        {profileMutation.error ? <ErrorState error={profileMutation.error} compact /> : null}

        <Card>
          <CardHeader title="اطلاعات پایه" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="نام و نام خانوادگی" htmlFor="full_name" required error={showError('full_name')}>
              <Input
                id="full_name"
                value={form.full_name}
                invalid={Boolean(showError('full_name'))}
                onChange={(event) => setForm({ ...form, full_name: event.target.value })}
              />
            </Field>

            <Field
              label="شماره دانشجویی"
              htmlFor="student_number"
              required
              hint="دقیقاً ۹ رقم"
              error={showError('student_number')}
            >
              <Input
                id="student_number"
                dir="ltr"
                inputMode="numeric"
                maxLength={12}
                value={form.student_number}
                invalid={Boolean(showError('student_number'))}
                onChange={(event) => setForm({ ...form, student_number: event.target.value })}
              />
            </Field>

            <Field label="رشته تحصیلی" htmlFor="field_of_study" required error={showError('field_of_study')}>
              <Input
                id="field_of_study"
                value={form.field_of_study}
                invalid={Boolean(showError('field_of_study'))}
                onChange={(event) => setForm({ ...form, field_of_study: event.target.value })}
                placeholder="مهندسی کامپیوتر"
              />
            </Field>

            <Field label="دانشگاه" htmlFor="university_name" required error={showError('university_name')}>
              <Input
                id="university_name"
                value={form.university_name}
                invalid={Boolean(showError('university_name'))}
                onChange={(event) => setForm({ ...form, university_name: event.target.value })}
                placeholder="دانشگاه تهران"
              />
            </Field>

            <Field label="ایمیل" htmlFor="email" error={showError('email')} className="sm:col-span-2">
              <Input
                id="email"
                type="email"
                dir="ltr"
                value={form.email}
                invalid={Boolean(showError('email'))}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                placeholder="you@example.com"
              />
            </Field>

            <Field
              label="درباره من"
              htmlFor="bio"
              hint="حداکثر ۱۰۰۰ کاراکتر"
              error={showError('bio')}
              className="sm:col-span-2"
            >
              <Textarea
                id="bio"
                rows={4}
                maxLength={1000}
                value={form.bio}
                invalid={Boolean(showError('bio'))}
                onChange={(event) => setForm({ ...form, bio: event.target.value })}
                placeholder="تجربه‌ها، دروس مسلط و زمینه‌های کاری‌تان را بنویسید."
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="تصویر پروفایل و رزومه" description="اختیاری" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="تصویر پروفایل" hint="jpg / png / webp تا ۵ مگابایت" error={profileMutation.error?.fieldError('avatar')}>
              <div className="flex items-center gap-3">
                {/* تصویر فعلی — تا کاربر ببیند آپلود قبلی واقعاً ذخیره شده است */}
                <Avatar name={profile.data?.full_name} src={profile.data?.avatar} size="lg" />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setAvatar(event.target.files?.[0] ?? null)}
                  className="block w-full text-[12.5px] text-ink-600 file:me-3 file:rounded-lg file:border-0 file:bg-ink-100 file:px-3 file:py-2 file:text-[12.5px] file:font-semibold file:text-ink-700 hover:file:bg-ink-200"
                />
              </div>
            </Field>

            <Field label="فایل رزومه" hint="فقط PDF تا ۱۰ مگابایت" error={profileMutation.error?.fieldError('resume_file')}>
              <div className="space-y-2">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => setResume(event.target.files?.[0] ?? null)}
                  className="block w-full text-[12.5px] text-ink-600 file:me-3 file:rounded-lg file:border-0 file:bg-ink-100 file:px-3 file:py-2 file:text-[12.5px] file:font-semibold file:text-ink-700 hover:file:bg-ink-200"
                />
                {currentResumeUrl ? (
                  <a
                    href={currentResumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-[12.5px] font-semibold text-brand-600 hover:underline"
                  >
                    مشاهدهٔ رزومهٔ فعلی
                  </a>
                ) : null}
              </div>
            </Field>
          </CardBody>
        </Card>

        {touched && !isValid ? (
          <Alert tone="danger" title="فرم کامل نیست">
            لطفاً خطاهای مشخص‌شده را برطرف کنید.
          </Alert>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate('/profile')} disabled={profileMutation.loading}>
            انصراف
          </Button>
          <Button type="submit" loading={profileMutation.loading} className="sm:w-48">
            ذخیره تغییرات
          </Button>
        </div>
      </form>

      {/* مهارت‌ها روی endpoint جداگانه ذخیره می‌شوند */}
      <Card id="skills">
        <CardHeader title="مهارت‌های من" description="حداکثر ۱۰ مهارت — جداگانه ذخیره می‌شود" />
        <CardBody className="space-y-3">
          {skills.loading ? (
            <div className="flex items-center gap-2 py-6 text-ink-400">
              <Spinner size={18} />
              <span className="text-[13px]">در حال دریافت مهارت‌ها…</span>
            </div>
          ) : skills.error ? (
            <ErrorState error={skills.error} onRetry={skills.reload} compact />
          ) : (
            <>
              <SkillPicker
                skills={skills.data ?? []}
                selected={selectedSkills}
                onChange={setSelectedSkills}
                max={10}
                disabled={skillsMutation.loading}
              />
              {skillsMutation.error ? <ErrorState error={skillsMutation.error} compact /> : null}
              <Button
                variant="outline"
                loading={skillsMutation.loading}
                onClick={() => void skillsMutation.run()}
              >
                ذخیره مهارت‌ها
              </Button>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
