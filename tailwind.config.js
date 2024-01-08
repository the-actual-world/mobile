/** @type {import('tailwindcss').Config} */
const { plugin } = require("twrnc");
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light
        background: "#ffffff",
        "new-background": "#f3f3f3", // Slightly darker background color for better contrast
        foreground: "#1a1a1a", // Slightly darker text color for better contrast
        muted: "#f1f5f9",
        "muted-foreground": "#64748b",
        popover: "#ffffff",
        "popover-foreground": "#1a1a1a",
        card: "#ffffff",
        "card-foreground": "#1a1a1a",
        border: "#e2e8f0",
        input: "#e2e8f0",
        primary: "#097E67",
        "primary-foreground": "#ffffff",
        secondary: "#f1f5f9",
        "secondary-foreground": "#1a1a1a",
        accent: "#0CB289", // Slightly modified accent color for harmony
        "accent-foreground": "#ffffff",
        destructive: "#ff5252", // Lighter and less intense destructive color
        "destructive-foreground": "#ffffff",
        ring: "#7f8ea3", // Adjusted ring color

        // Dark
        "dark-background": "#0f0f0f", // Slightly warmer dark background color
        "dark-new-background": "#121212", // Slightly warmer dark background color
        "dark-foreground": "#c0c0c0", // Adjusted dark foreground color for better contrast
        "dark-muted": "#0f1629",
        "dark-muted-foreground": "#7f8ea3",
        "dark-popover": "#121212",
        "dark-popover-foreground": "#7f8ea3",
        "dark-card": "#121212",
        "dark-card-foreground": "#c0c0c0",
        "dark-border": "#1d283a",
        "dark-input": "#1d283a",
        "dark-primary": "#0CB289",
        "dark-primary-foreground": "#ffffff",
        "dark-secondary": "#121212", // Warmer dark secondary color
        "dark-secondary-foreground": "#ffffff",
        "dark-accent": "#097E67", // Slightly modified dark accent color
        "dark-accent-foreground": "#ffffff",
        "dark-destructive": "#c62828", // Lighter and less intense dark destructive color
        "dark-destructive-foreground": "#ffffff",
        "dark-ring": "#1a1a1a",
      },
      aspectRatio: {
        "3/4": "3 / 4",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        // Typography
        h1: `text-4xl font-extrabold tracking-tight lg:text-5xl`,
        h2: `border-b pb-2 text-3xl font-semibold tracking-tight`,
        h3: `text-2xl font-semibold tracking-tight`,
        h4: `text-xl font-semibold tracking-tight`,
        h5: `text-lg font-semibold tracking-tight`,
        p: `leading-7`,
        lead: `text-xl text-muted-foreground dark:text-dark-muted-foreground`,
        large: `text-lg font-semibold`,
        small: `text-sm font-medium leading-0`,
        muted: `text-sm text-muted-foreground dark:text-dark-muted-foreground`,
      });
    }),
  ],
};
