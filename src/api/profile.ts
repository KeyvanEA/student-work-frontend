import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type { Skill, User } from '@/types/models'

export async function fetchProfile(signal?: AbortSignal): Promise<User> {
  const data = await apiRequest<{ user: User }>(endpoints.profile(), { signal })
  return data.user
}

export interface ProfileUpdateInput {
  full_name?: string
  field_of_study?: string
  university_name?: string
  student_number?: string
  email?: string | null
  bio?: string | null
  avatar?: File | null
  resume_file?: File | null
}

/**
 * به‌روزرسانی پروفایل.
 * چون ممکن است فایل همراه داشته باشد، با POST + `_method=PATCH` ارسال می‌شود
 * (PHP بدنه multipart را روی PATCH پارس نمی‌کند).
 */
export async function updateProfile(input: ProfileUpdateInput): Promise<{ message: string; user: User }> {
  const form = buildFormData(input as Record<string, unknown>, 'PATCH')
  return apiRequest<{ message: string; user: User }>(endpoints.profile(), {
    method: 'POST',
    form,
  })
}

export async function fetchSkills(signal?: AbortSignal): Promise<Skill[]> {
  const data = await apiRequest<{ skills: Skill[] }>(endpoints.skills(), { signal })
  return data.skills
}

export async function updateMySkills(skillIds: number[]): Promise<{ message: string; user: User }> {
  return apiRequest<{ message: string; user: User }>(endpoints.profileSkills(), {
    method: 'PUT',
    json: { skills: skillIds },
  })
}
