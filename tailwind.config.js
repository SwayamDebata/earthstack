/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: '#0B0F19',
                foreground: '#FFFFFF',
                primary: '#2D82FF',
                'accent-start': '#2D82FF',
                'accent-end': '#22C1EE',
                'map-bg': '#0F1424',
            },
            boxShadow: {
                glow: '0 0 20px rgba(45, 130, 255, 0.3)',
                card: '0 8px 32px rgba(0, 0, 0, 0.4)',
            },
        },
    },
    plugins: [],
}
