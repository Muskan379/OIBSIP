/**
 * Semantic design tokens for the Stopwatch app.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: "#0a0a0a",
    tint: "#f5a524",

    // Core surfaces
    background: "#0b0d12",
    foreground: "#f5f6f8",

    // Cards / elevated surfaces
    card: "#151821",
    cardForeground: "#f5f6f8",

    // Primary action color (buttons, links, active states)
    primary: "#f5a524",
    primaryForeground: "#12131a",

    // Secondary / less-emphasis interactive surfaces
    secondary: "#1c2029",
    secondaryForeground: "#e6e8ec",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#1c2029",
    mutedForeground: "#8b93a3",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#242938",
    accentForeground: "#f5a524",

    // Destructive actions (delete, error states)
    destructive: "#ef4444",
    destructiveForeground: "#ffffff",

    // Borders and input outlines
    border: "#232733",
    input: "#232733",
  },

  radius: 20,
};

export default colors;
