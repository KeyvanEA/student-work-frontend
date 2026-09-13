# StudentWork — Frontend

فرانت‌اند پلتفرم **استودنت‌ورک**؛ یک SPA مستقل که فقط از طریق REST API با بک‌اند Laravel (Sanctum) حرف می‌زند.

> بک‌اند در `../student-work` قرار دارد و **تغییری در آن داده نشده است**.
> این فرانت با `routes/api.php` نسخهٔ فعلی بک‌اند (commit `fe89683`) sync شده است.

---

## استک

| مورد | انتخاب |
|---|---|
| فریم‌ورک | React ۱۹ |
| Build tool | Vite ۷ |
| زبان | TypeScript (strict، بدون `any`) |
| استایل | Tailwind CSS ۴ (`@tailwindcss/vite`) |
| مسیریابی | React Router ۷ |
| State | Context برای احراز هویت و شمارنده‌های داشبورد + هوک‌های سبک `useApiResource` / `useMutation` |
| فونت | Vazirmatn (CDN) با fallback به Tahoma/system |

بدون Redux، بدون React Query، بدون کتابخانهٔ اسلایدر یا تاریخ — ساده‌ترین معماری کافی.

---

## راه‌اندازی

### ۱) بک‌اند

```bash
cd ../student-work && composer install && php artisan migrate:fresh --seed && php artisan serve
```

سرور روی `http://localhost:8000` بالا می‌آید و دیتابیس با کاربران، دسته‌بندی‌ها، مهارت‌ها و سناریوی MVP پر می‌شود.

### ۲) فرانت‌اند

```bash
npm install && npm run dev
```

روی `http://localhost:5173` باز می‌شود. اگر آدرس بک‌اند فرق می‌کند، `.env` را ویرایش کنید:

```
VITE_API_BASE_URL=http://localhost:8000
```

### ساخت نسخهٔ production

```bash
npm run build && npm run preview
```

---

## معماری مسیرها

سایت عمومی و داشبورد کاربر **عمداً از هم جدا هستند**:

```
/                       ← Public Home (Header · Hero/Slider · آخرین تسک‌ها · CTA · Footer)
/tasks, /tasks/:id      ← صفحات عمومی تسک (بدون نیاز به ورود)
/login                  ← ورود

/dashboard              ← داشبورد کاربر (Sidebar · شمارنده‌ها · کارهای در انتظار)
/profile, /profile/edit
/notifications
/my-tasks
/applications/sent · /applications/received · /applications/:id
/projects/active/:role · /projects/history/:role · /projects/:id
/deliveries/:id
/complaints/mine · /complaints/related · /complaints/:id
/satisfaction

/admin/*                ← پنل ادمین (چیدمان و نشست جدا)
```

`/` دیگر داشبورد نیست. پوستهٔ عمومی (`PublicLayout`) و پوستهٔ داشبورد (`AppShell`) دو کامپوننت جدا هستند.

---

## ساختار پروژه

```
src/
├── api/                ← تنها لایه‌ای که با بک‌اند واقعی حرف می‌زند
│   ├── endpoints.ts        همهٔ مسیرهای API در یک فایل، آینهٔ routes/api.php
│   ├── client.ts           fetch wrapper، توکن، ApiError، method spoofing
│   ├── auth.ts  dashboard.ts  tasks.ts  applications.ts  projects.ts
│   ├── deliveries.ts  complaints.ts  reviews.ts  notifications.ts  profile.ts  files.ts
├── auth/               ← AuthContext (نشست، ورود، خروج)
├── dashboard/          ← DashboardStatsContext (یک بار GET /api/dashboard برای کل پوسته)
├── hooks/              ← useApiResource / useMutation / useDocumentTitle
├── components/
│   ├── ui/             ← Button, Card, Modal, Toast, Field, FileInput, ErrorState, …
│   ├── layout/         ← PublicLayout, PublicHeader, PublicFooter, AppShell, SideNav,
│   │                      DashboardNav, BottomNav, TopBar, ProtectedRoute
│   ├── home/           ← HeroSlider
│   └── domain/         ← TaskCard, ProjectCard, ApplicationListCard, DeliveryListRow,
│                          StatCard, SegmentedTabs, FlowStepper, …
├── admin/              ← پنل ادمین، کاملاً جدا از لایهٔ API واقعی
│   ├── api/                plannedEndpoints.ts · adminApi.ts · mockAdapter.ts · types.ts
│   ├── components/         AdminLayout, AdminGuard, AdminTable, MockNotice, …
│   ├── pages/              داشبورد، کاربران، تسک‌ها، درخواست‌ها، پروژه‌ها، شکایات، رضایت‌ها، …
│   └── AdminAuthContext.tsx
├── lib/                ← format (تاریخ شمسی، تومان، ارقام فارسی)، labels، mock/categories
├── pages/              ← یک فایل به ازای هر صفحهٔ کاربر
└── types/models.ts     ← تایپ‌ها دقیقاً مطابق خروجی کنترلرهای Laravel
```

