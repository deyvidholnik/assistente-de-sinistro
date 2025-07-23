import type { Config } from "tailwindcss";

// all in fixtures is set to tailwind v3 as interims solutions

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "*.{js,ts,jsx,tsx,mdx}"
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
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
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
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
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
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			// Cores personalizadas do app
  			brand: {
  				primary: 'hsl(var(--brand-primary))',
  				'primary-foreground': 'hsl(var(--brand-primary-foreground))',
  				secondary: 'hsl(var(--brand-secondary))',
  				'secondary-foreground': 'hsl(var(--brand-secondary-foreground))',
  				accent: 'hsl(var(--brand-accent))',
  				'accent-foreground': 'hsl(var(--brand-accent-foreground))'
  			},
  			gradient: {
  				'primary-start': 'hsl(var(--gradient-primary-start))',
  				'primary-end': 'hsl(var(--gradient-primary-end))',
  				'secondary-start': 'hsl(var(--gradient-secondary-start))',
  				'secondary-end': 'hsl(var(--gradient-secondary-end))'
  			},
  			status: {
  				success: 'hsl(var(--status-success))',
  				'success-foreground': 'hsl(var(--status-success-foreground))',
  				warning: 'hsl(var(--status-warning))',
  				'warning-foreground': 'hsl(var(--status-warning-foreground))',
  				error: 'hsl(var(--status-error))',
  				'error-foreground': 'hsl(var(--status-error-foreground))',
  				info: 'hsl(var(--status-info))',
  				'info-foreground': 'hsl(var(--status-info-foreground))'
  			},
  			surface: {
  				elevated: 'hsl(var(--surface-elevated))',
  				hover: 'hsl(var(--surface-hover))'
  			},
  			'background-gradient': {
  				light: 'hsl(var(--background-gradient-light))',
  				medium: 'hsl(var(--background-gradient-medium))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
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
