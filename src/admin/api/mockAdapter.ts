/**
 * Mock Adapter موقت پنل ادمین.
 *
 * ⚠️ این فایل هیچ ارتباطی با بک‌اند ندارد و هیچ درخواست شبکه‌ای نمی‌زند.
 * فقط تا زمانی زنده است که APIهای /api/admin/... در بک‌اند ساخته شوند؛ بعد از آن
 * توابع adminApi.ts یکی‌یکی از اینجا به apiRequest سوییچ می‌شوند و این فایل حذف می‌شود.
 *
 * داده‌ها عمداً با enumها و ستون‌های واقعی دیتابیس هماهنگ‌اند تا shape تغییر نکند.
 */

import type {
  AdminApplicationDetail,
  AdminApplicationRow,
  AdminCategoryRow,
  AdminComplaintDecisionInput,
  AdminComplaintDetail,
  AdminComplaintRow,
  AdminDeliveryRow,
  AdminOverview,
  AdminPaginated,
  AdminProjectDetail,
  AdminProjectRow,
  AdminReviewRow,
  AdminSkillRow,
  AdminTaskDetail,
  AdminTaskRow,
  AdminUserDetail,
  AdminUserRow,
} from './types'

/** تأخیر کوتاه تا حالت‌های loading در UI واقعاً دیده و تست شوند */
const LATENCY_MS = 260

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => window.setTimeout(() => resolve(value), LATENCY_MS))
}

function daysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function daysAhead(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString()
}

function paginate<T>(items: T[], page: number, perPage = 10): AdminPaginated<T> {
  const start = (page - 1) * perPage
  return {
    data: items.slice(start, start + perPage),
    current_page: page,
    last_page: Math.max(1, Math.ceil(items.length / perPage)),
    per_page: perPage,
    total: items.length,
  }
}

/** خطای ساده و یکنواخت برای mock — همان شکل پیامی که بک‌اند می‌دهد */
export class MockError extends Error {
  readonly status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'MockError'
    this.status = status
  }
}

// ---------------------------------------------------------------- داده پایه

const USERS: AdminUserDetail[] = [
  {
    id: 1,
    full_name: 'علی احمدی',
    mobile: '09120000001',
    student_number: '400123456',
    field_of_study: 'مهندسی کامپیوتر',
    university_name: 'دانشگاه تهران',
    is_active: true,
    created_at: daysAgo(120),
    email: 'ali@example.com',
    bio: 'دانشجوی ترم ۷ کامپیوتر، بیشتر کارفرما.',
    skills: [{ id: 1, name: 'Laravel' }],
    tasks_count: 4,
    applications_count: 0,
    projects_count: 3,
  },
  {
    id: 2,
    full_name: 'رضا محمدی',
    mobile: '09120000002',
    student_number: '400234567',
    field_of_study: 'مهندسی نرم‌افزار',
    university_name: 'دانشگاه شریف',
    is_active: true,
    created_at: daysAgo(95),
    email: null,
    bio: 'توسعه‌دهنده بک‌اند.',
    skills: [
      { id: 1, name: 'Laravel' },
      { id: 2, name: 'PHP' },
    ],
    tasks_count: 1,
    applications_count: 6,
    projects_count: 4,
  },
  {
    id: 3,
    full_name: 'حسن کریمی',
    mobile: '09120000003',
    student_number: '401345678',
    field_of_study: 'ریاضی کاربردی',
    university_name: 'دانشگاه امیرکبیر',
    is_active: true,
    created_at: daysAgo(60),
    email: 'hasan@example.com',
    bio: null,
    skills: [{ id: 5, name: 'ساختمان داده' }],
    tasks_count: 0,
    applications_count: 9,
    projects_count: 2,
  },
  {
    id: 4,
    full_name: 'مریم رضایی',
    mobile: '09120000004',
    student_number: '401456789',
    field_of_study: 'گرافیک',
    university_name: 'دانشگاه هنر',
    is_active: false,
    created_at: daysAgo(40),
    email: null,
    bio: 'طراح گرافیک پروژه‌های دانشگاهی.',
    skills: [{ id: 7, name: 'Photoshop' }],
    tasks_count: 2,
    applications_count: 3,
    projects_count: 1,
  },
  {
    id: 5,
    full_name: 'سارا موسوی',
    mobile: '09120000005',
    student_number: '402567890',
    field_of_study: 'مدیریت',
    university_name: 'دانشگاه علامه',
    is_active: true,
    created_at: daysAgo(12),
    email: null,
    bio: null,
    skills: [],
    tasks_count: 1,
    applications_count: 1,
    projects_count: 0,
  },
]

