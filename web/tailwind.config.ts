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
        background: { DEFAULT: 'var(--background)', glass: 'var(--background-glass)' },
        foreground: 'var(--foreground)',
        card: { DEFAULT: 'var(--card)', foreground: 'var(--card-foreground)' },
        popover: { DEFAULT: 'var(--popover)', foreground: 'var(--popover-foreground)', border: 'var(--popover-border)' },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'var(--primary-fg)',
          7: 'var(--primary-7)',
          8: 'var(--primary-8)',
          10: 'var(--primary-10)',
          12: 'var(--primary-12)',
          15: 'var(--primary-15)',
          20: 'var(--primary-20)',
          70: 'var(--primary-70)'
        },
        secondary: { DEFAULT: 'var(--secondary)', foreground: 'var(--secondary-foreground)' },
        muted: { DEFAULT: 'var(--muted)', foreground: 'var(--muted-foreground)' },
        accent: { DEFAULT: 'var(--accent)', foreground: 'var(--accent-foreground)' },
        destructive: { DEFAULT: 'var(--destructive)', 8: 'var(--destructive-8)', 10: 'var(--destructive-10)' },
        warning: { DEFAULT: 'var(--warning)', 8: 'var(--warning-8)', 10: 'var(--warning-10)' },
        info: { DEFAULT: 'var(--info)', 8: 'var(--info-8)', 10: 'var(--info-10)' },
        border: {
          DEFAULT: 'var(--border)',
          structural: 'var(--border-structural)',
          separator: 'var(--border-separator)',
          subtle: 'var(--border-subtle)',
          soft: 'var(--border-soft)',
          strong: 'var(--border-strong)',
          focus: 'var(--border-focus)',
          tooltip: 'var(--border-tooltip)'
        },
        input: { DEFAULT: 'var(--input)', border: 'var(--input-border)' },
        ring: 'var(--ring)',
        sidebar: {
          DEFAULT: 'var(--sidebar)',
          foreground: 'var(--sidebar-foreground)',
          muted: 'var(--sidebar-muted)',
          accent: 'var(--sidebar-accent)',
          border: 'var(--sidebar-border)'
        },
        elevated: { DEFAULT: 'var(--elevated)', hover: 'var(--elevated-hover)' },
        'nav-hover': 'var(--nav-hover-bg)',
        'surface-raised': 'var(--surface-raised)',
        'on-solid': 'var(--on-solid)',
        'chart-2': 'var(--chart-2)',
        /* Foreground scale */
        fg: {
          DEFAULT: 'var(--fg)',
          strong: 'var(--fg-strong)',
          secondary: 'var(--fg-secondary)',
          tooltip: 'var(--fg-tooltip)',
          hover: 'var(--fg-hover)',
          tertiary: 'var(--fg-tertiary)',
          muted: 'var(--fg-muted)',
          dim: 'var(--fg-dim)',
          faint: 'var(--fg-faint)',
          ghost: 'var(--fg-ghost)',
          hint: 'var(--fg-hint)',
          decoration: 'var(--fg-decoration)',
          whisper: 'var(--fg-whisper)',
          disabled: 'var(--fg-disabled)',
          30: 'var(--fg-30)',
          40: 'var(--fg-40)',
          45: 'var(--fg-45)',
          50: 'var(--fg-50)',
          60: 'var(--fg-60)',
          70: 'var(--fg-70)',
          80: 'var(--fg-80)'
        },
        /* Overlays */
        overlay: {
          3: 'var(--overlay-3)',
          4: 'var(--overlay-4)',
          5: 'var(--overlay-5)',
          6: 'var(--overlay-6)',
          7: 'var(--overlay-7)',
          8: 'var(--overlay-8)',
          10: 'var(--overlay-10)',
          12: 'var(--overlay-12)',
          22: 'var(--overlay-22)'
        }
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        separator: 'var(--border-separator)',
        subtle: 'var(--border-subtle)',
        soft: 'var(--border-soft)',
        strong: 'var(--border-strong)',
        focus: 'var(--border-focus)',
        tooltip: 'var(--border-tooltip)',
        input: 'var(--input-border)',
        popover: 'var(--popover-border)',
        sidebar: 'var(--sidebar-border)'
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
        xs: 'var(--text-xs)',
        xxs: 'var(--text-xxs)'
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        popover: 'var(--shadow-popover)'
      },
      transitionTimingFunction: {
        'ease-out-custom': 'var(--ease-out)'
      },
      zIndex: {
        sidebar: '10',
        topbar: '20',
        contextual: '25',
        sheet: '40',
        backdrop: '100',
        dialog: '101',
        spotlight: '200',
        tooltip: '9999'
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      },
      animation: {
        'slide-in-left': 'slide-in-left 200ms ease-out forwards',
        'fade-in': 'fade-in 150ms ease-out forwards',
        'slide-up': 'slide-up 300ms ease-out forwards'
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
