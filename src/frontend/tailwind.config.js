/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        soc: {
          bg: 'var(--bg-page)',
          card: 'var(--bg-card)',
          cardHover: 'var(--bg-card-hover)',
          sidebar: 'var(--bg-sidebar)',
          border: 'var(--border-subtle)',
          borderStrong: 'var(--border-strong)',
          borderGlow: '#2563eb',
          cyan: '#0284c7',
          electric: '#0284c7',
          critical: '#ef4444',
          high: '#f59e0b',
          medium: '#eab308',
          low: '#3b82f6',
          safe: '#10b981',
          muted: '#64748b',
          text: 'var(--text-primary)'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      animation: {
        'pulse-fast': 'pulse 1.2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(37, 99, 235, 0.2)' },
          '100%': { boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)' },
        }
      }
    },
  },
  plugins: [],
}
