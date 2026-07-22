/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: {
          primary: '#7C6CF0',
          pink: '#FF6FB5',
        },
        ink: {
          primary: 'rgba(255,255,255,0.95)',
          secondary: 'rgba(255,255,255,0.75)',
          tertiary: 'rgba(255,255,255,0.55)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        screen: '28px',
        pill: '18px',
        card: '12px',
        chip: '14px',
      },
      backdropBlur: {
        glass: '12px',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.25)',
        'glass-hover': '0 12px 40px rgba(0,0,0,0.35)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-up': 'fade-up 300ms ease forwards',
        shimmer: 'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
}
