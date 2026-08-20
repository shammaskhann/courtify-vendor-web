import { api } from '@/lib/api-client'

export async function forgotPassword(email: string): Promise<void> {
  const res = await api.post('/auth/password/forgot', { email })
  if (res.error) throw new Error(res.error)
}

export async function resetPassword(email: string, code: string, newPassword: string): Promise<void> {
  const res = await api.post('/auth/password/reset', { email, code, newPassword })
  if (res.error) throw new Error(res.error)
}

export async function updatePassword(oldPassword: string, newPassword: string): Promise<void> {
  const res = await api.post('/auth/password/update', { oldPassword, newPassword })
  if (res.error) throw new Error(res.error)
}
