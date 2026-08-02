import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand
        brand: {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
          muted: 'var(--color-brand-muted)',
          ghost: 'var(--color-brand-ghost)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          secondary: 'var(--color-accent-secondary)',
        },
        // Surfaces
        background: 'var(--color-background)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          variant: 'var(--color-surface-variant)',
          elevated: 'var(--color-surface-elevated)',
        },
        // Text
        primary: 'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary: 'var(--color-text-tertiary)',
        disabled: 'var(--color-text-disabled)',
        inverse: 'var(--color-text-inverse)',
        // Borders
        border: {
          DEFAULT: 'var(--color-border)',
          strong: 'var(--color-border-strong)',
        },
        divider: 'var(--color-divider)',
        // Status
        success: {
          DEFAULT: 'var(--color-success)',
          bg: 'var(--color-success-bg)',
          text: 'var(--color-success-text)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          bg: 'var(--color-warning-bg)',
          text: 'var(--color-warning-text)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          bg: 'var(--color-error-bg)',
          text: 'var(--color-error-text)',
        },
        info: {
          DEFAULT: 'var(--color-info)',
          bg: 'var(--color-info-bg)',
          text: 'var(--color-info-text)',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Typography scale
        'display': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700', letterSpacing: '-0.02em' }],
        'h1': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '700', letterSpacing: '-0.01em' }],
        'h2': ['1.5rem', { lineHeight: '2rem', fontWeight: '600', letterSpacing: '-0.01em' }],
        'h3': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'h4': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'body-lg': ['1rem', { lineHeight: '1.75rem', fontWeight: '400' }],
        'body': ['0.875rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-sm': ['0.8125rem', { lineHeight: '1.375rem', fontWeight: '400' }],
        'caption': ['0.75rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'label': ['0.75rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.04em' }],
        'overline': ['0.6875rem', { lineHeight: '1rem', fontWeight: '600', letterSpacing: '0.08em' }],
      },
      spacing: {
        'nav': 'var(--nav-width)',
        'nav-rail': 'var(--nav-rail-width)',
        'topbar': 'var(--topbar-height)',
      },
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'DEFAULT': 'var(--radius-md)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        'pill': 'var(--radius-pill)',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'DEFAULT': 'var(--shadow-md)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
        'card': 'var(--shadow-card)',
      },
      transitionDuration: {
        'fast': '100ms',
        'base': '150ms',
        'slow': '250ms',
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-right': 'slideInRight 250ms ease-out',
        'spin-slow': 'spin 2s linear infinite',
        'pulse-brand': 'pulseBrand 2s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseBrand: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
}

export default config
