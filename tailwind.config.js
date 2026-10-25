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
          bg: '#05070B',
          void: '#05070B',
          dock: 'rgba(10, 13, 20, 0.85)',
          panel: '#0A0D14',
          card: '#10141F',
          cardHover: '#161B29',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHighlight: 'rgba(255, 255, 255, 0.16)',
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
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -3px rgba(0, 245, 212, 0.35)',
        'magenta-glow': '0 0 20px -3px rgba(255, 42, 133, 0.35)',
        'violet-glow': '0 0 20px -3px rgba(139, 92, 246, 0.35)',
        'hud': '0 20px 60px rgba(0, 0, 0, 0.75)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
