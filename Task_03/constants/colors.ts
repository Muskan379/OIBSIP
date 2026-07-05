/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: "#f5f5f7",
    tint: "#ff9f0a",

    // Core surfaces
    background: "#000000",
    foreground: "#f5f5f7",

    // Cards / elevated surfaces
    card: "#333333",
    cardForeground: "#f5f5f7",

    // Primary action color (buttons, links, active states)
    primary: "#ff9f0a",
    primaryForeground: "#000000",

    // Secondary / less-emphasis interactive surfaces
    secondary: "#a5a5a5",
    secondaryForeground: "#000000",

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: "#1c1c1e",
    mutedForeground: "#8e8e93",

    // Accent highlights (badges, selected items, focus rings)
    accent: "#333333",
    accentForeground: "#f5f5f7",

    // Destructive actions (delete, error states)
    destructive: "#ff453a",
    destructiveForeground: "#ffffff",

    // Borders and input outlines
    border: "#2c2c2e",
    input: "#2c2c2e",
  },

  // Border radius (in px). Applies to cards, buttons, inputs, and modals.
  radius: 999,
};

export default colors;