const CATEGORIES: AdminCategoryRow[] = [
  { id: 1, name: 'حل تمرین', slug: 'homework', tasks_count: 12, created_at: daysAgo(200) },
  { id: 2, name: 'پروژه درسی', slug: 'course-project', tasks_count: 9, created_at: daysAgo(200) },
  { id: 3, name: 'طراحی پاورپوینت', slug: 'powerpoint-design', tasks_count: 5, created_at: daysAgo(200) },
  { id: 4, name: 'تحقیق و مقاله', slug: 'research-article', tasks_count: 4, created_at: daysAgo(200) },
  { id: 5, name: 'تایپ و ترجمه', slug: 'typing-translation', tasks_count: 3, created_at: daysAgo(200) },
  { id: 6, name: 'تدریس خصوصی', slug: 'private-tutoring', tasks_count: 2, created_at: daysAgo(200) },
  { id: 7, name: 'رفع اشکال درس', slug: 'problem-solving', tasks_count: 1, created_at: daysAgo(200) },
  { id: 8, name: 'پروژه پایانی', slug: 'final-project', tasks_count: 6, created_at: daysAgo(200) },
  { id: 9, name: 'پایان‌نامه', slug: 'thesis', tasks_count: 2, created_at: daysAgo(200) },
  {
    id: 10,
    name: 'طراحی گرافیکی پروژه دانشگاهی',
    slug: 'graphic-design',
    tasks_count: 3,
    created_at: daysAgo(200),
  },
]

const SKILLS: AdminSkillRow[] = [
  { id: 1, name: 'Laravel', tasks_count: 7, users_count: 3, created_at: daysAgo(200) },
  { id: 2, name: 'PHP', tasks_count: 6, users_count: 3, created_at: daysAgo(200) },
  { id: 3, name: 'React', tasks_count: 4, users_count: 2, created_at: daysAgo(200) },
  { id: 4, name: 'MySQL', tasks_count: 5, users_count: 2, created_at: daysAgo(200) },
  { id: 5, name: 'ساختمان داده', tasks_count: 3, users_count: 2, created_at: daysAgo(200) },
  { id: 6, name: 'الگوریتم', tasks_count: 3, users_count: 1, created_at: daysAgo(200) },
  { id: 7, name: 'Photoshop', tasks_count: 2, users_count: 1, created_at: daysAgo(200) },
  { id: 8, name: 'ترجمه انگلیسی', tasks_count: 2, users_count: 1, created_at: daysAgo(200) },
]

const TASKS: AdminTaskDetail[] = [
  {
    id: 1,
    title: 'حل تمرین ساختمان داده — فصل ۴',
    budget: 850_000,
    deadline: daysAhead(4),
    status: 'assigned',
    created_at: daysAgo(14),
    category: { id: 1, name: 'حل تمرین' },
    owner: { id: 1, full_name: 'علی احمدی' },
    description: 'تمرین‌های فصل ۳ و ۴ کتاب مرجع، همراه با توضیح مراحل حل.',
    skills: [
      { id: 5, name: 'ساختمان داده' },
      { id: 6, name: 'الگوریتم' },
    ],
    files_count: 1,
    applications_count: 3,
  },
  {
    id: 2,
    title: 'پیاده‌سازی API فروشگاه با Laravel',
    budget: 4_500_000,
    deadline: daysAhead(12),
    status: 'open',
    created_at: daysAgo(6),
    category: { id: 2, name: 'پروژه درسی' },
    owner: { id: 1, full_name: 'علی احمدی' },
    description: 'CRUD محصولات، احراز هویت Sanctum و تست‌های Feature.',
    skills: [
      { id: 1, name: 'Laravel' },
      { id: 4, name: 'MySQL' },
    ],
    files_count: 0,
    applications_count: 2,
  },
  {
    id: 3,
    title: 'طراحی پاورپوینت ارائه درس پایگاه داده',
    budget: 600_000,
    deadline: daysAhead(2),
    status: 'assigned',
    created_at: daysAgo(9),
    category: { id: 3, name: 'طراحی پاورپوینت' },
    owner: { id: 2, full_name: 'رضا محمدی' },
    description: '۲۰ اسلاید با قالب یکدست و نمودارهای ساده.',
    skills: [{ id: 7, name: 'Photoshop' }],
    files_count: 2,
    applications_count: 4,
  },
  {
    id: 4,
    title: 'ترجمه مقاله انگلیسی شبکه‌های عصبی',
    budget: 1_200_000,
    deadline: daysAgo(2),
    status: 'completed',
    created_at: daysAgo(30),
    category: { id: 5, name: 'تایپ و ترجمه' },
    owner: { id: 4, full_name: 'مریم رضایی' },
    description: 'ترجمه ۱۲ صفحه مقاله همراه با حفظ اصطلاحات تخصصی.',
    skills: [{ id: 8, name: 'ترجمه انگلیسی' }],
    files_count: 1,
    applications_count: 5,
  },
  {
    id: 5,
    title: 'رفع اشکال پروژه React دانشگاهی',
    budget: 950_000,
    deadline: daysAhead(8),
    status: 'open',
    created_at: daysAgo(2),
    category: { id: 7, name: 'رفع اشکال درس' },
    owner: { id: 5, full_name: 'سارا موسوی' },
    description: 'رفع باگ‌های روتینگ و state management.',
    skills: [{ id: 3, name: 'React' }],
    files_count: 0,
    applications_count: 1,
  },
  {
    id: 6,
    title: 'تحقیق درباره الگوریتم‌های مرتب‌سازی',
    budget: 500_000,
    deadline: daysAgo(10),
    status: 'cancelled',
    created_at: daysAgo(45),
    category: { id: 4, name: 'تحقیق و مقاله' },
    owner: { id: 4, full_name: 'مریم رضایی' },
    description: 'یک تحقیق ۱۵ صفحه‌ای با منابع معتبر.',
    skills: [{ id: 6, name: 'الگوریتم' }],
    files_count: 0,
    applications_count: 0,
  },
]

