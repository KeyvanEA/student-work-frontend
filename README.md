# StudentWork — Frontend

فرانت‌اند نسخهٔ Demo/Defense پلتفرم **استودنت‌ورک**؛ یک SPA مستقل که فقط از طریق REST API با بک‌اند Laravel (Sanctum) حرف می‌زند.

> بک‌اند در `../student-work` قرار دارد و **تغییری در آن داده نشده است**.

---

## استک

| مورد | انتخاب |
|---|---|
| فریم‌ورک | React ۱۹ |
| Build tool | Vite ۷ |
| زبان | TypeScript (strict) |
| استایل | Tailwind CSS ۴ (`@tailwindcss/vite`) |
| مسیریابی | React Router ۷ |
| State | Context برای احراز هویت + هوک‌های سبک `useApiResource` / `useMutation` |
| فونت | Vazirmatn (CDN) با fallback به Tahoma/system |

بدون Redux، بدون React Query — طبق بند ۱۱ نیازمندی‌ها، ساده‌ترین معماری کافی.

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

## ساختار پروژه

```
src/
├── api/            ← تنها لایه‌ای که با سرور حرف می‌زند
│   ├── endpoints.ts    همهٔ مسیرهای API در یک فایل
│   ├── client.ts       fetch wrapper، توکن، ApiError، method spoofing
│   ├── auth.ts  tasks.ts  applications.ts  projects.ts  deliveries.ts  profile.ts  files.ts
├── auth/           ← AuthContext (نشست، ورود، خروج)
├── hooks/          ← useApiResource / useMutation / useDocumentTitle
├── components/
│   ├── ui/         ← Button, Card, Modal, Toast, Field, FileInput, ErrorState, …
│   ├── layout/     ← AppShell, SideNav, BottomNav, TopBar, ProtectedRoute
│   └── domain/     ← TaskCard, ApplicationCard, DeliveryFileRow, FlowStepper, …
├── pages/          ← یک فایل به ازای هر صفحه (static/ برای صفحات Mock)
├── lib/            ← format (تاریخ شمسی، تومان، ارقام فارسی)، labels، recent، mock/
└── types/models.ts ← تایپ‌ها دقیقاً مطابق خروجی کنترلرهای Laravel
```

هیچ کامپوننت UI مستقیماً `fetch` نمی‌زند.

---

## نگاشت API

### صفحات Dynamic (متصل به API واقعی)

| صفحه | مسیر | Endpointهای مصرفی |
|---|---|---|
| ورود | `/login` | `POST /api/login` |
| خانه | `/` | `GET /api/tasks` |
| لیست تسک‌ها | `/tasks` | `GET /api/tasks` |
| جزئیات تسک | `/tasks/:id` | `GET /api/tasks/{id}`، `POST /api/tasks/{id}/applications`، `PATCH /api/tasks/{id}/cancel` |
| ثبت تسک | `/tasks/new` | `POST /api/tasks`، `GET /api/skills` |
| درخواست‌های یک تسک | `/tasks/:id/applications` | `GET /api/tasks/{id}/applications`، `PATCH /api/applications/{id}/accept`، `PATCH /api/applications/{id}/reject` |
| جزئیات درخواست | `/applications/:id` | `GET /api/applications/{id}` + accept/reject |
| جزئیات پروژه | `/projects/:id` | `GET /api/projects/{id}`، `POST /api/projects/{id}/deliveries`، `PATCH /api/projects/{id}/payment` |
| جزئیات تحویل | `/deliveries/:id` | `GET /api/deliveries/{id}`، preview، download، `PATCH …/accept`، `PATCH …/reject` |
| پروفایل | `/profile` | `GET /api/profile`، `POST /api/logout` |
| ویرایش پروفایل | `/profile/edit` | `PATCH /api/profile`، `GET /api/skills`، `PUT /api/profile/skills` |

### صفحات Static (بدون endpoint واقعی — با Mock و TODO)

