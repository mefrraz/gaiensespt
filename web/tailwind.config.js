/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gaia-blue': '#0047AB',
                'gaia-yellow': '#FFD700',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Example
            }
        },
    },
    plugins: [],
    darkMode: 'class', // Enable class-based dark mode
}
