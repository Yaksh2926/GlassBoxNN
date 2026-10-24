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
        cyber: {
          bg: '#090D16',
          panel: '#0E1524',
          card: '#131B2E',
          cardHover: '#182238',
          border: '#1E2D4A',
          borderHighlight: '#2E436E',
          cyan: '#00F5D4',
          cyanGlow: 'rgba(0, 245, 212, 0.25)',
          magenta: '#FF2A85',
          magentaGlow: 'rgba(255, 42, 133, 0.25)',
          amber: '#F59E0B',
          amberGlow: 'rgba(245, 158, 11, 0.25)',
          violet: '#8B5CF6',
          violetGlow: 'rgba(139, 92, 246, 0.25)',
          emerald: '#10B981',
          textMuted: '#94A3B8',
          textSubtle: '#64748B',
        },
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'Outfit', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -3px rgba(0, 245, 212, 0.35)',
        'magenta-glow': '0 0 20px -3px rgba(255, 42, 133, 0.35)',
        'violet-glow': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-spin': 'spin 12s linear infinite',
      },
    },
  },
  plugins: [],
}
