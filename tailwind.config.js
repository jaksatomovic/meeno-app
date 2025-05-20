/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx}",
    "./src/**/*.css",
  ],
  important: ".coco-container",
  theme: {
    extend: {
      backgroundColor: {
        primary: "rgb(var(--color-primary) / <alpha-value>)",
        secondary: "rgb(var(--color-secondary) / <alpha-value>)",
        background: "rgb(var(--color-background) / <alpha-value>)",
        foreground: "rgb(var(--color-foreground) / <alpha-value>)",
        separator: "rgb(var(--color-separator) / <alpha-value>)",
      },
      backgroundImage: {
        chat_bg_light: "url('./assets/chat_bg_light.png')",
        chat_bg_dark: "url('./assets/chat_bg_dark.png')",
        search_bg_light: "url('./assets/search_bg_light.png')",
        search_bg_dark: "url('./assets/search_bg_dark.png')",
        inputbox_bg_light: "url('./assets/inputbox_bg_light.png')",
        inputbox_bg_dark: "url('./assets/inputbox_bg_dark.png')",
      },
      textColor: {
        primary: "rgb(var(--color-foreground) / <alpha-value>)",
      },
      animation: {
        "fade-in": "fade-in 0.2s ease-in-out",
        typing: "typing 1.5s ease-in-out infinite",
        shake: "shake 0.5s ease-in-out",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        typing: {
          "0%": { opacity: "0.3" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.3" },
        },
        shake: {
          "0%, 100%": { transform: "rotate(0deg)" },
          "25%": { transform: "rotate(-20deg)" },
          "75%": { transform: "rotate(20deg)" },
        },
      },
      boxShadow: {
        "window-custom": "0px 16px 32px 0px rgba(0,0,0,0.3)",
      },
      zIndex: {
        100: "100",
        1000: "1000",
        2000: "2000",
      },
      screens: {
        'mobile': {'max': '679px'},
      },
    },
  },
  plugins: [],
  mode: "jit",
  darkMode: ["class", '[data-theme="dark"]'],
  safelist: ["bg-[green]", "bg-[red]", "bg-[yellow]"],
};
