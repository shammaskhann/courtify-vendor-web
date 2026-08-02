import Cookies from 'js-cookie'

const TOKEN_KEY = 'courtify_vendor_token'

/**
 * Storage decision:
 * We store the authentication token (JWT) in a regular cookie using js-cookie.
 * Why a cookie instead of localStorage?
 * - Next.js Middleware can read cookies to perform edge route protection. It cannot read localStorage.
 * - This satisfies the requirement for both Edge Middleware protection and client-side protection.
 * Note: If the backend sets an HttpOnly cookie, this client-side storage is not needed for the token itself,
 * but since we are mocking/building a decoupled client first, we handle the token manually in a standard cookie.
 */

export const authStorage = {
  getToken: (): string | undefined => {
    return Cookies.get(TOKEN_KEY)
  },
  
  setToken: (token: string, expiresDays = 7): void => {
    // We set Secure flag if we are on https to prevent MITM
    const isSecure = typeof window !== 'undefined' && window.location.protocol === 'https:'
    Cookies.set(TOKEN_KEY, token, {
      expires: expiresDays,
      secure: isSecure,
      sameSite: 'lax',
    })
  },
  
  clearToken: (): void => {
    Cookies.remove(TOKEN_KEY)
  },
}
