/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
	"./pages/**/*.{js,ts,jsx,tsx,mdx}",
	"./components/**/*.{js,ts,jsx,tsx,mdx}",
	"./app/**/*.{js,ts,jsx,tsx,mdx}",
	],
    theme: {
    	extend: {
    		colors: {
    			background: 'hsl(var(--background))',
    			foreground: 'hsl(var(--foreground))',
    			card: {
    				DEFAULT: 'hsl(var(--card))',
    				foreground: 'hsl(var(--card-foreground))'
    			},
    			popover: {
    				DEFAULT: 'hsl(var(--popover))',
    				foreground: 'hsl(var(--popover-foreground))'
    			},
    			primary: {
    				DEFAULT: 'hsl(221, 83%, 53%)', // Modern blue
    				foreground: 'hsl(var(--primary-foreground))',
    				50: 'hsl(221, 83%, 97%)',
    				100: 'hsl(221, 83%, 93%)',
    				200: 'hsl(221, 83%, 83%)',
    				300: 'hsl(221, 83%, 73%)',
    				400: 'hsl(221, 83%, 63%)',
    				500: 'hsl(221, 83%, 53%)',
    				600: 'hsl(221, 83%, 43%)',
    				700: 'hsl(221, 83%, 33%)',
    				800: 'hsl(221, 83%, 23%)',
    				900: 'hsl(221, 83%, 13%)',
    			},
    			secondary: {
    				DEFAULT: 'hsl(var(--secondary))',
    				foreground: 'hsl(var(--secondary-foreground))'
    			},
    			muted: {
    				DEFAULT: 'hsl(var(--muted))',
    				foreground: 'hsl(var(--muted-foreground))'
    			},
    			accent: {
    				DEFAULT: 'hsl(142, 76%, 36%)', // Modern green accent
    				foreground: 'hsl(var(--accent-foreground))',
    				50: 'hsl(142, 76%, 96%)',
    				100: 'hsl(142, 76%, 92%)',
    				200: 'hsl(142, 76%, 82%)',
    				300: 'hsl(142, 76%, 72%)',
    				400: 'hsl(142, 76%, 62%)',
    				500: 'hsl(142, 76%, 52%)',
    				600: 'hsl(142, 76%, 42%)',
    				700: 'hsl(142, 76%, 32%)',
    				800: 'hsl(142, 76%, 22%)',
    				900: 'hsl(142, 76%, 12%)',
    			},
    			destructive: {
    				DEFAULT: 'hsl(var(--destructive))',
    				foreground: 'hsl(var(--destructive-foreground))'
    			},
    			border: 'hsl(var(--border))',
    			input: 'hsl(var(--input))',
    			ring: 'hsl(var(--ring))',
    			chart: {
    				'1': 'hsl(var(--chart-1))',
    				'2': 'hsl(var(--chart-2))',
    				'3': 'hsl(var(--chart-3))',
    				'4': 'hsl(var(--chart-4))',
    				'5': 'hsl(var(--chart-5))'
    			},
    			neutral: {
    				50: '#fafafa',
    				100: '#f5f5f5',
    				200: '#e5e5e5',
    				300: '#d4d4d4',
    				400: '#a3a3a3',
    				500: '#737373',
    				600: '#525252',
    				700: '#404040',
    				800: '#262626',
    				900: '#171717',
    			}
    		},
    		borderRadius: {
    			lg: 'var(--radius)',
    			md: 'calc(var(--radius) - 2px)',
    			sm: 'calc(var(--radius) - 4px)',
    			xl: 'calc(var(--radius) + 4px)',
    			'2xl': 'calc(var(--radius) + 8px)',
    		},
    		boxShadow: {
    			'soft': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 4px 16px -4px rgba(0, 0, 0, 0.1)',
    			'medium': '0 4px 16px -4px rgba(0, 0, 0, 0.1), 0 8px 32px -8px rgba(0, 0, 0, 0.15)',
    			'hard': '0 8px 32px -8px rgba(0, 0, 0, 0.2), 0 16px 64px -16px rgba(0, 0, 0, 0.25)',
    		},
    		animation: {
    			'fade-in': 'fade-in 0.5s ease-out',
    			'slide-up': 'slide-up 0.3s ease-out',
    			'scale-in': 'scale-in 0.2s ease-out',
    		},
    		keyframes: {
    			'fade-in': {
    				'0%': { opacity: '0' },
    				'100%': { opacity: '1' },
    			},
    			'slide-up': {
    				'0%': { transform: 'translateY(10px)', opacity: '0' },
    				'100%': { transform: 'translateY(0)', opacity: '1' },
    			},
    			'scale-in': {
    				'0%': { transform: 'scale(0.95)', opacity: '0' },
    				'100%': { transform: 'scale(1)', opacity: '1' },
    			},
    		},
    	}
    },
    plugins: [require("tailwindcss-animate")],
};    
