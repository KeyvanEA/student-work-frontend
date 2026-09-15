import { storedFileUrl } from '@/api/files'
import { SkillChips } from '@/components/domain/SkillChips'
import { DetailList, DetailRow } from '@/components/domain/DetailList'
import { Alert } from '@/components/ui/Alert'
import { Avatar } from '@/components/ui/Avatar'
import { Modal } from '@/components/ui/Modal'
import { toPersianDigits } from '@/lib/format'
import type { Skill } from '@/types/models'

/**
 * اطلاعاتی که صفحات مختلف دربارهٔ «طرف مقابل» از بک‌اند دریافت می‌کنند.
 * هر فیلد اختیاری است، چون هر endpoint زیرمجموعهٔ متفاوتی از ستون‌ها را eager-load می‌کند.
 */
export interface ProfilePeek {
  id: number
  full_name?: string | null
  avatar?: string | null
  mobile?: string | null
  student_number?: string | null
  field_of_study?: string | null
  university_name?: string | null
  bio?: string | null
  resume_file?: string | null
  skills?: Skill[]
}

/**
 * نمایش پروفایل یک کاربر دیگر.
 *
 * ⚠️ چرا دیالوگ و نه صفحهٔ `/users/:id`؟
 * بک‌اند هیچ endpoint ای برای خواندن پروفایل یک کاربر دلخواه ندارد — routes/api.php
 * فقط `/api/user` و `/api/profile` (هر دو «خودِ کاربر») را دارد. یک مسیر مستقل با
 * رفرش صفحه هیچ راهی برای واکشی داده نداشت و عملاً یک صفحهٔ شکسته می‌شد.
 * بنابراین اینجا فقط همان داده‌ای نمایش داده می‌شود که بک‌اند در پاسخ همان صفحه
 * (تسک / درخواست همکاری / پروژه / پروندهٔ شکایت) از قبل برگردانده است.
 * تا وقتی endpoint پروفایل عمومی اضافه نشده، این کامل‌ترین و صادقانه‌ترین شکل ممکن است.
 */
export function UserProfileDialog({
  open,
  onClose,
  user,
  title = 'پروفایل کاربر',
  /** رزومه فقط جایی نشان داده می‌شود که بک‌اند واقعاً آن را برگردانده باشد */
  showResume = false,
}: {
  open: boolean
  onClose: () => void
  user: ProfilePeek | null
  title?: string
  showResume?: boolean
}) {
  if (!user) return null

  const resumeUrl = showResume ? storedFileUrl(user.resume_file) : null
  const hasAcademic = Boolean(
    user.student_number || user.field_of_study || user.university_name || user.mobile,
  )

  return (
    <Modal open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3.5">
          <Avatar name={user.full_name} src={user.avatar} size="lg" />
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-ink-900">
              {user.full_name ?? `کاربر ${toPersianDigits(user.id)}`}
            </p>
            <p className="mt-0.5 text-[11.5px] text-ink-400">
              شناسه کاربر {toPersianDigits(user.id)}
            </p>
          </div>
        </div>

        {user.bio ? (
          <p className="whitespace-pre-line border-t border-ink-100 pt-4 text-[13px] leading-7 text-ink-600">
            {user.bio}
          </p>
        ) : null}

        {hasAcademic ? (
          <DetailList className="border-t border-ink-100 pt-1">
            {user.mobile ? (
              <DetailRow
                label="شماره تماس"
                value={<span dir="ltr">{toPersianDigits(user.mobile)}</span>}
              />
            ) : null}
            {user.student_number ? (
              <DetailRow label="شماره دانشجویی" value={toPersianDigits(user.student_number)} />
            ) : null}
            {user.field_of_study ? (
              <DetailRow label="رشته تحصیلی" value={user.field_of_study} />
            ) : null}
            {user.university_name ? (
              <DetailRow label="دانشگاه" value={user.university_name} />
            ) : null}
          </DetailList>
        ) : null}

        {user.skills && user.skills.length > 0 ? (
          <div className="border-t border-ink-100 pt-4">
            <h3 className="mb-2 text-[13px] font-bold text-ink-800">مهارت‌ها</h3>
            <SkillChips skills={user.skills} />
          </div>
        ) : null}

        {showResume ? (
          <div className="border-t border-ink-100 pt-4">
            <h3 className="mb-2 text-[13px] font-bold text-ink-800">رزومه</h3>
            {resumeUrl ? (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-10 items-center rounded-xl border border-brand-200 px-3.5 text-[13px] font-semibold text-brand-700 hover:bg-brand-50"
              >
                باز کردن فایل رزومه
              </a>
            ) : (
              <p className="text-[13px] text-ink-400">این کاربر رزومه‌ای ثبت نکرده است.</p>
            )}
          </div>
        ) : null}

        {!hasAcademic && !user.bio && !user.skills?.length ? (
          <Alert tone="info">
            بک‌اند در پاسخ این صفحه فقط نام و تصویر این کاربر را برمی‌گرداند. برای نمایش پروفایل
            کامل، یک endpoint پروفایل عمومی در بک‌اند لازم است.
          </Alert>
        ) : null}
      </div>
    </Modal>
  )
}
