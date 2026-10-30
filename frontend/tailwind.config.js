/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bento: {
          bg: '#f5f5f7',
          card: '#ffffff',
          border: 'rgba(0, 0, 0, 0.07)'
        },
        heat: {
          critical: '#dc2626',
          high: '#ea580c',
          moderate: '#ca8a04',
          low: '#16a34a',
          norisk: '#64748b'
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
