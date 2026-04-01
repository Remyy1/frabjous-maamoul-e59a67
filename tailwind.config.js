/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          DEFAULT: '#0A0A0F',
          50: '#f5f5f7',
          100: '#e8e8ed',
          200: '#c7c7d0',
          300: '#9999aa',
          400: '#666680',
          500: '#444460',
          600: '#2a2a45',
          700: '#1a1a30',
          800: '#0f0f1f',
          900: '#0A0A0F',
        },
        signal: {
          DEFAULT: '#00E5A0',
          dim: '#00b87d',
          muted: 'rgba(0,229,160,0.12)',
        },
        amber: {
          track: '#F5A623',
        },
        crimson: {
          alert: '#FF3B5C',
        },
      },
      backgroundImage: {
        'grid-ink': 'linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px)',
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow': 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(0,229,160,0.15) 0%, transparent 70%)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'fade-up': 'fadeUp 0.6s ease forwards',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(400%)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'signal': '0 0 24px rgba(0,229,160,0.25)',
        'signal-lg': '0 0 48px rgba(0,229,160,0.3)',
        'card': '0 1px 3px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.5), 0 16px 48px rgba(0,0,0,0.4)',
      },
      borderColor: {
        subtle: 'rgba(255,255,255,0.07)',
        'subtle-hover': 'rgba(255,255,255,0.14)',
      },
    },
  },
  plugins: [],
};
