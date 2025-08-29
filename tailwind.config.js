/** @type {import('tailwindcss').Config} */
import headlessui from '@headlessui/tailwindcss';
import scrollbar from 'tailwind-scrollbar';
import animate from 'tailwindcss-animate';

export default {
  darkMode: ['class'],
  content: ['./src/**/*.{html,js,jsx}'],
  prefix: "", 
  theme: {
    extend: {
      colors: {
        // Landing page purple/blue color scheme
        'primary-blue': '#8B5CF6', // Purple instead of blue
        'primary-purple': '#8B5CF6',
        'accent-blue': '#3B82F6',
        'metallic-light': 'rgba(168, 182, 200, 0.15)',
        'metallic-medium': 'rgba(141, 160, 184, 0.1)',
        'metallic-dark': 'rgba(95, 123, 158, 0.05)',
        secondary: 'rgb(var(--color-secondary) / <alpha-value>)',
        'primary-text': 'rgb(var(--primary-text) / <alpha-value>)',
        'secondary-text': 'rgb(var(--secondary-text) / <alpha-value>)',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        }
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
      fontSize: {
        base: '14px',
        sm: "13px"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      }
    },
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    }
  },
  plugins: [headlessui, scrollbar, animate],
}
