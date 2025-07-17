import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class", "dark"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}", // Primary focus on App Router
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Include components
    // Remove "./pages/**/*.{js,ts,jsx,tsx,mdx}" unless you’re using Pages Router
  ],
  theme: {
    extend: {
      colors: {
        // Add custom colors if needed
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "blob": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)" },
          "25%": { transform: "translate(20px, -20px) scale(1.1)" },
          "50%": { transform: "translate(0, 20px) scale(1)" },
          "75%": { transform: "translate(-20px, 0) scale(1.1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "blob": "blob 10s infinite",
      },
    },
  },
  plugins: [],
}

export default config