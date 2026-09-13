import { Link } from 'react-router-dom'

/** فوتر سبک و مناسب MVP */
export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-ink-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-[15px] font-extrabold text-ink-900">استودنت‌ورک</p>
            <p className="mt-2 text-[13px] leading-7 text-ink-500">
              پلتفرم کارهای دانشجویی؛ از ثبت تسک تا تحویل پروژه و پرداخت دستمزد.
            </p>
          </div>

          <nav aria-label="پیوندهای فوتر">
            <p className="mb-2.5 text-[13px] font-bold text-ink-800">دسترسی سریع</p>
            <ul className="space-y-2 text-[13px] text-ink-500">
              <li>
                <Link to="/tasks" className="hover:text-brand-600">
                  مشاهده تسک‌ها
                </Link>
              </li>
              <li>
                <Link to="/tasks/new" className="hover:text-brand-600">
                  ثبت تسک جدید
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-brand-600">
                  داشبورد کاربری
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <p className="mt-7 border-t border-ink-100 pt-5 text-center text-[12px] text-ink-400">
          © {year} استودنت‌ورک — نسخهٔ MVP
        </p>
      </div>
    </footer>
  )
}
