import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { IconShield } from '@/components/ui/Icons'
import { Input } from '@/components/ui/Input'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useAdminAuth } from '../AdminAuthContext'

/**
 * ورود به پنل ادمین.
 *
 * ⚠️ این یک ورود *محلی و موقت* است. بک‌اند هنوز نه endpoint احراز هویت ادمین دارد و نه
 * ستون role در جدول users. هدف فقط این است که کاربر عادی به‌طور اتفاقی UI ادمین را نبیند.
 */
export default function AdminLoginPage() {
  useDocumentTitle('ورود پنل ادمین')
  const navigate = useNavigate()
  const location = useLocation()
  const { isAdmin, signIn } = useAdminAuth()

  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/admin'

  if (isAdmin) return <Navigate to={redirectTo} replace />

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const result = signIn(passcode)
    if (!result.ok) {
      setError(result.message ?? 'ورود ناموفق بود.')
      return
    }
    setError(null)
    navigate(redirectTo, { replace: true })
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ink-900 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white">
            <IconShield className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-extrabold text-white">پنل ادمین استودنت‌ورک</h1>
            <p className="mt-1.5 text-[13.5px] leading-7 text-ink-400">
              مدیریت کاربران، تسک‌ها، پروژه‌ها و شکایات
            </p>
          </div>
        </div>

        <Card>
          <CardBody className="space-y-4">
            <Alert tone="warning" title="احراز هویت ادمین هنوز سمت بک‌اند وجود ندارد">
              این ورود فقط محلی است و هیچ درخواستی به سرور نمی‌زند. به‌محض افزوده‌شدن
              role/permission در لاراول، همین صفحه به آن وصل می‌شود.
            </Alert>

            <form onSubmit={submit} className="space-y-4" noValidate>
              <Field
                label="رمز ورود پنل"
                htmlFor="admin-passcode"
                required
                error={error ?? undefined}
                hint="رمز موقت توسعه: studentwork-admin"
              >
                <Input
                  id="admin-passcode"
                  type="password"
                  dir="ltr"
                  autoComplete="off"
                  value={passcode}
                  invalid={Boolean(error)}
                  onChange={(event) => setPasscode(event.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              <Button type="submit" block size="lg">
                ورود به پنل
              </Button>
            </form>
          </CardBody>
        </Card>

        <p className="mt-5 text-center text-[12.5px] text-ink-400">
          <Link to="/" className="font-semibold text-brand-300 hover:underline">
            بازگشت به سایت
          </Link>
        </p>
      </div>
    </div>
  )
}
