import { useCallback, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchSkills } from '@/api/profile'
import { createTask } from '@/api/tasks'
import { SkillPicker } from '@/components/domain/SkillPicker'
import { PageHeader } from '@/components/layout/PageHeader'
import { Alert } from '@/components/ui/Alert'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ErrorState } from '@/components/ui/ErrorState'
import { Field } from '@/components/ui/Field'
import { FileInput } from '@/components/ui/FileInput'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Spinner } from '@/components/ui/Spinner'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { useApiResource } from '@/hooks/useApiResource'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useMutation } from '@/hooks/useMutation'
import { formatToman, toEnglishDigits, toLaravelDateTime } from '@/lib/format'
import { MOCK_CATEGORIES } from '@/lib/mock/categories'

const MIN_BUDGET = 100_000

function defaultDeadline(): string {
  const date = new Date()
  date.setDate(date.getDate() + 7)
  date.setHours(23, 59, 0, 0)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export default function TaskCreatePage() {
  useDocumentTitle('ثبت تسک جدید')
  const navigate = useNavigate()
  const toast = useToast()

  const skillsLoader = useCallback((signal: AbortSignal) => fetchSkills(signal), [])
  const skills = useApiResource(skillsLoader, [])

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState(defaultDeadline)
  const [categoryId, setCategoryId] = useState('')
  const [selectedSkills, setSelectedSkills] = useState<number[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [touched, setTouched] = useState(false)

  const budgetNumber = Number(toEnglishDigits(budget).replace(/[^\d]/g, ''))

  const errors = {
    title: title.trim().length < 5 ? 'عنوان باید حداقل ۵ کاراکتر باشد.' : undefined,
    description: description.trim().length < 1 ? 'شرح کار الزامی است.' : undefined,
    budget: !budgetNumber
      ? 'مبلغ بودجه را وارد کنید.'
      : budgetNumber < MIN_BUDGET
        ? `حداقل بودجه ${formatToman(MIN_BUDGET)} است.`
        : undefined,
    deadline: !deadline
      ? 'مهلت انجام را مشخص کنید.'
      : new Date(deadline).getTime() <= Date.now()
        ? 'مهلت باید بعد از امروز باشد.'
        : undefined,
    categoryId: !categoryId ? 'یک دسته‌بندی انتخاب کنید.' : undefined,
    skills: selectedSkills.length === 0 ? 'حداقل یک مهارت انتخاب کنید.' : undefined,
  }

  const isValid = Object.values(errors).every((value) => value === undefined)

  const mutation = useMutation(
    () =>
      createTask({
        title: title.trim(),
        description: description.trim(),
        budget: budgetNumber,
        deadline: toLaravelDateTime(deadline),
        category_id: Number(categoryId),
        skills: selectedSkills,
        files,
      }),
    {
      onSuccess: (result) => {
        toast.success(result.message)
        navigate(`/tasks/${result.task.id}`, { replace: true })
      },
      onError: (error) => toast.error(error.message),
    },
  )

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setTouched(true)
    if (!isValid) return
    void mutation.run()
  }

  const showError = (key: keyof typeof errors) =>
    touched ? errors[key] ?? mutation.error?.fieldError(key === 'categoryId' ? 'category_id' : key) : undefined

  return (
    <div>
      <PageHeader
        title="ثبت تسک جدید"
        description="کاری که نیاز دارید انجام شود را دقیق توضیح دهید تا درخواست‌های بهتری بگیرید."
        backTo="/tasks"
        backLabel="همه تسک‌ها"
      />

      <form onSubmit={submit} className="space-y-4" noValidate>
        {mutation.error ? <ErrorState error={mutation.error} compact /> : null}

        <Card>
          <CardHeader title="اطلاعات اصلی" />
          <CardBody className="space-y-4">
            <Field label="عنوان تسک" htmlFor="title" required error={showError('title')}>
              <Input
                id="title"
                value={title}
                maxLength={120}
                invalid={Boolean(showError('title'))}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="مثال: حل تمرین ساختمان داده — فصل ۴"
              />
            </Field>

            <Field
              label="شرح کار"
              htmlFor="description"
              required
              hint="حداکثر ۵۰۰۰ کاراکتر"
              error={showError('description')}
            >
              <Textarea
                id="description"
                value={description}
                maxLength={5000}
                rows={6}
                invalid={Boolean(showError('description'))}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="دقیقاً بنویسید چه چیزی می‌خواهید، خروجی مورد انتظار چیست و چه محدودیت‌هایی دارد."
              />
            </Field>

            <Field
              label="دسته‌بندی"
              htmlFor="category"
              required
              error={showError('categoryId')}
              hint="فهرست دسته‌بندی‌ها فعلاً ثابت است (بک‌اند endpoint ندارد)."
            >
              <Select
                id="category"
                value={categoryId}
                invalid={Boolean(showError('categoryId'))}
                onChange={(event) => setCategoryId(event.target.value)}
              >
                <option value="">انتخاب کنید…</option>
                {MOCK_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="بودجه و زمان" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field
              label="بودجه (تومان)"
              htmlFor="budget"
              required
              error={showError('budget')}
              hint={budgetNumber >= MIN_BUDGET ? formatToman(budgetNumber) : `حداقل ${formatToman(MIN_BUDGET)}`}
            >
              <Input
                id="budget"
                inputMode="numeric"
                dir="ltr"
                className="text-end"
                value={budget}
                invalid={Boolean(showError('budget'))}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="2500000"
              />
            </Field>

            <Field label="مهلت انجام" htmlFor="deadline" required error={showError('deadline')}>
              <Input
                id="deadline"
                type="datetime-local"
                dir="ltr"
                value={deadline}
                invalid={Boolean(showError('deadline'))}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </Field>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="مهارت‌های موردنیاز" description="حداکثر ۱۰ مهارت" />
          <CardBody className="space-y-2">
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
                />
                {showError('skills') ? (
                  <p className="text-[12px] font-medium text-rose-600">{showError('skills')}</p>
                ) : null}
              </>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="فایل‌های پیوست" description="اختیاری — حداکثر ۳ فایل" />
          <CardBody>
            <FileInput files={files} onChange={setFiles} max={3} maxSizeMb={10} />
          </CardBody>
        </Card>

        {touched && !isValid ? (
          <Alert tone="danger" title="فرم کامل نیست">
            لطفاً خطاهای مشخص‌شده را برطرف کنید.
          </Alert>
        ) : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => navigate(-1)} disabled={mutation.loading}>
            انصراف
          </Button>
          <Button type="submit" loading={mutation.loading} className="sm:w-48">
            ثبت تسک
          </Button>
        </div>
      </form>
    </div>
  )
}
