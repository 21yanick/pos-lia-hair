import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['var(--font-sans)'],
  			serif: ['var(--font-serif)'],
  			mono: ['var(--font-mono)'],
  		},
  		letterSpacing: {
  			tighter: 'calc(var(--tracking-normal) - 0.05em)',
  			tight: 'calc(var(--tracking-normal) - 0.025em)',
  			normal: 'var(--tracking-normal)',
  			wide: 'calc(var(--tracking-normal) + 0.025em)',
  			wider: 'calc(var(--tracking-normal) + 0.05em)',
  			widest: 'calc(var(--tracking-normal) + 0.1em)',
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			DEFAULT: 'var(--shadow)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  		},
  		colors: {
  			background: 'var(--background)',
  			foreground: 'var(--foreground)',
  			card: {
  				DEFAULT: 'var(--card)',
  				foreground: 'var(--card-foreground)'
  			},
  			popover: {
  				DEFAULT: 'var(--popover)',
  				foreground: 'var(--popover-foreground)'
  			},
  			primary: {
  				DEFAULT: 'var(--primary)',
  				foreground: 'var(--primary-foreground)'
  			},
  			secondary: {
  				DEFAULT: 'var(--secondary)',
  				foreground: 'var(--secondary-foreground)'
  			},
  			muted: {
  				DEFAULT: 'var(--muted)',
  				foreground: 'var(--muted-foreground)'
  			},
  			accent: {
  				DEFAULT: 'var(--accent)',
  				foreground: 'var(--accent-foreground)'
  			},
  			destructive: {
  				DEFAULT: 'var(--destructive)',
  				foreground: 'var(--destructive-foreground)'
  			},
  			success: {
  				DEFAULT: 'var(--success)',
  				foreground: 'var(--success-foreground)'
  			},
  			warning: {
  				DEFAULT: 'var(--warning)',
  				foreground: 'var(--warning-foreground)'
  			},
  			border: 'var(--border)',
  			input: 'var(--input)',
  			ring: 'var(--ring)',
  			chart: {
  				'1': 'var(--chart-1)',
  				'2': 'var(--chart-2)',
  				'3': 'var(--chart-3)',
  				'4': 'var(--chart-4)',
  				'5': 'var(--chart-5)'
  			},
  			sidebar: {
  				DEFAULT: 'var(--sidebar-background)',
  				foreground: 'var(--sidebar-foreground)',
  				primary: 'var(--sidebar-primary)',
  				'primary-foreground': 'var(--sidebar-primary-foreground)',
  				accent: 'var(--sidebar-accent)',
  				'accent-foreground': 'var(--sidebar-accent-foreground)',
  				border: 'var(--sidebar-border)',
  				ring: 'var(--sidebar-ring)'
  			},
  			payment: {
  				cash: 'var(--payment-cash)',
  				'cash-foreground': 'var(--payment-cash-foreground)',
  				twint: 'var(--payment-twint)',
  				'twint-foreground': 'var(--payment-twint-foreground)',
  				sumup: 'var(--payment-sumup)',
  				'sumup-foreground': 'var(--payment-sumup-foreground)'
  			},
  			category: {
  				service: 'var(--category-service)',
  				'service-foreground': 'var(--category-service-foreground)',
  				'service-bg': 'var(--category-service-bg)',
  				product: 'var(--category-product)',
  				'product-foreground': 'var(--category-product-foreground)',
  				'product-bg': 'var(--category-product-bg)',
  				favorite: 'var(--category-favorite)',
  				'favorite-foreground': 'var(--category-favorite-foreground)'
  			},
  			metric: {
  				cash: 'var(--metric-cash)',
  				monthly: 'var(--metric-monthly)',
  				yearly: 'var(--metric-yearly)'
  			},
  			status: {
  				draft: 'var(--status-draft)',
  				'draft-foreground': 'var(--status-draft-foreground)',
  				corrected: 'var(--status-corrected)',
  				'corrected-foreground': 'var(--status-corrected-foreground)'
  			}
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: 'calc(var(--radius) + 4px)',
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
