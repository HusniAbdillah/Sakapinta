---
name: Luminous Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#ccdbf3'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e6eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d5e3fc'
  on-surface: '#0d1c2e'
  on-surface-variant: '#414754'
  inverse-surface: '#233144'
  inverse-on-surface: '#eaf1ff'
  outline: '#727786'
  outline-variant: '#c1c6d7'
  surface-tint: '#0059c5'
  primary: '#0058c3'
  on-primary: '#ffffff'
  primary-container: '#0070f3'
  on-primary-container: '#ffffff'
  inverse-primary: '#aec6ff'
  secondary: '#00677c'
  on-secondary: '#ffffff'
  secondary-container: '#4fd9fd'
  on-secondary-container: '#005c70'
  tertiary: '#5a5d5f'
  on-tertiary: '#ffffff'
  tertiary-container: '#737678'
  on-tertiary-container: '#fffeff'
  error: '#EF4444'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e2ff'
  primary-fixed-dim: '#aec6ff'
  on-primary-fixed: '#001a43'
  on-primary-fixed-variant: '#004397'
  secondary-fixed: '#b2ebff'
  secondary-fixed-dim: '#4bd6fa'
  on-secondary-fixed: '#001f27'
  on-secondary-fixed-variant: '#004e5e'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0d1c2e'
  surface-variant: '#d5e3fc'
  electric-cyan: '#00CED1'
  royal-blue: '#1E40AF'
  surface-base: '#F8FAFC'
  surface-glass: rgba(255, 255, 255, 0.7)
  success: '#10B981'
  warning: '#F59E0B'
typography:
  display-kpi:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  heading-caps:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
  body-main:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-mono:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 32px
  card-padding: 24px
  stack-gap: 12px
---

## Brand & Style

This design system represents a sophisticated evolution of technical intelligence interfaces, transitioning from a heavy "command center" aesthetic to a refined, high-clarity light mode. The brand personality is **Insightful, Professional, and Cutting-Edge**, designed for analysts and decision-makers who require high-density data without visual fatigue.

The visual identity follows a **Corporate / Modern** style with strong **Minimalist** influences. By utilizing a "Slate-White" foundation, the system emphasizes clarity and structural integrity. The use of vibrant cyan and royal blue accents ensures that the interface feels energetic and "alive" with data, while the adoption of subtle glassmorphism and refined shadows provides a tactile, multi-layered experience that feels premium and intentional.

## Colors

The color palette is anchored by the **Slate-White (#F8FAFC)** base, which provides a professional and neutral canvas. The interface utilizes a high-contrast logic to ensure accessibility in light mode:

- **Primary & Secondary:** The "Royal Blue" and "Electric Cyan" are adjusted to deeper, more saturated shades for optimal contrast against light surfaces. Royal Blue functions as the primary structural color, while Electric Cyan is reserved for interactive highlights and AI-driven insights.
- **Surface Logic:** Surfaces are layered using subtle shifts in lightness. The main background is Slate-White, while interactive containers use pure white or semi-transparent "glass" overlays to create depth.
- **Semantic Clarity:** Success, Warning, and Error colors are used sparingly to signal status, maintaining their vibrancy but adjusted for legibility against light backgrounds.

## Typography

The typographic system balances the geometric, future-forward aesthetic of **Space Grotesk** with the technical precision of **JetBrains Mono**.

- **Structure:** Space Grotesk is the primary voice for structural hierarchy (headings, titles). Its high x-height and distinctive apertures provide a modern, technical flair.
- **Data & Readability:** JetBrains Mono is used for all body text, data points, and labels. The monospaced nature ensures that numeric data remains perfectly aligned in tables and dashboards, reinforcing the "developer-grade" precision of the tool.
- **Scaling:** On mobile devices, `display-kpi` scales down to 28px to ensure visual balance while maintaining its impact.

## Layout & Spacing

The layout is built on a **12-column fluid grid** with a rigorous 4px spacing rhythm. This allows for high-density information display while maintaining a clear visual order.

- **Grid System:** Desktop layouts utilize a 12-column grid with 16px gutters and 32px side margins. On tablet (768px+), the grid remains at 12 columns but margins reduce to 24px.
- **Mobile Reflow:** For mobile devices (under 640px), the layout transitions to a single-column stack with 16px margins.
- **Containment:** Data is modularized into cards. Standardized internal padding of 24px ensures that even dense data tables have sufficient "breathing room" to prevent cognitive overload.

## Elevation & Depth

In this light-mode system, depth is conveyed through **Tonal Layering** and **Subtle Shadows**, replacing the glows of dark mode.

- **The Surface Hierarchy:**
  - **Level 0 (Base):** Slate-White (#F8FAFC) background.
  - **Level 1 (Cards):** Pure White (#FFFFFF) surfaces with a subtle 1px border (#E2E8F0) and a soft, diffused shadow (0px 4px 12px rgba(0, 0, 0, 0.05)).
  - **Level 2 (Overlays/Glass):** Semi-transparent white (80% opacity) with a 12px backdrop blur. This is used for navigation bars and sticky headers to maintain a sense of context.
- **Interactive Depth:** When a component is active or hovered, the shadow deepens slightly and the border color shifts to a more pronounced Royal Blue tint, signaling elevation without using aggressive color changes.

## Shapes

The shape language is defined by **Pill-shaped (3)** roundedness, translated into a consistent `12px (rounded-xl)` standard for primary containers.

- **Containers:** All cards and modal windows use a 12px (rounded-xl) corner radius.
- **Components:** Buttons and input fields use a slightly more aggressive 24px (rounded-lg/full) radius where appropriate to create a friendly, "not sharp" modern aesthetic.
- **Interactive Elements:** Small tags or status badges may use a "full" pill shape to distinguish them as discrete, clickable objects.

## Components

### Buttons
- **Primary:** Solid Royal Blue (#1E40AF) with white JetBrains Mono text. On hover, the background transitions to a slightly brighter Cyan-Blue gradient.
- **Secondary:** Transparent background with a 1px Slate border. Text is Royal Blue.
- **Ghost:** No border or background; text only. Used for tertiary actions to reduce visual noise.

### Cards
- **Standard Card:** White background, 12px rounded corners, and a 1px Slate-200 border. 
- **KPI Card:** Features a large JetBrains Mono display value. Includes a "Trend Indicator" in the top right using a colored pill (Success/Error) with 10% opacity background and 100% opacity text.

### Input Fields
- **Default:** White background with 1px Slate-300 border. 24px roundedness.
- **Focus:** Border shifts to Electric Cyan (#00CED1) with a 2px soft cyan "halo" (shadow) to indicate activity.

### Chips & Badges
- **Status Chips:** High-contrast text on a light tinted background (e.g., Success text on light emerald background).
- **Metric Badges:** Small, monospaced labels used for technical attributes or SKU codes, styled with a light slate background to look like physical "tags."

### Data Tables
- **Header:** Space Grotesk caps, Slate-500 text, 1px bottom border.
- **Row Hover:** Background shifts to a very faint Royal Blue (2% opacity) to track the eye across horizontal data.