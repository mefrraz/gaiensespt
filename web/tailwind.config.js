/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dribly-purple': '#7C3AED',
                'dribly-purple-dim': '#6D28D9',
                'dribly-purple-light': '#8B5CF6',
                'dribly-purple-dark': '#5B21B6',
                'dribly-sand': '#fcfbfa',
                'dribly-black': '#0D0D14',
                'dribly-green': '#22c55e',
                'dribly-green-dim': '#16a34a',
                'dribly-red': '#ef4444',
                'dribly-red-dim': '#dc2626',
                // Backward compat aliases for existing code
                'dribly-blue': '#7C3AED',
                'dribly-blue-dim': '#6D28D9',
                'dribly-blue-light': '#8B5CF6',
                'dribly-blue-dark': '#5B21B6',
                'gaia-green': '#22c55e',
                'gaia-red': '#ef4444',
            },
            fontFamily: {
                sans: ['Outfit', 'sans-serif'],
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.3s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(4px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
        },
    },
    plugins: [],
    darkMode: 'class',
}
