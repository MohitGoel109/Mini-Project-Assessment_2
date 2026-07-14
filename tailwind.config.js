/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        theme: {
          bg: 'var(--color-bg)',
          bgAlt: 'var(--color-bg-alt)',
          surface: 'var(--color-surface)',
          primary: 'var(--color-primary)',
          accent: 'var(--color-accent)',
          text: 'var(--color-text)',
          textMuted: 'var(--color-text-muted)',
          border: 'var(--color-border)',
          danger: 'var(--color-danger)',
        }
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      borderRadius: {
        theme: 'var(--radius)',
      }
    },
  },
  plugins: [],
}
