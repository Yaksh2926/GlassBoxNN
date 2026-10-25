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
          bg: '#0B1020',
          void: '#0B1020',
          dock: 'rgba(17, 26, 42, 0.90)',
          panel: '#111A2A',
          card: '#182438',
          cardHover: '#20304A',
          border: '#29374B',
          borderHighlight: 'rgba(83, 212, 244, 0.35)',
          cyan: '#53D4F4',
          cyanGlow: 'rgba(83, 212, 244, 0.25)',
          magenta: '#F078C5',
          magentaGlow: 'rgba(240, 120, 197, 0.25)',
          amber: '#F7C76B',
          amberGlow: 'rgba(247, 199, 107, 0.25)',
          violet: '#8B5CF6',
          violetGlow: 'rgba(139, 92, 246, 0.25)',
          emerald: '#10B981',
          textMuted: '#9DAFC3',
          textSubtle: '#64748B',
          textPrimary: '#F4F7FB',
        },
        obsidian: {
          bg: '#0B1020',
          panel: '#111A2A',
          surface: '#182438',
          border: '#29374B',
          text: '#F4F7FB',
          muted: '#9DAFC3',
          accent: '#53D4F4',
          class1: '#F078C5',
          warning: '#F7C76B',
          error: '#EF4444',
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
