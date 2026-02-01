/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom branding for FC Gaia if needed, for now standard tailwind
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'], // Example
            }
        },
    },
    plugins: [],
    darkMode: 'class', // Enable class-based dark mode
}