هیچ کامپوننت UI مستقیماً `fetch` نمی‌زند.

---

## نگاشت API

همهٔ صفحات کاربر به API واقعی متصل‌اند — هیچ صفحهٔ Mock ای در سمت کاربر باقی نمانده است.

| صفحه | مسیر | Endpointهای مصرفی |
|---|---|---|
| ورود | `/login` | `POST /api/login` |
| خانه (عمومی) | `/` | `GET /api/tasks` |
| فهرست تسک‌ها | `/tasks` | `GET /api/tasks` |
| جزئیات تسک | `/tasks/:id` | `GET /api/tasks/{id}` · `POST /api/tasks/{id}/applications` · `PATCH /api/tasks/{id}/cancel` |
| ثبت تسک | `/tasks/new` | `POST /api/tasks` · `GET /api/skills` |
| داشبورد | `/dashboard` | `GET /api/dashboard` |
| تسک‌های ثبت‌شده | `/my-tasks` | `GET /api/tasks/mine` |
| درخواست‌های یک تسک | `/tasks/:id/applications` | `GET /api/tasks/{id}/applications` · accept · reject |
| درخواست‌های همکاری | `/applications/sent` · `/applications/received` | `GET /api/applications?type=…` |
| جزئیات درخواست | `/applications/:id` | `GET /api/applications/{id}` · `PATCH …/accept` · `PATCH …/reject` |
| فهرست پروژه‌ها | `/projects/:status/:role` | `GET /api/projects?role=…&status=…` |
| جزئیات پروژه | `/projects/:id` | `GET /api/projects/{id}` · `GET /api/projects/{id}/deliveries` · `POST …/deliveries` · `PATCH …/payment` · `POST …/complaints` · `POST …/reviews` |
| جزئیات تحویل | `/deliveries/:id` | `GET /api/deliveries/{id}` · preview · download · `PATCH …/accept` · `PATCH …/reject` |
| شکایات | `/complaints/mine` · `/complaints/related` | `GET /api/complaints` · `GET /api/complaints/related` |
| جزئیات شکایت | `/complaints/:id` | `GET /api/complaints/{id}` |
| اعلانات | `/notifications` | `GET /api/notifications` |
| میزان رضایت | `/satisfaction` | `GET /api/profile/satisfaction` |
| پروفایل | `/profile` | `GET /api/profile` · `POST /api/logout` |
| ویرایش پروفایل | `/profile/edit` | `PATCH /api/profile` · `GET /api/skills` · `PUT /api/profile/skills` |

---

## پنل ادمین

UI پنل ادمین **کامل ساخته شده** (routeها، types، لایهٔ سرویس، جدول‌ها، فیلترها، فرم‌ها) اما بک‌اند هنوز
هیچ مسیر `/api/admin/...` ندارد.

- `src/admin/api/plannedEndpoints.ts` — مسیرهای طراحی‌شده، صرفاً به‌عنوان قرارداد آینده.
- `src/admin/api/adminApi.ts` — لایهٔ سرویس؛ امضای توابع همانی است که با API واقعی خواهد بود.
- `src/admin/api/mockAdapter.ts` — دادهٔ موقت درون‌حافظه‌ای.

**هیچ درخواست واقعی به `/api/admin/...` ارسال نمی‌شود.** هر صفحهٔ ادمین بالای خود یک هشدار صریح دارد که
دادهٔ آن از Mock Adapter می‌آید و کدام endpointها هنوز ساخته نشده‌اند. برای اتصال به API واقعی کافی است
بدنهٔ همان تابع در `adminApi.ts` از `adminMock.x(...)` به `apiRequest(...)` تغییر کند.

نشست ادمین جدا از نشست کاربر است (`sessionStorage`، `AdminAuthContext`). چون بک‌اند نه احراز هویت ادمین
دارد و نه ستون `role` در جدول `users`، **هیچ ستون یا نقش جدیدی اختراع نشده**؛ فقط یک گیت محلی و موقت
گذاشته شده تا کاربر عادی UI ادمین را نبیند. رمز موقت توسعه: `studentwork-admin`.

---

## نکات پیاده‌سازی

**احراز هویت** — توکن Sanctum در `localStorage` نگه داشته می‌شود و در هدر `Authorization: Bearer` می‌رود.
هر پاسخ ۴۰۱ توکن را پاک و کاربر را خارج می‌کند. بک‌اند فعلی فقط `POST /api/login` با فیلد `mobile` دارد؛
مسیر OTP ندارد و فرم ورود هم مرحلهٔ کد تایید ندارد.

**آپلود فایل روی PATCH** — PHP بدنهٔ `multipart` را روی PATCH پارس نمی‌کند، بنابراین ویرایش پروفایل با
`POST` + فیلد `_method=PATCH` ارسال می‌شود (`buildFormData` در `api/client.ts`).

