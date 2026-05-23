/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'dribly-blue': '#2563EB',
                'dribly-blue-dim': '#1D4ED8',
                'dribly-blue-light': '#3B82F6',
                'dribly-blue-dark': '#1E40AF',
                'dribly-sand': '#fcfbfa',
                'dribly-black': '#0f0f0f',
                'dribly-green': '#22c55e',
                'dribly-green-dim': '#16a34a',
                'dribly-red': '#ef4444',
                'dribly-red-dim': '#dc2626',
                // Kept for backward compat with existing green/red references
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
