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
        primary: {
          50: '#fef7ee',
          100: '#fdedd6',
          200: '#fad9ac',
          300: '#f6c074',
          400: '#f1a13d',
          500: '#ed8914',
          600: '#de6e0c',
          700: '#b8520a',
          800: '#93410d',
          900: '#77350f',
          950: '#411905',
        },
        paper: {
          light: '#fefaf5',
          DEFAULT: '#fdf8f0',
          dark: '#f5ebe0',
          sepia: '#f4ecd8',
        },
        ink: {
          light: '#3d3d3d',
          DEFAULT: '#2d2d2d',
          dark: '#1a1a1a',
        },
        charcoal: {
          50: '#f6f6f6',
          100: '#e8e8e8',
          200: '#d1d1d1',
          300: '#ababab',
          400: '#8c8c8c',
          500: '#717171',
          600: '#5d5d5d',
          700: '#4d4d4d',
          800: '#424242',
          900: '#3a3a3a',
          950: '#232323',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Literata', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.2s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-left': 'slideLeft 0.3s ease-out',
        'slide-right': 'slideRight 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'scale-out': 'scaleOut 0.15s ease-in',
        'page-turn': 'pageTurn 0.5s ease-in-out',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        pageTurn: {
          '0%': { transform: 'rotateY(0deg)' },
          '50%': { transform: 'rotateY(-90deg)' },
          '100%': { transform: 'rotateY(0deg)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      boxShadow: {
        'page': '0 4px 20px -4px rgba(0, 0, 0, 0.15), 0 2px 6px -2px rgba(0, 0, 0, 0.1)',
        'page-hover': '0 8px 30px -6px rgba(0, 0, 0, 0.2), 0 4px 12px -4px rgba(0, 0, 0, 0.15)',
        'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.08)',
        'elevated': '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      zIndex: {
        'toolbar': '40',
        'sidebar': '50',
        'modal': '60',
        'toast': '70',
        'loading': '80',
      },
    },
  },
  plugins: [],
}