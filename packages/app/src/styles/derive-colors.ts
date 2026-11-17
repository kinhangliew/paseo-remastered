/**
 * The relationships between theme colors, stated once.
 *
 * A theme supplies places (a background, a sidebar) and identity (foreground, accent). What sits
 * on top of a place — its hover, its selected state, the neutral fill of a chip, the text one
 * notch quieter than muted — is a relationship, and is derived here so that no theme has to pick
 * it by eye and no plugin has to borrow another role's color to fill it.
 *
 * Every step is a WCAG contrast ratio from the color it starts at, moving toward the foreground.
 * A ratio keeps the step equally visible on every base; a lightness delta disappears near black.
 * The numbers come from the default themes: Paseo dark and Light, whose values are the soft-UI
 * handoff's (`design-handoff/soft-ui.md`).
 */
import { contrastRatio, mixHexColors, stepContrast } from "@/utils/color";

export type ColorScheme = "light" | "dark";

const SURFACE_STATE_STEPS = {
  dark: { hover: 1.15, selected: 1.28 },
  light: { hover: 1.1, selected: 1.22 },
} as const;

// What sits inside a floating panel, as steps from the panel. On dark the pill and the icon tile
// are one level lighter than the panel, because dark layers separate by lightness. On light both
// are the page itself: a white pill on a gray track.
const PANEL_CONTENT_STEPS = {
  dark: { pill: 1.36, iconFill: 1.14, iconOutline: 2.38, iconGlyph: 6.48 },
  light: { iconOutline: 1.76, iconGlyph: 3.67 },
} as const;

// The composer card on dark lifts off the page by this step; on light it is the page, with a border.
const DARK_COMPOSER_STEP = 1.1;

// Unselected row text sits this far from muted toward the foreground.
const SECONDARY_TEXT_MIX = 0.5;

// Fills for chips, bubbles, tracks and secondary buttons, as `surface3` and `surface4`.
const NEUTRAL_FILL_STEPS = {
  dark: { surface3: 1.8, surface4: 2.5 },
  light: { surface3: 1.27, surface4: 1.48 },
} as const;

// `surface3` carries text (message bubbles, secondary buttons, badges), so its step is bounded by
// the contrast the theme gives its own text: foreground stays at least this readable on it. The
// margin over 3:1 absorbs the rounding of the fill to 8-bit channels.
const NEUTRAL_FILL_TEXT_FLOOR = 3.05;
// The fill never steps less than this, so it stays visible against the page. A theme whose body
// text is under about 3.8:1 (3.05 x 1.25) cannot have both: the fill keeps this step and text on
// it falls under 3:1.
const NEUTRAL_FILL_MIN_STEP = 1.25;

// Tertiary text: muted text, that fraction of the way toward the background, but never quieter
// than this contrast against it (or than the muted text itself, when that is already quieter). The
// margin over 2.5:1 absorbs the rounding to 8-bit channels.
const TERTIARY_TEXT_FADE = 0.35;
const TERTIARY_TEXT_FLOOR = 2.55;

/** Hover and selected fills for a row that sits on `surface`. */
export function deriveSurfaceStates(
  surface: string,
  foreground: string,
  scheme: ColorScheme,
): { hover: string; selected: string } {
  const steps = SURFACE_STATE_STEPS[scheme];
  return {
    hover: stepContrast(surface, foreground, steps.hover),
    selected: stepContrast(surface, foreground, steps.selected),
  };
}

export interface PanelContentColors {
  surfacePill: string;
  surfaceComposer: string;
  foregroundSecondary: string;
  iconFill: string;
  iconOutline: string;
  iconGlyph: string;
}

/** The pill, composer card, secondary text and icon colors for a theme's page and panel. */
export function derivePanelContent({
  page,
  panel,
  foreground,
  mutedForeground,
  scheme,
}: {
  page: string;
  panel: string;
  foreground: string;
  mutedForeground: string;
  scheme: ColorScheme;
}): PanelContentColors {
  const foregroundSecondary = mixHexColors(mutedForeground, foreground, SECONDARY_TEXT_MIX);
  if (scheme === "light") {
    const steps = PANEL_CONTENT_STEPS.light;
    return {
      surfacePill: page,
      surfaceComposer: page,
      foregroundSecondary,
      iconFill: page,
      iconOutline: stepContrast(panel, foreground, steps.iconOutline),
      iconGlyph: stepContrast(panel, foreground, steps.iconGlyph),
    };
  }
  const steps = PANEL_CONTENT_STEPS.dark;
  return {
    surfacePill: stepContrast(panel, foreground, steps.pill),
    surfaceComposer: stepContrast(page, foreground, DARK_COMPOSER_STEP),
    foregroundSecondary,
    iconFill: stepContrast(panel, foreground, steps.iconFill),
    iconOutline: stepContrast(panel, foreground, steps.iconOutline),
    iconGlyph: stepContrast(panel, foreground, steps.iconGlyph),
  };
}

/** The neutral fills that sit on the page background. */
export function deriveNeutralFills(
  background: string,
  foreground: string,
  scheme: ColorScheme,
): { surface3: string; surface4: string } {
  const steps = NEUTRAL_FILL_STEPS[scheme];
  // Foreground on the fill is about (foreground on background) / step.
  const textBound = contrastRatio(background, foreground) / NEUTRAL_FILL_TEXT_FLOOR;
  return {
    surface3: stepContrast(
      background,
      foreground,
      Math.max(NEUTRAL_FILL_MIN_STEP, Math.min(steps.surface3, textBound)),
    ),
    surface4: stepContrast(background, foreground, steps.surface4),
  };
}

export function deriveTertiaryText(mutedForeground: string, background: string): string {
  const faded = mixHexColors(mutedForeground, background, TERTIARY_TEXT_FADE);
  const floor = Math.min(TERTIARY_TEXT_FLOOR, contrastRatio(background, mutedForeground));
  if (contrastRatio(background, faded) >= floor) return faded;
  return stepContrast(background, mutedForeground, floor);
}

/** Keep page tertiary text where it is readable; otherwise derive it against the row state. */
export function deriveSidebarStateText(
  tertiary: string,
  surface: string,
  foreground: string,
): string {
  if (contrastRatio(tertiary, surface) >= TERTIARY_TEXT_FLOOR) return tertiary;
  return stepContrast(surface, foreground, TERTIARY_TEXT_FLOOR);
}
