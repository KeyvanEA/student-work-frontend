import { apiRequest, buildFormData } from './client'
import { endpoints } from './endpoints'
import type { Delivery } from '@/types/models'

/** GET /api/deliveries/{id} */
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