const APPLICATIONS: AdminApplicationDetail[] = [
  {
    id: 1,
    status: 'accepted',
    created_at: daysAgo(13),
    task: { id: 1, title: 'حل تمرین ساختمان داده — فصل ۴' },
    applicant: { id: 3, full_name: 'حسن کریمی' },
    employer: { id: 1, full_name: 'علی احمدی' },
    description: 'این درس را با نمره ۱۹ گذرانده‌ام و می‌توانم مراحل حل را کامل توضیح دهم.',
    files_count: 1,
    project_id: 1,
  },
  {
    id: 2,
    status: 'rejected',
    created_at: daysAgo(13),
    task: { id: 1, title: 'حل تمرین ساختمان داده — فصل ۴' },
    applicant: { id: 2, full_name: 'رضا محمدی' },
    employer: { id: 1, full_name: 'علی احمدی' },
    description: 'تجربه حل تمرین‌های مشابه را دارم.',
    files_count: 0,
    project_id: null,
  },
  {
    id: 3,
    status: 'pending',
    created_at: daysAgo(4),
    task: { id: 2, title: 'پیاده‌سازی API فروشگاه با Laravel' },
    applicant: { id: 2, full_name: 'رضا محمدی' },
    employer: { id: 1, full_name: 'علی احمدی' },
    description: 'چند پروژه مشابه با Laravel و Sanctum انجام داده‌ام.',
    files_count: 2,
    project_id: null,
  },
  {
    id: 4,
    status: 'accepted',
    created_at: daysAgo(8),
    task: { id: 3, title: 'طراحی پاورپوینت ارائه درس پایگاه داده' },
    applicant: { id: 4, full_name: 'مریم رضایی' },
    employer: { id: 2, full_name: 'رضا محمدی' },
    description: 'نمونه‌کارهای طراحی اسلاید را پیوست کرده‌ام.',
    files_count: 3,
    project_id: 2,
  },
  {
    id: 5,
    status: 'accepted',
    created_at: daysAgo(28),
    task: { id: 4, title: 'ترجمه مقاله انگلیسی شبکه‌های عصبی' },
    applicant: { id: 3, full_name: 'حسن کریمی' },
    employer: { id: 4, full_name: 'مریم رضایی' },
    description: 'مدرک زبان دارم و با اصطلاحات یادگیری ماشین آشنا هستم.',
    files_count: 0,
    project_id: 3,
  },
  {
    id: 6,
    status: 'pending',
    created_at: daysAgo(1),
    task: { id: 5, title: 'رفع اشکال پروژه React دانشگاهی' },
    applicant: { id: 3, full_name: 'حسن کریمی' },
    employer: { id: 5, full_name: 'سارا موسوی' },
    description: 'با React Router و Zustand کار کرده‌ام.',
    files_count: 0,
    project_id: null,
  },
]