**پیش‌نمایش فایل تحویل** — این مسیرها هدر `Authorization` لازم دارند، پس `<a href>` ساده کار نمی‌کند.
ترتیب کار: کلیک کاربر → `window.open()` **فوری** → `fetch` احراز هویت‌شده → Blob URL → ست کردن
`location` همان پنجره. پنجره قبل از هر `await` باز می‌شود تا پاپ‌آپ‌بلاکر جلویش را نگیرد. اگر پاپ‌آپ
مسدود شود، پیش‌نمایش **به دانلود تبدیل نمی‌شود**؛ فقط پیام خطا نشان داده می‌شود. دانلود فقط کار دکمهٔ
«دانلود» است.

**قانون دسترسی دانلود** — کارجو همیشه، کارفرما فقط بعد از `paid`. این قانون در UI هم منعکس می‌شود
(قبل از پرداخت: پیش‌نمایش فعال، دانلود غیرفعال)، ولی **تصمیم نهایی با بک‌اند** است.

**فایل‌های Task/Application** — فرانت مسیر Storage را حدس نمی‌زند و `download_url` را عیناً از پاسخ
بک‌اند می‌گیرد. اگر بک‌اند این فیلد را ندهد، به‌جای ساختن URL جعلی، «نشانی فایل موجود نیست» نمایش
داده می‌شود.

**اعلانات** — بک‌اند به‌محض بازگرداندن هر صفحه، اعلان‌های خوانده‌نشدهٔ همان صفحه را `is_read = true`
می‌کند و `unread_count` مقدار *قبل از* این تغییر است. دکمهٔ «خواندن همه» ساخته نشده چون endpoint ندارد.

**مدیریت خطا** — `ApiError` وضعیت + پیام بک‌اند + خطاهای اعتبارسنجی را نگه می‌دارد. ۴۰۳/۴۰۴/۴۰۹/۴۲۲/۵۰۰
هر کدام عنوان فارسی مخصوص خود را دارند و پیام بک‌اند همیشه نمایش داده می‌شود.

**تاریخ شمسی** بدون کتابخانه، از `Intl.DateTimeFormat('fa-IR-u-ca-persian')`.

---

## محدودیت‌های شناخته‌شدهٔ بک‌اند فعلی

این‌ها در UI به‌صورت صادقانه بازتاب داده شده‌اند، نه با داده جعلی:

1. **`GET /api/tasks`** فقط `id, user_id, title, budget, created_at` برمی‌گرداند — بدون `category` و
   `deadline`. کارت تسک در خانه و فهرست تسک‌ها همان چیزی را نشان می‌دهد که واقعاً می‌آید.
2. **`GET /api/projects/{id}/deliveries`** فایل‌ها را برنمی‌گرداند؛ فایل‌ها با کلیک روی «نمایش فایل‌ها»
   از `GET /api/deliveries/{id}` گرفته می‌شوند.
3. **`GET /api/deliveries/{id}`** فیلد `rejection_reason` ندارد؛ این مقدار از فهرست تحویل‌های همان
   پروژه خوانده می‌شود.
4. **`GET /api/complaints/{id}`** فقط به ثبت‌کنندهٔ شکایت اجازه می‌دهد؛ برای «شکایات مربوط به
   پروژه‌های من» فقط خلاصه نمایش داده می‌شود.
5. **`GET /api/applications?type=sent`** نام کارفرما را برنمی‌گرداند (فقط `task.user_id`).
6. **`GET /api/categories`** وجود ندارد؛ فهرست دسته‌بندی‌ها در `src/lib/mock/categories.ts` از روی
   `CategorySeeder` نگه داشته می‌شود.
7. **آواتار و رزومه** URL عمومی ندارند؛ آواتار متنی نمایش داده می‌شود.
8. **مسیرهای OTP** و **مسیرهای ادمین** وجود ندارند.

هرجا چنین کمبودی هست، در کد یک کامنت `TODO(backend)` یا توضیح صریح گذاشته شده است.

---

## Flow دمو

**کارفرما**
`/` → `/tasks` → `/tasks/:id` → «درخواست‌های همکاری» → پذیرش (مستقیم وارد `/projects/{id}` می‌شوید)
→ بررسی تحویل → تایید → پرداخت → دانلود → ثبت رضایت

**کارجو**
`/tasks` → `/tasks/:id` → «ارسال درخواست همکاری» → `/applications/sent` → پس از پذیرش،
`/projects/active/worker` → `/projects/{id}` → «ثبت تحویل» → پیش‌نمایش/دانلود → ثبت رضایت

**ادمین**
`/admin/login` (رمز موقت `studentwork-admin`) → `/admin` → شکایات، کاربران، تسک‌ها، پروژه‌ها
