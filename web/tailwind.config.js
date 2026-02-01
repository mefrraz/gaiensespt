/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'gaia-yellow': '#f5b417',
                'gaia-sand': '#fcfbfa',
                'gaia-black': '#000000',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Example
            }
        },
    },
    plugins: [],
    darkMode: 'class', // Enable class-based dark mode
}