const PROJECTS: AdminProjectDetail[] = [
  {
    id: 1,
    title: 'حل تمرین ساختمان داده — فصل ۴',
    amount: 850_000,
    deadline: daysAhead(4),
    status: 'disputed',
    payment_status: 'unpaid',
    completed_at: null,
    created_at: daysAgo(13),
    employer: { id: 1, full_name: 'علی احمدی' },
    worker: { id: 3, full_name: 'حسن کریمی' },
    application_id: 1,
    task_id: 1,
    started_at: daysAgo(13),
    deliveries_count: 2,
    complaints_count: 1,
  },
  {
    id: 2,
    title: 'طراحی پاورپوینت ارائه درس پایگاه داده',
    amount: 600_000,
    deadline: daysAhead(2),
    status: 'submitted',
    payment_status: 'unpaid',
    completed_at: null,
    created_at: daysAgo(8),
    employer: { id: 2, full_name: 'رضا محمدی' },
    worker: { id: 4, full_name: 'مریم رضایی' },
    application_id: 4,
    task_id: 3,
    started_at: daysAgo(8),
    deliveries_count: 1,
    complaints_count: 0,
  },
  {
    id: 3,
    title: 'ترجمه مقاله انگلیسی شبکه‌های عصبی',
    amount: 1_200_000,
    deadline: daysAgo(2),
    status: 'completed',
    payment_status: 'paid',
    completed_at: daysAgo(3),
    created_at: daysAgo(28),
    employer: { id: 4, full_name: 'مریم رضایی' },
    worker: { id: 3, full_name: 'حسن کریمی' },
    application_id: 5,
    task_id: 4,
    started_at: daysAgo(28),
    deliveries_count: 1,
    complaints_count: 0,
  },
  {
    id: 4,
    title: 'پروژه درسی قدیمی — لغو شده',
    amount: 700_000,
    deadline: daysAgo(20),
    status: 'cancelled',
    payment_status: 'unpaid',
    completed_at: null,
    created_at: daysAgo(50),
    employer: { id: 1, full_name: 'علی احمدی' },
    worker: { id: 2, full_name: 'رضا محمدی' },
    application_id: 2,
    task_id: 6,
    started_at: daysAgo(50),
    deliveries_count: 0,
    complaints_count: 0,
  },
]

const DELIVERIES: AdminDeliveryRow[] = [
  {
    id: 1,
    project_id: 1,
    description: 'تمرین‌های فصل ۳ حل و در فایل PDF ارسال شد.',
    status: 'rejected',
    submitted_at: daysAgo(7),
    rejection_reason: 'تمرین‌های فصل ۴ حل نشده و فقط فصل ۳ ارسال شده است.',
    edit_count: 0,
    files: [{ id: 1, original_name: 'ch3-solutions.pdf', mime_type: 'application/pdf', size: 842_000 }],
  },
  {
    id: 2,
    project_id: 1,
    description: 'نسخه اصلاح‌شده شامل هر دو فصل.',
    status: 'pending',
    submitted_at: daysAgo(3),
    rejection_reason: null,
    edit_count: 1,
    files: [
      { id: 2, original_name: 'ch3-ch4-solutions.pdf', mime_type: 'application/pdf', size: 1_420_000 },
      { id: 3, original_name: 'notes.txt', mime_type: 'text/plain', size: 4_200 },
    ],
  },
  {
    id: 3,
    project_id: 2,
    description: 'فایل پاورپوینت ۲۰ اسلایدی با قالب یکدست.',
    status: 'pending',
    submitted_at: daysAgo(1),
    rejection_reason: null,
    edit_count: 0,
    files: [
      {
        id: 4,
        original_name: 'database-presentation.pptx',
        mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        size: 5_200_000,
      },
    ],
  },
  {
    id: 4,
    project_id: 3,
    description: 'ترجمه کامل مقاله همراه با واژه‌نامه اصطلاحات.',
    status: 'accepted',
    submitted_at: daysAgo(5),
    rejection_reason: null,
    edit_count: 0,
    files: [
      { id: 5, original_name: 'translation.docx', mime_type: 'application/msword', size: 320_000 },
    ],
  },
]

