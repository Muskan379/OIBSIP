/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: "#101827",
    tint: "#0f766e",

    // Core surfaces
    background: "#f6f7f5",
    foreground: "#101827",

    // Cards / elevated surfaces
    card: "#ffffff",
    cardForeground: "#101827",

    // Primary action color (buttons, links, active states)
    primary: "#0f766e",
    primaryForeground: "#ffffff",

    // Secondary / less-emphasis interactive surfaces
    secondary: "#eef2ee",
    secondaryForeground: "#1a2e28",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#eceeec",
    mutedForeground: "#6b7280",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#fde68a",
    accentForeground: "#78350f",

    // Destructive actions (delete, error states)
    destructive: "#e11d48",
    destructiveForeground: "#ffffff",

    // Borders and input outlines
    border: "#e2e5e1",
    input: "#e2e5e1",

    // Success state (completed tasks)
    success: "#16a34a",
  },

  // Border radius (in px). Applies to cards, buttons, inputs, and modals.
  radius: 16,
};

export default colors;
