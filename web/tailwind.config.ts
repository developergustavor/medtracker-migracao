import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif']
      },
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)' },
        primary: { DEFAULT: 'var(--primary)', foreground: 'var(--primary-fg)' },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)' },
        warning: { DEFAULT: 'var(--warning)' },
        info: { DEFAULT: 'var(--info)' },
        border: 'var(--border)',
        input: 'var(--input)',
        ring: 'var(--ring)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          muted: 'var(--sidebar-muted)',
          accent: 'var(--sidebar-accent)',
          border: 'var(--sidebar-border)'
        },
        elevated: { DEFAULT: 'var(--elevated)', hover: 'var(--elevated-hover)' }
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)'
      },
      spacing: {
        xs: 'var(--space-xs)',
        sm: 'var(--space-sm)',
        md: 'var(--space-md)',
        lg: 'var(--space-lg)',
        xl: 'var(--space-xl)',
        '2xl': 'var(--space-2xl)',
        '3xl': 'var(--space-3xl)'
      },
      fontSize: {
        display: 'var(--text-display)',
        lg: 'var(--text-lg)',
        title: 'var(--text-title)',
        heading: 'var(--text-heading)',
        subheading: 'var(--text-subheading)',
        body: 'var(--text-body)',
        sm: 'var(--text-sm)',
        caption: 'var(--text-caption)',
        xs: 'var(--text-xs)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        popover: 'var(--shadow-popover)'
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      },
      animation: {
        'slide-in-left': 'slide-in-left 200ms ease-out forwards',
        'fade-in': 'fade-in 150ms ease-out forwards'
      },
      screens: {
        xxxxsAndDown: { min: '0px', max: '280px' },
        xxxxs: { min: '0px', max: '280px' },
        xxxxsAndUp: { min: '0px' },
        xxxsAndDown: { min: '0px', max: '375px' },
        xxxs: { min: '281px', max: '375px' },
        xxxsAndUp: { min: '281px' },
        xxsAndDown: { min: '0px', max: '430px' },
        xxs: { min: '376px', max: '430px' },
        xxsAndUp: { min: '376px' },
        xsAndDown: { min: '0px', max: '639px' },
        xs: { min: '431px', max: '639px' },
        xsAndUp: { min: '431px' },
        smAndDown: { min: '0px', max: '767px' },
        sm: { min: '640px', max: '767px' },
        smAndUp: { min: '640px' },
        mdAndDown: { min: '0px', max: '1023px' },
        md: { min: '768px', max: '1023px' },
        mdAndUp: { min: '768px' },
        lgAndDown: { min: '0px', max: '1279px' },
        lg: { min: '1024px', max: '1279px' },
        lgAndUp: { min: '1024px' },
        xlAndDown: { min: '0px', max: '1535px' },
        xl: { min: '1280px', max: '1535px' },
        xlAndUp: { min: '1280px' },
        '2xl': { min: '1536px' }
      }
    }
  },
  plugins: [require('tailwindcss-animate'), require('@tailwindcss/typography')]
}

export default config
