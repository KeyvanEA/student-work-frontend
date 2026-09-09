import type { Category } from '@/types/models'

/**
 * ⚠️ داده Static.
 * بک‌اند هیچ endpoint ای برای دسته‌بندی‌ها ثبت نکرده است (نه GET /api/categories).
 * این فهرست دقیقاً از database/seeders/CategorySeeder.php کپی شده و ترتیب insert
 * تعیین‌کنندهٔ شناسه‌هاست. اگر seeder تغییر کند، اینجا هم باید تغییر کند.
 *
 * TODO(backend): افزودن GET /api/categories و حذف این فایل.
 */
export const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: 'حل تمرین', slug: 'homework' },
  { id: 2, name: 'پروژه درسی', slug: 'course-project' },
  { id: 3, name: 'طراحی پاورپوینت', slug: 'powerpoint-design' },
  { id: 4, name: 'تحقیق و مقاله', slug: 'research-article' },
  { id: 5, name: 'تایپ و ترجمه', slug: 'typing-translation' },
  { id: 6, name: 'تدریس خصوصی', slug: 'private-tutoring' },
  { id: 7, name: 'رفع اشکال درس', slug: 'problem-solving' },
  { id: 8, name: 'پروژه پایانی', slug: 'final-project' },
  { id: 9, name: 'پایان‌نامه', slug: 'thesis' },
  { id: 10, name: 'طراحی گرافیکی پروژه دانشگاهی', slug: 'graphic-design' },
]
