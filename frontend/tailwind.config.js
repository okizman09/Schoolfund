/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#F7F8FA',
        primary: {
          DEFAULT: '#123B35',
          dark: '#0B2925',
          light: '#1B544B',
        },
        accent: {
          DEFAULT: '#2E8B72',
          hover: '#25745E',
          light: '#EAF5F2',
        },
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#18201E',
          muted: '#66736F',
          subtle: '#8C9995',
        },
        border: {
          DEFAULT: '#E3E8E6',
          strong: '#CBD4D1',
        },
        warning: {
          DEFAULT: '#B7791F',
          light: '#FEF9E7',
        },
        danger: {
          DEFAULT: '#C94A4A',
          light: '#FDF2F2',
        },
        success: {
          DEFAULT: '#2E8B72',
          light: '#EAF5F2',
        },
      },
      fontFamily: {
        sans: ['Inter', 'DM Sans', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 1px 3px rgba(18, 59, 53, 0.05), 0 1px 2px rgba(18, 59, 53, 0.03)',
        'card': '0 2px 4px rgba(18, 59, 53, 0.04), 0 1px 2px rgba(18, 59, 53, 0.02)',
        'dropdown': '0 4px 12px rgba(18, 59, 53, 0.08)',
      },
    },
  },
  plugins: [],
};