const COMPLAINTS: AdminComplaintDetail[] = [
  {
    id: 1,
    title: 'تحویل ناقص است و مهلت رو به پایان است',
    status: 'pending',
    created_at: daysAgo(2),
    project_id: 1,
    complainant: { id: 1, full_name: 'علی احمدی' },
    description:
      'دو بار تحویل رد شد و نسخه آخر هم بخشی از تمرین‌های فصل ۴ را ندارد. با توجه به نزدیک بودن مهلت، درخواست بررسی دارم.',
    admin_response: null,
    complainant_role: 'employer',
    other_participant: { id: 3, full_name: 'حسن کریمی' },
    project: {
      id: 1,
      status: 'disputed',
      payment_status: 'unpaid',
      amount: 850_000,
      deadline: daysAhead(4),
    },
    task: { id: 1, title: 'حل تمرین ساختمان داده — فصل ۴' },
    application: { id: 1 },
    attachments: [
      { id: 1, original_name: 'screenshot.png', mime_type: 'image/png', size: 240_000 },
    ],
    deliveries: DELIVERIES.filter((item) => item.project_id === 1),
  },
  {
    id: 2,
    title: 'رد شدن بی‌دلیل تحویل',
    status: 'reviewing',
    created_at: daysAgo(6),
    project_id: 2,
    complainant: { id: 4, full_name: 'مریم رضایی' },
    description:
      'تحویل مطابق شرح تسک انجام شده ولی کارفرما بدون توضیح دقیق آن را رد کرده است. درخواست داوری دارم.',
    admin_response: null,
    complainant_role: 'worker',
    other_participant: { id: 2, full_name: 'رضا محمدی' },
    project: {
      id: 2,
      status: 'submitted',
      payment_status: 'unpaid',
      amount: 600_000,
      deadline: daysAhead(2),
    },
    task: { id: 3, title: 'طراحی پاورپوینت ارائه درس پایگاه داده' },
    application: { id: 4 },
    attachments: [],
    deliveries: DELIVERIES.filter((item) => item.project_id === 2),
  },
  {
    id: 3,
    title: 'تأخیر در پرداخت دستمزد',
    status: 'resolved',
    created_at: daysAgo(20),
    project_id: 3,
    complainant: { id: 3, full_name: 'حسن کریمی' },
    description: 'پروژه تایید شد ولی دستمزد پرداخت نشده بود.',
    admin_response: 'پس از پیگیری، کارفرما دستمزد را پرداخت کرد و پرونده بسته شد.',
    complainant_role: 'worker',
    other_participant: { id: 4, full_name: 'مریم رضایی' },
    project: {
      id: 3,
      status: 'completed',
      payment_status: 'paid',
      amount: 1_200_000,
      deadline: daysAgo(2),
    },
    task: { id: 4, title: 'ترجمه مقاله انگلیسی شبکه‌های عصبی' },
    application: { id: 5 },
    attachments: [],
    deliveries: DELIVERIES.filter((item) => item.project_id === 3),
  },
  {
    id: 4,
    title: 'ادعای کپی بودن خروجی',
    status: 'rejected',
    created_at: daysAgo(35),
    project_id: 4,
    complainant: { id: 1, full_name: 'علی احمدی' },
    description: 'به نظر می‌رسد بخشی از خروجی از اینترنت کپی شده است.',
    admin_response: 'بررسی انجام شد؛ مشابهت در حد ارجاع معمول بود و شکایت وارد تشخیص داده نشد.',
    complainant_role: 'employer',
    other_participant: { id: 2, full_name: 'رضا محمدی' },
    project: {
      id: 4,
      status: 'cancelled',
      payment_status: 'unpaid',
      amount: 700_000,
      deadline: daysAgo(20),
    },
    task: { id: 6, title: 'تحقیق درباره الگوریتم‌های مرتب‌سازی' },
    application: { id: 2 },
    attachments: [],
    deliveries: [],
  },
]

const REVIEWS: AdminReviewRow[] = [
  {
    id: 1,
    project_id: 3,
    project_title: 'ترجمه مقاله انگلیسی شبکه‌های عصبی',
    reviewer: { id: 4, full_name: 'مریم رضایی' },
    reviewed_user: { id: 3, full_name: 'حسن کریمی' },
    is_satisfied: true,
    created_at: daysAgo(2),
  },
  {
    id: 2,
    project_id: 3,
    project_title: 'ترجمه مقاله انگلیسی شبکه‌های عصبی',
    reviewer: { id: 3, full_name: 'حسن کریمی' },
    reviewed_user: { id: 4, full_name: 'مریم رضایی' },
    is_satisfied: true,
    created_at: daysAgo(2),
  },
  {
    id: 3,
    project_id: 4,
    project_title: 'پروژه درسی قدیمی — لغو شده',
    reviewer: { id: 1, full_name: 'علی احمدی' },
    reviewed_user: { id: 2, full_name: 'رضا محمدی' },
    is_satisfied: false,
    created_at: daysAgo(19),
  },
]

// ---------------------------------------------------------------- توابع mock

function toUserRow(user: AdminUserDetail): AdminUserRow {
  const { email: _e, bio: _b, skills: _s, tasks_count: _t, applications_count: _a, projects_count: _p, ...row } =
    user
  return row
}

function toTaskRow(task: AdminTaskDetail): AdminTaskRow {
  const { description: _d, skills: _s, files_count: _f, applications_count: _a, ...row } = task
  return row
}

function toApplicationRow(application: AdminApplicationDetail): AdminApplicationRow {
  const { description: _d, files_count: _f, project_id: _p, ...row } = application
  return row
}

