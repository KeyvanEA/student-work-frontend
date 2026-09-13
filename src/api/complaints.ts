import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type { Complaint, ComplaintListItem, Paginated } from '@/types/models'

/** GET /api/complaints — شکایت‌هایی که خود کاربر ثبت کرده */
export async function fetchMyComplaints(
  page = 1,
  signal?: AbortSignal,
): Promise<Paginated<ComplaintListItem>> {
  const data = await apiRequest<{ complaints: Paginated<ComplaintListItem> }>(
    `${endpoints.complaints()}?page=${page}`,
    { signal },
  )
  return data.complaints
}

/** GET /api/complaints/related — شکایت‌های ثبت‌شده روی پروژه‌های کاربر توسط طرف مقابل */
export async function fetchRelatedComplaints(
  page = 1,
  signal?: AbortSignal,
): Promise<Paginated<ComplaintListItem>> {
  const data = await apiRequest<{ complaints: Paginated<ComplaintListItem> }>(
    `${endpoints.relatedComplaints()}?page=${page}`,
    { signal },
  )
  return data.complaints
}

/**
 * GET /api/complaints/{id}
 * ⚠️ ComplaintController::show فقط به ثبت‌کنندهٔ شکایت اجازه می‌دهد؛
 * برای شکایت‌های «مربوط به پروژه‌های من» پاسخ ۴۰۳ است.
 */
export async function fetchComplaint(
  complaintId: number | string,
  signal?: AbortSignal,
): Promise<Complaint> {
  const data = await apiRequest<{ complaint: Complaint }>(endpoints.complaint(complaintId), {
    signal,
  })
  return data.complaint
}

export interface CreateComplaintInput {
  title: string
  description: string
  files?: File[]
}

/**
 * POST /api/projects/{project}/complaints
 * شرط بک‌اند: کارجو فقط وقتی پروژه `revision_requested` است و کارفرما فقط وقتی
 * پروژه `submitted` است می‌تواند شکایت ثبت کند. پروژه به `disputed` می‌رود.
 */
export async function createComplaint(
  projectId: number | string,
  input: CreateComplaintInput,
): Promise<{ message: string }> {
  const form = buildFormData({
    title: input.title,
    description: input.description,
    files: input.files ?? [],
  })
  return apiRequest<{ message: string }>(endpoints.projectComplaints(projectId), {
    method: 'POST',
    form,
  })
}
