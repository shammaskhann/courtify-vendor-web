import { api } from '@/lib/api-client'

export async function forgotPassword(email: string): Promise<void> {
  const res = await api.post('/auth/password/forgot', { email })
  if (res.error) throw new Error(res.error)
}

export async function resetPassword(email: string, otp: string, newPassword: string): Promise<void> {
  const res = await api.post('/auth/password/reset', { email, otp, newPassword })
  if (res.error) throw new Error(res.error)
}