function toProjectRow(project: AdminProjectDetail): AdminProjectRow {
  const {
    application_id: _a,
    task_id: _t,
    started_at: _s,
    deliveries_count: _d,
    complaints_count: _c,
    ...row
  } = project
  return row
}

function toComplaintRow(complaint: AdminComplaintDetail): AdminComplaintRow {
  const {
    description: _d,
    admin_response: _r,
    complainant_role: _cr,
    other_participant: _o,
    project: _p,
    task: _t,
    application: _ap,
    attachments: _at,
    deliveries: _dl,
    ...row
  } = complaint
  return row
}

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase())
}

export const adminMock = {
  overview(): Promise<AdminOverview> {
    return delay<AdminOverview>({
      stats: {
        total_users: USERS.length,
        active_users: USERS.filter((user) => user.is_active).length,
        inactive_users: USERS.filter((user) => !user.is_active).length,
        open_tasks: TASKS.filter((task) => task.status === 'open').length,
        active_projects: PROJECTS.filter((project) =>
          ['in_progress', 'submitted', 'revision_requested', 'disputed'].includes(project.status),
        ).length,
        completed_projects: PROJECTS.filter((project) => project.status === 'completed').length,
        disputed_projects: PROJECTS.filter((project) => project.status === 'disputed').length,
        paid_projects: PROJECTS.filter((project) => project.payment_status === 'paid').length,
        pending_complaints: COMPLAINTS.filter((item) => item.status === 'pending').length,
        reviewing_complaints: COMPLAINTS.filter((item) => item.status === 'reviewing').length,
        resolved_complaints: COMPLAINTS.filter((item) => item.status === 'resolved').length,
        rejected_complaints: COMPLAINTS.filter((item) => item.status === 'rejected').length,
      },
      activity: {
        latest_users: [...USERS]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 5)
          .map(toUserRow),
        latest_tasks: [...TASKS]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 5)
          .map(toTaskRow),
        latest_projects: [...PROJECTS]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 5)
          .map(toProjectRow),
        latest_complaints: [...COMPLAINTS]
          .sort((a, b) => b.created_at.localeCompare(a.created_at))
          .slice(0, 5)
          .map(toComplaintRow),
      },
    })
  },

  users(params: { page?: number; search?: string; active?: 'all' | 'active' | 'inactive' }) {
    const search = params.search?.trim() ?? ''
    const filtered = USERS.filter((user) => {
      if (params.active === 'active' && !user.is_active) return false
      if (params.active === 'inactive' && user.is_active) return false
      if (!search) return true
      return (
        matches(user.full_name, search) ||
        matches(user.mobile, search) ||
        matches(user.student_number, search) ||
        matches(user.university_name, search)
      )
    }).map(toUserRow)
    return delay(paginate(filtered, params.page ?? 1))
  },

  user(userId: number): Promise<AdminUserDetail> {
    const found = USERS.find((user) => user.id === userId)
    if (!found) return Promise.reject(new MockError(404, 'کاربر موردنظر پیدا نشد.'))
    return delay({ ...found })
  },

  setUserStatus(userId: number, isActive: boolean): Promise<AdminUserDetail> {
    const found = USERS.find((user) => user.id === userId)
    if (!found) return Promise.reject(new MockError(404, 'کاربر موردنظر پیدا نشد.'))
    found.is_active = isActive
    return delay({ ...found })
  },

  tasks(params: {
    page?: number
    search?: string
    status?: string
    categoryId?: number | 'all'
  }) {
    const search = params.search?.trim() ?? ''
    const filtered = TASKS.filter((task) => {
      if (params.status && params.status !== 'all' && task.status !== params.status) return false
      if (params.categoryId && params.categoryId !== 'all' && task.category.id !== params.categoryId) {
        return false
      }
      if (!search) return true
      return matches(task.title, search) || matches(task.owner.full_name, search)
    }).map(toTaskRow)
    return delay(paginate(filtered, params.page ?? 1))
  },

  task(taskId: number): Promise<AdminTaskDetail> {
    const found = TASKS.find((task) => task.id === taskId)
    if (!found) return Promise.reject(new MockError(404, 'تسک موردنظر پیدا نشد.'))
    return delay({ ...found })
  },

  cancelTask(taskId: number): Promise<AdminTaskDetail> {
    const found = TASKS.find((task) => task.id === taskId)
    if (!found) return Promise.reject(new MockError(404, 'تسک موردنظر پیدا نشد.'))
    if (found.status !== 'open') {
      return Promise.reject(new MockError(409, 'فقط تسک باز قابل لغو است.'))
    }
    found.status = 'cancelled'
    return delay({ ...found })
  },

  applications(params: { page?: number; status?: string; search?: string }) {
    const search = params.search?.trim() ?? ''
    const filtered = APPLICATIONS.filter((application) => {
      if (params.status && params.status !== 'all' && application.status !== params.status) {
        return false
      }
      if (!search) return true
      return (
        matches(application.task.title, search) ||
        matches(application.applicant.full_name, search) ||
        matches(application.employer.full_name, search)
      )
    }).map(toApplicationRow)
    return delay(paginate(filtered, params.page ?? 1))
  },

  application(applicationId: number): Promise<AdminApplicationDetail> {
    const found = APPLICATIONS.find((item) => item.id === applicationId)
    if (!found) return Promise.reject(new MockError(404, 'درخواست همکاری پیدا نشد.'))
    return delay({ ...found })
  },

  projects(params: { page?: number; status?: string; paymentStatus?: string; search?: string }) {
    const search = params.search?.trim() ?? ''
    const filtered = PROJECTS.filter((project) => {
      if (params.status && params.status !== 'all' && project.status !== params.status) return false
      if (
        params.paymentStatus &&
        params.paymentStatus !== 'all' &&
        project.payment_status !== params.paymentStatus
      ) {
        return false
      }
      if (!search) return true
      return (
        matches(project.title, search) ||
        matches(project.employer.full_name, search) ||
        matches(project.worker.full_name, search)
      )
    }).map(toProjectRow)
    return delay(paginate(filtered, params.page ?? 1))
  },

  project(projectId: number): Promise<AdminProjectDetail> {
    const found = PROJECTS.find((project) => project.id === projectId)
    if (!found) return Promise.reject(new MockError(404, 'پروژه موردنظر پیدا نشد.'))
    return delay({ ...found })
  },

  projectDeliveries(projectId: number): Promise<AdminDeliveryRow[]> {
    return delay(DELIVERIES.filter((delivery) => delivery.project_id === projectId))
  },

  complaints(params: { page?: number; status?: string; search?: string; from?: string; to?: string }) {
    const search = params.search?.trim() ?? ''
    const filtered = COMPLAINTS.filter((complaint) => {
      if (params.status && params.status !== 'all' && complaint.status !== params.status) return false
      if (params.from && complaint.created_at < params.from) return false
      if (params.to && complaint.created_at > `${params.to}T23:59:59.999Z`) return false
      if (!search) return true
      return (
        matches(complaint.title, search) ||
        matches(complaint.complainant.full_name, search) ||
        matches(String(complaint.project_id), search)
      )
    }).map(toComplaintRow)
    return delay(paginate(filtered, params.page ?? 1))
  },

  complaint(complaintId: number): Promise<AdminComplaintDetail> {
    const found = COMPLAINTS.find((item) => item.id === complaintId)
    if (!found) return Promise.reject(new MockError(404, 'شکایت موردنظر پیدا نشد.'))
    return delay({ ...found })
  },

  startComplaintReview(complaintId: number): Promise<AdminComplaintDetail> {
    const found = COMPLAINTS.find((item) => item.id === complaintId)
    if (!found) return Promise.reject(new MockError(404, 'شکایت موردنظر پیدا نشد.'))
    if (found.status !== 'pending') {
      return Promise.reject(new MockError(409, 'فقط شکایت در وضعیت «در انتظار بررسی» قابل شروع است.'))
    }
    found.status = 'reviewing'
    return delay({ ...found })
  },

  decideComplaint(
    complaintId: number,
    input: AdminComplaintDecisionInput,
  ): Promise<AdminComplaintDetail> {
    const found = COMPLAINTS.find((item) => item.id === complaintId)
    if (!found) return Promise.reject(new MockError(404, 'شکایت موردنظر پیدا نشد.'))
    if (found.status === 'resolved' || found.status === 'rejected') {
      return Promise.reject(new MockError(409, 'این شکایت قبلاً نتیجه گرفته است.'))
    }

    const project = PROJECTS.find((item) => item.id === found.project_id)
    const complainantIsEmployer = found.complainant_role === 'employer'

    found.status = input.decision === 'accept' ? 'resolved' : 'rejected'
    found.admin_response = input.admin_response

    /**
     * بازگرداندن وضعیت پروژه طبق Business Flow:
     *  - شکایت کارفرما (پروژه در وضعیت submitted ثبت شده):
     *      وارد  → revision_requested (یا cancelled)
     *      نادرست → submitted
     *  - شکایت کارجو (پروژه در وضعیت revision_requested ثبت شده):
     *      وارد  → submitted (یا cancelled)
     *      نادرست → revision_requested
     */
    if (project) {
      if (input.decision === 'accept') {
        project.status = input.cancelProject
          ? 'cancelled'
          : complainantIsEmployer
            ? 'revision_requested'
            : 'submitted'
      } else {
        project.status = complainantIsEmployer ? 'submitted' : 'revision_requested'
      }
      found.project = { ...found.project, status: project.status }
    }

    return delay({ ...found })
  },

  reviews(params: { page?: number; satisfied?: 'all' | 'yes' | 'no'; search?: string }) {
    const search = params.search?.trim() ?? ''
    const filtered = REVIEWS.filter((review) => {
      if (params.satisfied === 'yes' && !review.is_satisfied) return false
      if (params.satisfied === 'no' && review.is_satisfied) return false
      if (!search) return true
      return (
        matches(review.project_title, search) ||
        matches(review.reviewer.full_name, search) ||
        matches(review.reviewed_user.full_name, search)
      )
    })
    return delay(paginate(filtered, params.page ?? 1))
  },

  categories(): Promise<AdminCategoryRow[]> {
    return delay([...CATEGORIES])
  },

  createCategory(name: string, slug: string): Promise<AdminCategoryRow> {
    if (CATEGORIES.some((item) => item.name === name)) {
      return Promise.reject(new MockError(422, 'دسته‌بندی با این نام وجود دارد.'))
    }
    const created: AdminCategoryRow = {
      id: Math.max(0, ...CATEGORIES.map((item) => item.id)) + 1,
      name,
      slug,
      tasks_count: 0,
      created_at: new Date().toISOString(),
    }
    CATEGORIES.push(created)
    return delay(created)
  },

  updateCategory(categoryId: number, name: string, slug: string): Promise<AdminCategoryRow> {
    const found = CATEGORIES.find((item) => item.id === categoryId)
    if (!found) return Promise.reject(new MockError(404, 'دسته‌بندی پیدا نشد.'))
    found.name = name
    found.slug = slug
    return delay({ ...found })
  },

  /**
   * حذف دسته‌بندی.
   * ⚠️ در دیتابیس واقعی `tasks.category_id` با cascadeOnDelete تعریف شده؛ یعنی حذف یک
   * دسته‌بندی همهٔ تسک‌های آن را هم پاک می‌کند. بنابراین حذفِ دسته‌بندی دارای تسک اینجا
   * مسدود است و UI باید به فعال/غیرفعال‌سازی تبدیل شود.
   */
  deleteCategory(categoryId: number): Promise<{ ok: true }> {
    const found = CATEGORIES.find((item) => item.id === categoryId)
    if (!found) return Promise.reject(new MockError(404, 'دسته‌بندی پیدا نشد.'))
    if (found.tasks_count > 0) {
      return Promise.reject(
        new MockError(
          409,
          'این دسته‌بندی تسک دارد. رابطهٔ tasks.category_id در دیتابیس cascadeOnDelete است و حذف آن تسک‌ها را هم پاک می‌کند.',
        ),
      )
    }
    CATEGORIES.splice(CATEGORIES.indexOf(found), 1)
    return delay({ ok: true as const })
  },

  skills(): Promise<AdminSkillRow[]> {
    return delay([...SKILLS])
  },

  createSkill(name: string): Promise<AdminSkillRow> {
    if (SKILLS.some((item) => item.name === name)) {
      return Promise.reject(new MockError(422, 'مهارتی با این نام وجود دارد.'))
    }
    const created: AdminSkillRow = {
      id: Math.max(0, ...SKILLS.map((item) => item.id)) + 1,
      name,
      tasks_count: 0,
      users_count: 0,
      created_at: new Date().toISOString(),
    }
    SKILLS.push(created)
    return delay(created)
  },

  updateSkill(skillId: number, name: string): Promise<AdminSkillRow> {
    const found = SKILLS.find((item) => item.id === skillId)
    if (!found) return Promise.reject(new MockError(404, 'مهارت پیدا نشد.'))
    found.name = name
    return delay({ ...found })
  },

  /** همان محدودیت دسته‌بندی: skill_task و user_skills هر دو cascadeOnDelete هستند. */
  deleteSkill(skillId: number): Promise<{ ok: true }> {
    const found = SKILLS.find((item) => item.id === skillId)
    if (!found) return Promise.reject(new MockError(404, 'مهارت پیدا نشد.'))
    if (found.tasks_count > 0 || found.users_count > 0) {
      return Promise.reject(
        new MockError(
          409,
          'این مهارت به تسک یا کاربر وصل است. جدول‌های skill_task و user_skills با cascadeOnDelete تعریف شده‌اند و حذف آن این رابطه‌ها را هم پاک می‌کند.',
        ),
      )
    }
    SKILLS.splice(SKILLS.indexOf(found), 1)
    return delay({ ok: true as const })
  },
}
