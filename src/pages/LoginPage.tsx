import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAccess } from '@/admin/AdminAccessContext'
import { useAuth } from '@/auth/AuthContext'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { toEnglishDigits } from '@/lib/format'

/** همان الگویی که LoginRequest بک‌اند اعتبارسنجی می‌کند: regex:/^09[0-9]{9}$/ */
const MOBILE_PATTERN = /^09\d{9}$/

/**
 * مقصد بعد از ورود — تنها جایی که این تصمیم گرفته می‌شود.
 *
 * ادمین مستقیماً وارد /admin می‌شود و هیچ‌وقت از داشبورد کاربر عبور نمی‌کند؛
 * فقط اگر پیش از ورود در حال رفتن به مسیری داخل خود پنل بوده، همان مسیر حفظ می‌شود.
 * برعکس، کاربر عادی که به /admin هدایت شده بود به داشبورد خودش می‌رود تا در
 * صفحهٔ «دسترسی ندارید» گیر نکند.
 */
function destinationAfterLogin(isAdmin: boolean, from?: string): string {
  if (isAdmin) return from?.startsWith('/admin') ? from : '/admin'
  if (!from || from.startsWith('/admin')) return '/dashboard'
  return from
}

/**
 * ورود.
 *
 * بک‌اند فعلی فقط `POST /api/login` با فیلد `mobile` دارد و مستقیماً توکن می‌دهد.
 * هیچ مسیر send-otp / verify-otp در routes/api.php ثبت نشده، بنابراین اینجا هم
 * مرحلهٔ کد تایید ساخته نشده است. اگر بعداً OTP اضافه شود، این فرم در یک مرحلهٔ
 * جداگانه به آن وصل می‌شود.
 */
export default function LoginPage() {
  useDocumentTitle('ورود')
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { login, status } = useAuth()
  const { isAdmin, resolved: roleResolved, ensureChecked } = useAdminAccess()

  const [mobile, setMobile] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const from = (location.state as { from?: string } | null)?.from

  const loginMutation = useMutation(async (value: string) => login(value), {
    onSuccess: async (user) => {
      toast.success(`خوش آمدید، ${user.full_name}`)
      // نقش پیش از هر ناوبری قطعی می‌شود تا ادمین از مسیر داشبورد کاربر رد نشود.
      const admin = await ensureChecked(user)
      navigate(destinationAfterLogin(admin, from), { replace: true })
    },
  })

  /**
   * تا وقتی نشست یا نقش کاربر قطعی نشده هیچ تصمیم مسیریابی گرفته نمی‌شود.
   * `loginMutation.loading` تا پایان onSuccess (یعنی تا انجام ناوبری) true می‌ماند،
   * بنابراین در فاصلهٔ «توکن گرفته شد» تا «نقش مشخص شد» هیچ redirect زودهنگامی
   * به /dashboard رخ نمی‌دهد. مشکل قبلی دقیقاً همین بود: login → /dashboard → /admin
   */
  if (status === 'loading' || (status === 'authenticated' && !roleResolved)) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-ink-400">
        <Spinner size={28} className="text-brand-500" />
        <p className="text-[13px] font-medium">در حال بررسی نشست شما…</p>
      </div>
    )
  }

  if (status === 'authenticated' && !loginMutation.loading) {
    return <Navigate to={destinationAfterLogin(isAdmin, from)} replace />
  }

  const normalizedMobile = toEnglishDigits(mobile).replace(/\s|-/g, '')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!MOBILE_PATTERN.test(normalizedMobile)) {
      setLocalError('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.')
      return
    }
    setLocalError(null)
    void loginMutation.run(normalizedMobile)
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-brand-50 via-ink-100 to-ink-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <div>
            <h1 className="text-2xl font-extrabold text-ink-900">ورود به استودنت‌ورک</h1>
            <p className="mt-1.5 text-[13.5px] leading-7 text-ink-500">
              با شماره موبایل دانشجویی خود وارد شوید و کارهای دانشجویی را شروع کنید.
            </p>
          </div>
        </div>

        <Card className="animate-fade-up">
          <CardBody>
            <form onSubmit={submit} className="space-y-4" noValidate>
              <Field
                label="شماره موبایل"
                htmlFor="mobile"
                required
                error={localError ?? undefined}
                hint="مثال: ۰۹۱۲۰۰۰۰۰۰۱"
              >
                <Input
                  id="mobile"
                  name="mobile"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  className="text-center tracking-[0.2em]"
                  placeholder="09xxxxxxxxx"
                  value={mobile}
                  invalid={Boolean(localError)}
                  onChange={(event) => setMobile(event.target.value)}
                />
              </Field>

              {loginMutation.error ? <ErrorState error={loginMutation.error} compact /> : null}

              <Button type="submit" block size="lg" loading={loginMutation.loading}>
                ورود به حساب
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="mt-5 text-center text-[12.5px] text-ink-500">
          <Link to="/" className="font-semibold text-brand-600 hover:underline">
            بازگشت به صفحه اصلی
          </Link>
        </p>
      </div>
    </div>
  )
}