| صفحه | مسیر | چرا Static |
|---|---|---|
| گفتگوها | `/messages` | جدول‌های `conversations`/`messages` هستند ولی route ندارند |
| اعلان‌ها | `/notifications` | جدول `notifications` هست، route نیست |
| تنظیمات | `/settings` | endpoint ندارد |
| پروفایل عمومی | `/users/:id` | `GET /users/{id}` ثبت نشده |
| جستجوی پیشرفته | `/search` | `GET /api/tasks` پارامتر فیلتر/جستجو نمی‌پذیرد |
| ثبت شکایت | `/complaints` | `complaints` route ندارد |
| پروژه‌ها (لیست) | `/projects` | endpoint لیست پروژه‌ها وجود ندارد |
| کارهای من | `/my-work` | لیست «تسک‌های من» و «درخواست‌های من» وجود ندارد |

صفحات لیستیِ Static به‌جای داده جعلی، **جعبهٔ ورود شناسه** می‌دهند که مقصدش صفحهٔ کاملاً Dynamic است.

---

## نکات پیاده‌سازی

**احراز هویت** — توکن Sanctum در `localStorage` نگه داشته می‌شود و در هدر `Authorization: Bearer` می‌رود. هر پاسخ ۴۰۱ توکن را پاک و کاربر را خارج می‌کند.

**آپلود فایل روی PATCH** — PHP بدنهٔ `multipart` را روی PATCH پارس نمی‌کند، بنابراین ویرایش پروفایل با `POST` + فیلد `_method=PATCH` ارسال می‌شود (`buildFormData` در `api/client.ts`).

**دانلود/پیش‌نمایش فایل** — این مسیرها هدر `Authorization` لازم دارند، پس با `<a href>` ساده کار نمی‌کنند؛ فایل با `fetch` گرفته، به Blob تبدیل و ذخیره می‌شود. `preview_url` عیناً از پاسخ API خوانده می‌شود و آدرس دانلود از همان URL ساخته می‌شود؛ فرانت هیچ مسیر Storage را حدس نمی‌زند.

**قانون دسترسی دانلود** — کارجو همیشه، کارفرما فقط بعد از `paid`. چون پاسخ `GET /api/deliveries/{id}` ارجاعی به پروژه ندارد، صفحهٔ تحویل با `?project=<id>` باز می‌شود تا نقش و وضعیت پرداخت از `GET /api/projects/{id}` خوانده شود. بدون آن پارامتر، دکمه فعال می‌ماند و **تصمیم نهایی با بک‌اند** است.

**مدیریت خطا** — `ApiError` وضعیت + پیام بک‌اند + خطاهای اعتبارسنجی را نگه می‌دارد. ۴۰۳/۴۰۴/۴۰۹/۴۲۲/۵۰۰ هر کدام عنوان فارسی مخصوص خود را دارند و پیام بک‌اند همیشه نمایش داده می‌شود.

**تاریخ شمسی** بدون کتابخانه، از `Intl.DateTimeFormat('fa-IR-u-ca-persian')`.

---

## Flow دمو

**کارفرما** (مثلاً `09120000001`):
`/tasks` → `/tasks/1` → «درخواست‌های همکاری» → پذیرش → `/projects/1` → تحویل → تایید → پرداخت → دانلود

**کارجو** (مثلاً `09120000002`):
`/tasks` → `/tasks/2` → «ارسال درخواست همکاری» → پس از پذیرش، `/projects/{id}` → «ثبت تحویل» → `/deliveries/{id}?project={id}` → پیش‌نمایش/دانلود

شماره‌های نمونه در خود صفحهٔ ورود زیر «حساب‌های نمونه برای دمو» فهرست شده‌اند.

---

## کارهای باقی‌مانده در بک‌اند

فهرست کامل در گزارش پروژه؛ خلاصه:

1. `ApplicationController::reject` به‌خاطر `throw new \Exception('Transaction Test')` جامانده همیشه ۵۰۰ می‌دهد.
2. برگرداندن `project_id` در پاسخ `accept`.
3. `GET /api/projects`، `GET /api/projects/{id}/deliveries`، `GET /api/users/me/tasks`، `GET /api/users/me/applications`، `GET /api/categories`.
4. مسیرهای OTP (`send-otp` / `verify-otp`).
5. سرو کردن فایل‌های Task/Application (الان روی دیسک خصوصی‌اند و `Storage::url` قابل استفاده نیست).

هرجا چنین کمبودی هست، در کد یک کامنت `TODO(backend)` گذاشته شده است.
