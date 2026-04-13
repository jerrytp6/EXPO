/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Inter", "-apple-system", "sans-serif"],
        tc: ["Noto Sans TC", "-apple-system", "PingFang TC", "sans-serif"],
      },
      colors: {
        brand: {
          blue: "#0071e3",
          green: "#30d158",
          orange: "#ff9f0a",
          red: "#ff3b30",
          purple: "#bf5af2",
          indigo: "#5e5ce6",
        },
        ink: {
          primary: "#1d1d1f",
          secondary: "#6e6e73",
          tertiary: "#86868b",
        },
        surface: {
          DEFAULT: "#f5f5f7",
          elevated: "#ffffff",
          tinted: "#fbfbfd",
          sidebar: "#fafafa",
        },
      },
      boxShadow: {
        sm: "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        md: "0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04)",
        lg: "0 20px 60px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)",
        xl: "0 40px 120px rgba(0,0,0,0.18), 0 16px 48px rgba(0,0,0,0.1)",
      },
      borderRadius: {
        pill: "980px",
      },
    },
  },
  plugins: [],
};
