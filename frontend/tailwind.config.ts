import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: "#f8f9ff",
          dim: "#ccdbf3",
          bright: "#f8f9ff",
          base: "#F8FAFC",
          lowest: "#ffffff",
          low: "#eff4ff",
          container: "#e6eeff",
          high: "#dce9ff",
          highest: "#d5e3fc",
        },
        "on-surface": {
          DEFAULT: "#0d1c2e",
          variant: "#414754",
        },
        "inverse-surface": {
          DEFAULT: "#233144",
          on: "#eaf1ff",
        },
        outline: {
          DEFAULT: "#727786",
          variant: "#c1c6d7",
          border: "#e2e8f0",
        },
        primary: {
          DEFAULT: "#0058c3",
          container: "#0070f3",
          fixed: "#d8e2ff",
          "fixed-dim": "#aec6ff",
          "on-fixed": "#001a43",
        },
        secondary: {
          DEFAULT: "#00677c",
          container: "#4fd9fd",
          fixed: "#b2ebff",
          "fixed-dim": "#4bd6fa",
        },
        tertiary: {
          DEFAULT: "#5a5d5f",
          container: "#737678",
        },
        "royal-blue": "#1E40AF",
        "electric-cyan": "#00CED1",
        success: {
          DEFAULT: "#10B981",
          light: "#d1fae5",
          dark: "#065f46",
        },
        warning: {
          DEFAULT: "#F59E0B",
          light: "#fef3c7",
          dark: "#92400e",
        },
        error: {
          DEFAULT: "#EF4444",
          container: "#ffdad6",
          "on-container": "#93000a",
        },
      },
      fontFamily: {
        sans: ["'Space Grotesk'", "sans-serif"],
        display: ["'Space Grotesk'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
        body: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "0.5rem",
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
      boxShadow: {
        card: "0 4px 16px -2px rgba(13, 28, 46, 0.05), 0 2px 6px -1px rgba(13, 28, 46, 0.03)",
        "card-hover": "0 12px 28px -4px rgba(0, 88, 195, 0.12), 0 4px 10px -2px rgba(13, 28, 46, 0.04)",
        glass: "0 8px 32px 0 rgba(13, 28, 46, 0.06)",
        "cyan-halo": "0 0 0 3px rgba(0, 206, 209, 0.25)",
        "blue-halo": "0 0 0 3px rgba(0, 88, 195, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
