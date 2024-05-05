/** @type {import('tailwindcss').Config} */
const { plugin } = require("twrnc");
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Light
        background: "#ffffff",
        "new-background": "#f8f8f8", // Slightly darker background color for better contrast
        foreground: "#1a1a1a", // Slightly darker text color for better contrast
        muted: "#f1f5f9",
        "muted-foreground": "#8494ab",
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
        accent: "#0CB289",
        "accent-foreground": "#ffffff",
        destructive: "#ff5252",
        "destructive-foreground": "#ffffff",
        ring: "#7f8ea3",
        // info blue
        info: "#007bff",

        // Dark
        "dark-background": "#0f0f0f",
        "dark-new-background": "#181818",
        "dark-foreground": "#c0c0c0",
        "dark-muted": "#232323",
        "dark-muted-foreground": "#7f8ea3",
        "dark-popover": "#121212",
        "dark-popover-foreground": "#7f8ea3",
        "dark-card": "#121212",
        "dark-card-foreground": "#c0c0c0",
        "dark-border": "#1d283a",
        "dark-input": "#1d283a",
        "dark-primary": "#0CB289",
        "dark-primary-foreground": "#ffffff",
        "dark-secondary": "#121212",
        "dark-secondary-foreground": "#ffffff",
        "dark-accent": "#097E67",
        "dark-accent-foreground": "#ffffff",
        "dark-destructive": "#c62828",
        "dark-destructive-foreground": "#ffffff",
        "dark-ring": "#1a1a1a",
        "dark-info": "#007bff",
      },
      aspectRatio: {
        "3/4": "3 / 4",
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
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
        "bg-fg": `bg-foreground dark:bg-dark-foreground`,
        "bg-bg": `bg-background dark:bg-dark-background`,
        "bg-bd": `bg-border dark:bg-dark-border`,
        "bg-new-bg": `bg-new-background dark:bg-dark-new-background`,
        "bg-mt": `bg-muted dark:bg-dark-muted`,
        "bg-mt-fg": `bg-muted-foreground dark:bg-dark-muted-foreground`,
        "text-fg": `text-foreground dark:text-dark-foreground`,
        "text-mt": `text-muted dark:text-dark-muted`,
        "text-mt-fg": `text-muted-foreground dark:text-dark-muted-foreground`,
        "text-bg": `text-background dark:text-dark-background`,
        "text-bd": `text-border dark:text-dark-border`,
        "text-new-bg": `text-new-background dark:text-dark-new-background`,
        "border-bd": `border border-border dark:border-dark-border`,
      });
    }),
  ],
};
