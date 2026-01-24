/**
 * PagePalette Tailwind Configuration
 * 
 * OPTIMIZED: Removed ~1,500 unused font definitions for faster build times
 * and smaller config file. Only keeping fonts actually used in the project.
 */
module.exports = {
	content: ['./src/**/*.{js,ts,jsx,tsx}'],
	theme: {
		fontFamily: {
			sans: ['Inter', 'sans-serif'],
		},
		extend: {
			fontFamily: {
				// Core fonts used throughout the app
				'inter': ['Inter', 'sans-serif'],
				'manrope': ['Manrope', 'sans-serif'],
				'clash-display': ['Clash Display', 'sans-serif'],

				// Legacy font aliases (mapped to actual fonts in global.css)
				'proxima-sera': ['Clash Display', 'Manrope', 'system-ui', 'sans-serif'],
				'montserrat': ['Manrope', 'system-ui', 'sans-serif'],

				// Receipt/handwriting font (used in order page)
				'indie-flower': ['Indie Flower', 'Comic Sans MS', 'cursive'],
			},
			colors: {
				// Brand colors
				'pp-primary': '#36484d',
				'pp-primary-dark': '#2a3a40',
				'pp-accent': '#764134',
				'pp-cream': '#E4DFDA',
				'pp-green': '#4ADE80',
			},
			animation: {
				'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
				'scale-in': 'scale-in 0.4s ease-out forwards',
				'marquee': 'marquee 40s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
			},
			keyframes: {
				'fade-in-up': {
					'0%': { opacity: '0', transform: 'translateY(20px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.9)' },
					'100%': { opacity: '1', transform: 'scale(1)' },
				},
				'marquee': {
					'0%': { transform: 'translate3d(0, 0, 0)' },
					'100%': { transform: 'translate3d(-50%, 0, 0)' },
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 10px rgba(54, 72, 77, 0.3)' },
					'50%': { boxShadow: '0 0 25px rgba(54, 72, 77, 0.5)' },
				},
			},
		},
	},
};
