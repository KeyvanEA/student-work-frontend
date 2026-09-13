import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type { Delivery, DeliveryListItem, Paginated } from '@/types/models'

/**
 * GET /api/projects/{project}/deliveries — فهرست تحویل‌های یک پروژه، صفحه‌بندی‌شده.
 * ⚠️ این پاسخ فایل‌ها را ندارد؛ برای فایل‌ها باید GET /api/deliveries/{id} گرفته شود.
 */
export async function fetchProjectDeliveries(
  projectId: number | string,
  page = 1,
  signal?: AbortSignal,
): Promise<Paginated<DeliveryListItem>> {
  const data = await apiRequest<{ deliveries: Paginated<DeliveryListItem> }>(
    `${endpoints.projectDeliveries(projectId)}?page=${page}`,
    { signal },
  )
  return data.deliveries
}

/** GET /api/deliveries/{id} — شامل فایل‌ها و preview_url ساخته‌شده توسط بک‌اند */
export async function fetchDelivery(
  deliveryId: number | string,
  signal?: AbortSignal,
): Promise<Delivery> {
  const data = await apiRequest<{ delivery: Delivery }>(endpoints.delivery(deliveryId), { signal })
  return data.delivery
}

export interface SubmitDeliveryInput {
  description: string
  /** بک‌اند حداقل ۱ و حداکثر ۳ فایل الزامی می‌داند */
  files: File[]
}

export async function submitDelivery(
  projectId: number | string,
  input: SubmitDeliveryInput,
): Promise<{ message: string }> {
  const form = buildFormData({ description: input.description, files: input.files })
  return apiRequest<{ message: string }>(endpoints.projectDeliveries(projectId), {
    method: 'POST',
    form,
  })
}

export async function acceptDelivery(deliveryId: number | string): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.deliveryAccept(deliveryId), { method: 'PATCH' })
}

export async function rejectDelivery(
  deliveryId: number | string,
  rejectionReason: string,
): Promise<{ message: string }> {
  return apiRequest<{ message: string }>(endpoints.deliveryReject(deliveryId), {
    method: 'PATCH',
    json: { rejection_reason: rejectionReason },
  })
}
