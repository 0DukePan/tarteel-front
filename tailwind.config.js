/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx}',        // App Router files
    './components/**/*.{ts,tsx}', // Components
    './pages/**/*.{ts,tsx}',     // Pages Router (if used)
    './layout/**/*.{ts,tsx}',    // Layouts (common in App Router)
    './globals.css',             // Include globals.css explicitly
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};