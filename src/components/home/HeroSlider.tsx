import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'

interface Slide {
  key: string
  title: string
  body: string
  primary: { to: string; label: string }
  secondary: { to: string; label: string }
}

const SLIDES: Slide[] = [
  {
    key: 'post',
    title: 'تسکت را ثبت کن، کارجوی مناسب را پیدا کن',
    body: 'کار دانشجویی‌ات را با بودجه و مهلت مشخص اعلام کن و از میان درخواست‌های همکاری، بهترین را انتخاب کن.',
    primary: { to: '/tasks/new', label: 'ثبت تسک' },
    secondary: { to: '/tasks', label: 'مشاهده تسک‌ها' },
  },
  {
    key: 'skill',
    title: 'مهارتت را به پروژه تبدیل کن',
    body: 'بین تسک‌های باز بگرد، درخواست همکاری بفرست و اولین پروژهٔ دانشجویی‌ات را شروع کن.',
    primary: { to: '/tasks', label: 'پیدا کردن کار' },
    secondary: { to: '/tasks/new', label: 'ثبت تسک' },
  },
  {
    key: 'flow',
    title: 'از ثبت تسک تا تحویل پروژه، همه‌چیز یک‌جا',
    body: 'درخواست همکاری، ساخت پروژه، تحویل فایل، تایید کارفرما و پرداخت دستمزد — همه در یک مسیر روشن.',
    primary: { to: '/tasks/new', label: 'شروع کنید' },
    secondary: { to: '/tasks', label: 'دیدن نمونه تسک‌ها' },
  },
  {
    key: 'income',
    title: 'برای دیگران انجام بده، برای خودت درآمد بساز',
    body: 'کنار درس، پروژه‌های هم‌رشته‌ای‌هایت را انجام بده و دستمزدت را بعد از تایید تحویل دریافت کن.',
    primary: { to: '/tasks', label: 'پیدا کردن کار' },
    secondary: { to: '/login', label: 'ورود به حساب' },
  },
]

const INTERVAL_MS = 6500

/** اسلایدر سبک Hero — بدون هیچ وابستگی خارجی */
export function HeroSlider() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const reducedMotion = useRef(false)

  useEffect(() => {
    reducedMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
  }, [])

  useEffect(() => {
    if (paused || reducedMotion.current) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [paused])

  const slide = SLIDES[index]

  return (
    <section
      className="relative overflow-hidden bg-gradient-to-bl from-brand-700 via-brand-600 to-brand-800 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="معرفی استودنت‌ورک"
    >
      {/* لکه‌های نوری پس‌زمینه */}
      <span
        className="pointer-events-none absolute -start-16 -top-24 size-64 rounded-full bg-white/10 blur-3xl"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute -bottom-28 -end-10 size-72 rounded-full bg-brand-400/25 blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-[11.5px] font-semibold text-brand-50 ring-1 ring-inset ring-white/20">
            پلتفرم کارهای دانشجویی
          </p>

          <div key={slide.key} className="animate-fade-up">
            <h1 className="mt-5 text-[26px] font-extrabold leading-[1.55] sm:text-[34px] sm:leading-[1.5]">
              {slide.title}
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-8 text-brand-50/90 sm:text-[15px]">
              {slide.body}
            </p>

            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                to={slide.primary.to}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-white px-6 text-[14.5px] font-bold text-brand-700 shadow-sm transition-colors hover:bg-brand-50"
              >
                {slide.primary.label}
              </Link>
              <Link
                to={slide.secondary.to}
                className="inline-flex h-12 items-center justify-center rounded-xl px-6 text-[14.5px] font-bold text-white ring-1 ring-inset ring-white/35 transition-colors hover:bg-white/10"
              >
                {slide.secondary.label}
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-9 flex items-center gap-2" role="tablist" aria-label="انتخاب اسلاید">
          {SLIDES.map((item, slideIndex) => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={slideIndex === index}
              aria-label={`اسلاید ${slideIndex + 1}`}
              onClick={() => setIndex(slideIndex)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                slideIndex === index ? 'w-8 bg-white' : 'w-3 bg-white/35 hover:bg-white/60',
              )}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
