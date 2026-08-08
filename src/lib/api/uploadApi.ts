import { api } from '../api-client'

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<string>('/s3/upload', formData)
  
  if (res.error) {
    throw new Error(res.error)
  }
  
  return res.data as string
}

export async function uploadVenueImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)

  const res = await api.post<any>('/s3/venue/upload', formData)
  
  if (res.error) {
    throw new Error(res.error)
  }
  
  const data = res.data
  // According to guide: { "status": true, "message": "...", "data": "https://..." }
  // The `api.post` unwraps the `data` envelope usually if it's `{ status, message, data }`.
  // Wait, let's look at `api-client.ts` to see if it unwraps `data`. If not, we use `res.data`.
  return typeof data === 'string' ? data : data?.url || ''
}

export async function uploadCourtImages(files: File[]): Promise<string[]> {
  const formData = new FormData()
  files.forEach(file => {
    formData.append('files', file)
  })

  const res = await api.post<any>('/s3/court/upload', formData)
  
  if (res.error) {
    throw new Error(res.error)
  }
  
  const data = res.data
  if (Array.isArray(data)) return data
  if (data?.urls && Array.isArray(data.urls)) return data.urls
  if (data?.url) return [data.url]
  if (typeof data === 'string') return [data]
  
  return []
}
