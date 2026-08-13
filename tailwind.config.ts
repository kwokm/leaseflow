import type { Config } from "tailwindcss";

// Palette is the Attio-inspired token set (design/attio-inspired/NOTES.md).
// The semantic shadcn names are re-pointed at those tokens so every existing
// component inherits the theme rather than running a second look alongside it.
const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1C1D1F",
          2: "#2D3238",
        },
        mute: {
          DEFAULT: "#6D7988",
          2: "#8D99A8",
          3: "#B3BDC9",
        },
        slate: {
          DEFAULT: "#4E5967",
        },
        line: {
          DEFAULT: "#E3E7EC",
          2: "#C9D0D9",
        },
        paper: "#FFFFFF",
        mist: "#FAFAFB",
        rail: "#F4F4F6",
        fill: {
          DEFAULT: "#202124",
          text: "#F3F4F6",
        },
        dark: {
          DEFAULT: "#101010",
          2: "#2D3238",
        },
        "on-dark": "#ECEFF3",
        blue: {
          DEFAULT: "#266DF0",
          soft: "rgba(38, 109, 240, 0.12)",
        },
        ok: {
          DEFAULT: "#12A150",
          bg: "#EEF8F1",
        },
        warn: {
          DEFAULT: "#F5B400",
          bg: "#FDF6E3",
        },
        no: {
          DEFAULT: "#E15C6B",
          bg: "#F8EEF0",
        },

        // Semantic aliases used by the existing shadcn primitives.
        border: "#E3E7EC",
        input: "#C9D0D9",
        ring: "#1C1D1F",
        background: "#FFFFFF",
        foreground: "#1C1D1F",
        primary: {
          DEFAULT: "#202124",
          foreground: "#F3F4F6",
        },
        secondary: {
          DEFAULT: "#FAFAFB",
          foreground: "#2D3238",
        },
        destructive: {
          DEFAULT: "#E15C6B",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#FAFAFB",
          foreground: "#6D7988",
        },
        accent: {
          DEFAULT: "#F4F4F6",
          foreground: "#1C1D1F",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1D1F",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1C1D1F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Reference type ramp
        body: ["16px", { lineHeight: "22px", letterSpacing: "-0.16px", fontWeight: "500" }],
        label: ["13px", { lineHeight: "18px", letterSpacing: "-0.13px" }],
        h3: ["24px", { lineHeight: "27.6px", letterSpacing: "-0.24px" }],
        h2: ["40px", { lineHeight: "44px", letterSpacing: "-0.4px" }],
      },
      borderRadius: {
        btn: "10px",
        lg: "12px",
        md: "10px",
        sm: "8px",
      },
      boxShadow: {
        window:
          "0 1px 1px rgba(28, 29, 31, 0.04), 0 28px 60px -18px rgba(40, 50, 90, 0.22)",
        mini: "0 12px 32px -18px rgba(40, 50, 90, 0.18)",
      },
      maxWidth: {
        shell: "1240px",
        header: "1440px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
