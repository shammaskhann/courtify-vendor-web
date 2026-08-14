import { authStorage } from './auth-storage'
import { siteConfig } from '@/config/site'
import type { ApiResponse } from '@/types/auth'

// Single source of truth: NEXT_PUBLIC_API_BASE_URL when set (e.g. an ngrok
// tunnel), otherwise the local backend on :4000.
const BASE_URL = siteConfig.apiBaseUrl

export class ApiError extends Error {
  public statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
  }
}

/**
 * Readable fallback for error responses that carry no JSON body — a bare 403
 * would otherwise surface as "An unexpected error occurred", which tells the
 * vendor nothing about whether to sign in again or call support.
 */
export function describeHttpError(status: number): string {
  switch (status) {
    case 400: return 'The request was rejected as invalid (400).'
    case 401: return 'Your session has expired. Please sign in again (401).'
    case 403: return 'Not authorised (403) — your session may have expired, or this account lacks access. Try signing in again.'
    case 404: return 'That endpoint was not found on the server (404).'
    case 429: return 'Too many requests — please wait a moment and retry (429).'
    default:
      return status >= 500
        ? `The server could not handle this request (${status}). This is a backend problem, not your connection.`
        : `Request failed with status ${status}.`
  }
}

/**
 * Custom fetch wrapper that automatically:
 * 1. Attaches the Authorization header with the stored token.
 * 2. Parses JSON responses consistently.
 * 3. Handles 401 Unauthorized globally by clearing the session.
 */
async function fetchClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = authStorage.getToken()
  const headers: Record<string, string> = {
    'ngrok-skip-browser-warning': 'true',
    ...(options.headers as Record<string, string> || {}),
  }

  // Only set application/json if Content-Type isn't explicitly overridden and it's not a FormData request
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  // If Content-Type is explicitly set to null/undefined or it's FormData, let the browser handle it (e.g. for boundaries)
  if (options.body instanceof FormData || headers['Content-Type'] === 'multipart/form-data') {
    delete headers['Content-Type']
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    ...options,
    headers,
  }

  try {
    const url = `${BASE_URL.replace(/\/+$/, '')}/${endpoint.replace(/^\/+/, '')}`
    const response = await fetch(url, config)

    // Global 401 and 403 handler
    if (response.status === 401 || response.status === 403) {
      authStorage.clearToken()
      // If we are in the browser, trigger a custom event that the AuthContext can listen to
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth:unauthorized'))
      }
    }

    // Try to parse JSON body
    let data = null
    try {
      if (response.status !== 204) {
        data = await response.json()
      }
    } catch {
      // Body might be empty or non-JSON
    }

    if (!response.ok) {
      // Extract error message from known shapes or fallback
      const errorMsg = data?.message || data?.error || describeHttpError(response.status)
      return { data: null, error: errorMsg, statusCode: response.status }
    }

    // Handle the backend's standard { status, message, data } envelope
    if (data && typeof data === 'object' && 'status' in data) {
      if (data.status === false) {
        return { data: null, error: data.message || 'An error occurred.', statusCode: response.status }
      }
      return { data: data.data !== undefined ? data.data : data, error: null, statusCode: response.status }
    }

    return { data, error: null, statusCode: response.status }
  } catch (error) {
    // Network errors or blocked requests
    const message = error instanceof Error ? error.message : 'Unable to connect. Check your internet connection.'
    return { data: null, error: message, statusCode: 0 }
  }
}

export const api = {
  get: <T>(endpoint: string, options?: RequestInit) =>
    fetchClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    fetchClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  put: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    fetchClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  patch: <T>(endpoint: string, body: unknown, options?: RequestInit) =>
    fetchClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body)
    }),

  delete: <T>(endpoint: string, options?: RequestInit) =>
    fetchClient<T>(endpoint, { ...options, method: 'DELETE' }),
}
