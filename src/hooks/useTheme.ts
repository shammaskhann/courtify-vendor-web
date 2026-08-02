'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { THEME } from '@/lib/constants'

export function useTheme() {
  const { theme, setTheme, resolvedTheme } = useNextTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? THEME.LIGHT : THEME.DARK)
  }

  return {
    theme: theme as 'light' | 'dark' | 'system' | undefined,
    resolvedTheme: resolvedTheme as 'light' | 'dark' | undefined,
    setTheme,
    toggleTheme,
    mounted,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
  }
}
