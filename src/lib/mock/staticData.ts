/**
 * ⚠️ داده Static برای صفحاتی که هیچ endpoint واقعی ندارند.
 * هیچ‌کدام از این‌ها به سرور ارسال یا از سرور خوانده نمی‌شود.
 *
 * TODO(backend): مسیرهای زیر در docs/06-API-Design.md طراحی شده‌اند ولی در
 * routes/api.php ثبت نشده‌اند:
 *   /conversations, /conversations/{id}/messages, /notifications,
 *   /users/{id}, /projects/{id}/complaints, /users/{id}/reviews
 */

export interface MockConversation {
  id: number
  peerName: string
  taskTitle: string
  lastMessage: string
  lastAt: string
  unread: number
}

export const MOCK_CONVERSATIONS: MockConversation[] = [
  {
    id: 1,
    peerName: 'رضا محمدی',
    taskTitle: 'حل تمرین ساختمان داده',
    lastMessage: 'سلام، تمرین‌ها رو دیدم. تا پنجشنبه تحویل می‌دم.',
    lastAt: '۱۰:۲۴',
    unread: 2,
  },
  {
    id: 2,
    peerName: 'حسن کریمی',
    taskTitle: 'طراحی پاورپوینت ارائه دانشگاهی',
    lastMessage: 'قالب رنگی مورد نظرتون آبی باشه یا سبز؟',
    lastAt: 'دیروز',
    unread: 0,
  },
  {
    id: 3,
    peerName: 'حسین رضایی',
    taskTitle: 'پروژه درسی Laravel',
    lastMessage: 'ممنون، فایل نهایی رو آپلود کردم.',
    lastAt: '۳ روز پیش',
    unread: 0,
  },
]

export interface MockMessage {
  id: number
  fromMe: boolean
  text: string
  at: string
}

export const MOCK_MESSAGES: MockMessage[] = [
  { id: 1, fromMe: false, text: 'سلام، درباره تسک ساختمان داده سوال داشتم.', at: '۰۹:۵۰' },
  { id: 2, fromMe: true, text: 'سلام، بفرمایید در خدمتم.', at: '۰۹:۵۲' },
  { id: 3, fromMe: false, text: 'تمرین‌های فصل ۴ هم شامل می‌شه؟', at: '۱۰:۰۵' },
  { id: 4, fromMe: true, text: 'بله، فصل ۳ و ۴ هر دو.', at: '۱۰:۱۱' },
  { id: 5, fromMe: false, text: 'عالیه. تا پنجشنبه تحویل می‌دم.', at: '۱۰:۲۴' },
]

export interface MockNotification {
  id: number
  kind: 'application' | 'delivery' | 'payment' | 'system'
  title: string
  body: string
  at: string
  read: boolean
}

export const MOCK_NOTIFICATIONS: MockNotification[] = [
  {
    id: 1,
    kind: 'application',
    title: 'درخواست همکاری جدید',
    body: 'رضا محمدی برای «حل تمرین ساختمان داده» درخواست همکاری فرستاد.',
    at: '۱۵ دقیقه پیش',
    read: false,
  },
  {
    id: 2,
    kind: 'delivery',
    title: 'تحویل جدید ثبت شد',
    body: 'کارجو برای پروژه «پروژه درسی Laravel» فایل تحویل را ارسال کرد.',
    at: '۲ ساعت پیش',
    read: false,
  },
  {
    id: 3,
    kind: 'payment',
    title: 'پرداخت انجام شد',
    body: 'دستمزد پروژه «طراحی پاورپوینت ارائه دانشگاهی» پرداخت شد.',
    at: 'دیروز',
    read: true,
  },
  {
    id: 4,
    kind: 'system',
    title: 'پروفایل خود را کامل کنید',
    body: 'با تکمیل مهارت‌ها شانس پذیرش درخواست‌هایتان بیشتر می‌شود.',
    at: '۳ روز پیش',
    read: true,
  },
]

export interface MockReview {
  id: number
  reviewer: string
  rating: number
  comment: string
  at: string
}

export const MOCK_REVIEWS: MockReview[] = [
  {
    id: 1,
    reviewer: 'علی احمدی',
    rating: 5,
    comment: 'کار تمیز و به‌موقع تحویل داده شد. حتماً دوباره همکاری می‌کنم.',
    at: 'مهر ۱۴۰۴',
  },
  {
    id: 2,
    reviewer: 'مهدی موسوی',
    rating: 4,
    comment: 'کیفیت خوب بود، فقط یک روز دیرتر تحویل شد.',
    at: 'شهریور ۱۴۰۴',
  },
]

export const MOCK_PUBLIC_PROFILE = {
  full_name: 'رضا محمدی',
  field_of_study: 'مهندسی کامپیوتر',
  university_name: 'دانشگاه تهران',
  bio: 'دانشجوی ترم ۶ کامپیوتر، علاقه‌مند به توسعه وب و ساختمان داده. تاکنون بیش از ۲۰ پروژه دانشجویی انجام داده‌ام.',
  skills: ['Laravel', 'PHP', 'ساختمان داده', 'الگوریتم', 'MySQL'],
  stats: { completed: 23, rating: 4.8, onTime: 96 },
}
