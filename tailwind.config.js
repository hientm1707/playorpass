/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 12px 30px rgba(15, 23, 42, 0.07)',
        card: '0 18px 44px rgba(15, 23, 42, 0.10)',
        button: '0 12px 24px rgba(15, 23, 42, 0.18)'
      }
    }
  },
  plugins: []
};
