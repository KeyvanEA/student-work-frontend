import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '@/api/client'
import { useAuth } from '@/auth/AuthContext'
import { Logo } from '@/components/layout/Logo'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { toEnglishDigits, toPersianDigits } from '@/lib/format'

/** حساب‌های نمونه‌ای که database/seeders/UserSeeder.php می‌سازد */
const DEMO_ACCOUNTS = [
  { mobile: '09120000001', name: 'علی احمدی', role: 'کارفرمای تسک‌های ۱ و ۲' },
  { mobile: '09120000002', name: 'رضا محمدی', role: 'کارجوی تسک ۱ / کارفرمای تسک ۳' },
  { mobile: '09120000003', name: 'حسن کریمی', role: 'کارجوی تسک‌های ۱ و ۳' },
]

const MOBILE_PATTERN = /^09\d{9}$/

export default function LoginPage() {
  useDocumentTitle('ورود')
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const { login, status } = useAuth()

  const [step, setStep] = useState<'mobile' | 'otp'>('mobile')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [localError, setLocalError] = useState<string | null>(null)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/'

  const loginMutation = useMutation(async (value: string) => login(value), {
    onSuccess: (user) => {
      toast.success(`خوش آمدید، ${user.full_name}`)
      navigate(redirectTo, { replace: true })
    },
  })

  if (status === 'authenticated') return <Navigate to={redirectTo} replace />

  const normalizedMobile = toEnglishDigits(mobile).replace(/\s|-/g, '')

  const goToOtp = (event: FormEvent) => {
    event.preventDefault()
    if (!MOBILE_PATTERN.test(normalizedMobile)) {
      setLocalError('شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد.')
      return
    }
    setLocalError(null)
    setStep('otp')
  }

  const submitLogin = (event: FormEvent) => {
    event.preventDefault()
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
          <CardBody className="space-y-4">
            {step === 'mobile' ? (
              <form onSubmit={goToOtp} className="space-y-4" noValidate>
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

                <Button type="submit" block size="lg">
                  دریافت کد تایید
                </Button>
              </form>
            ) : (
              <form onSubmit={submitLogin} className="space-y-4" noValidate>
                <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3.5 py-2.5">
                  <span className="text-[13px] text-ink-600">
                    شماره: <b dir="ltr" className="font-mono">{toPersianDigits(normalizedMobile)}</b>
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('mobile')}
                    className="text-[12.5px] font-semibold text-brand-600 hover:underline"
                  >
                    ویرایش
                  </button>
                </div>

                <Alert tone="warning" title="کد تایید در نسخه فعلی بررسی نمی‌شود">
                  بک‌اند هنوز endpointهای <code className="font-mono text-[11px]">send-otp</code> و{' '}
                  <code className="font-mono text-[11px]">verify-otp</code> را ثبت نکرده است؛ ورود
                  مستقیماً از طریق <code className="font-mono text-[11px]">POST /api/login</code> با
                  شماره موبایل انجام می‌شود.
                  {/* TODO(backend): پس از افزودن مسیرهای OTP، این فرم به verify-otp وصل شود. */}
                </Alert>

                <Field label="کد تایید ۶ رقمی" htmlFor="otp" hint="این مقدار به سرور ارسال نمی‌شود.">
                  <Input
                    id="otp"
                    inputMode="numeric"
                    maxLength={6}
                    dir="ltr"
                    className="text-center text-lg tracking-[0.5em]"
                    placeholder="––––––"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                  />
                </Field>

                {loginMutation.error ? (
                  <ErrorState error={loginMutation.error as ApiError} compact />
                ) : null}

                <Button type="submit" block size="lg" loading={loginMutation.loading}>
                  ورود به حساب
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        <details className="mt-4 rounded-2xl border border-ink-200 bg-white/70 px-4 py-3">
          <summary className="cursor-pointer list-none text-[13px] font-semibold text-ink-600">
            حساب‌های نمونه برای دمو
          </summary>
          <ul className="mt-3 space-y-2">
            {DEMO_ACCOUNTS.map((account) => (
              <li key={account.mobile}>
                <button
                  type="button"
                  onClick={() => {
                    setMobile(account.mobile)
                    setStep('mobile')
                    setLocalError(null)
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-ink-200 px-3 py-2 text-start transition-colors hover:border-brand-200 hover:bg-brand-50/50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-ink-800">
                      {account.name}
                    </span>
                    <span className="block truncate text-[11.5px] text-ink-400">{account.role}</span>
                  </span>
                  <span dir="ltr" className="shrink-0 font-mono text-[12px] text-ink-500">
                    {account.mobile}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11.5px] leading-6 text-ink-400">
            این شماره‌ها از <code className="font-mono">database/seeders/UserSeeder.php</code> می‌آیند و
            فقط وقتی کار می‌کنند که دیتابیس seed شده باشد.
          </p>
        </details>
      </div>
    </div>
  )
}
