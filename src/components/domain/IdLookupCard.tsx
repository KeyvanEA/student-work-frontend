import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { toEnglishDigits } from '@/lib/format'

/**
 * جعبهٔ «رفتن با شناسه».
 * ⚠️ لازم است چون بک‌اند endpoint لیستی برای پروژه‌ها/تحویل‌ها ندارد؛
 * صفحهٔ مقصد داده را از API واقعی می‌خواند.
 */
export function IdLookupCard({
  title,
  description,
  label,
  placeholder,
  basePath,
  queryString,
}: {
  title: string
  description: string
  label: string
  placeholder: string
  basePath: '/projects' | '/deliveries' | '/tasks' | '/applications'
  /** پارامترهای اضافی مسیر مقصد، مثلاً "project=3" */
  queryString?: string
}) {
  const navigate = useNavigate()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const normalized = toEnglishDigits(value).trim()
    if (!/^\d+$/.test(normalized) || Number(normalized) <= 0) {
      setError('یک شناسه عددی معتبر وارد کنید.')
      return
    }
    setError(null)
    navigate(queryString ? `${basePath}/${normalized}?${queryString}` : `${basePath}/${normalized}`)
  }

  return (
    <Card>
      <CardHeader title={title} description={description} />
      <CardBody>
        <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Field label={label} error={error ?? undefined} className="flex-1">
            <Input
              inputMode="numeric"
              placeholder={placeholder}
              value={value}
              invalid={Boolean(error)}
              onChange={(event) => setValue(event.target.value)}
            />
          </Field>
          <Button type="submit" className="sm:w-32">
            برو
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
