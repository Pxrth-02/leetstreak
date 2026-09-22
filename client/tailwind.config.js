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
        lc: {
          bg: '#1a1a1a',
          card: '#262626',
          elevated: '#2e2e2e',
          border: '#383838',
          borderLight: '#4a4a4a',
          orange: '#FFA116',
          orangeHover: '#e08e13',
          easy: '#00B8A3',
          medium: '#FFC01E',
          hard: '#FF375F',
          textPrimary: '#eff1f6',
          textSecondary: '#9ca3af',
          textMuted: '#6b7280',
          input: '#1f1f1f',
          codeBg: '#141414'
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif']
      }
    }
  },
  plugins: [],
};
