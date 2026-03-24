```markdown
# Design System Specification: The Living Canvas

## 1. Overview & Creative North Star
**Creative North Star: "The Digital Greenhouse"**

This design system is built to bridge the gap between high-tech artificial intelligence and the tactile, grounded world of agriculture. We move beyond "SaaS-standard" layouts by treating the interface as a living environment. Our goal is **Organic Precision**: a layout that feels as structured as a row of crops but as fluid as nature itself.

By utilizing intentional asymmetry, overlapping layers, and high-contrast typography, we create an editorial experience that feels premium and authoritative. We avoid the "boxed-in" feel of traditional grids by allowing elements to breathe and bleed, using depth rather than lines to define the workspace.

---

## 2. Color Theory & Tonal Depth

Our palette is rooted in the earth but illuminated by technology. 

### The Palette
- **Deep Forest Greens (`primary`: #061b0e):** Used for primary actions and deep background grounding. This is our "anchor" color.
- **Earthy Neutrals (`surface`: #fafaf5):** A warm, off-white base that prevents the "clinical" look of pure white, providing a sophisticated, paper-like quality.
- **Vibrant Lime AI Accents (`tertiary_fixed`: #bef500):** Reserved exclusively for AI-driven insights, data highlights, and "moment of magic" features.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through **Tonal Shifts**. To separate a sidebar from a main feed, transition from `surface` to `surface-container-low`. To highlight a featured module, use `surface-container-high` against a `surface` background. 

### Signature Textures & Glassmorphism
- **The Glass Principle:** For floating navigation or over-image overlays, use `surface` at 70% opacity with a `backdrop-blur` of 20px. This allows the "greenery" of the brand to peak through the UI.
- **Subtle Gradients:** Hero sections and primary CTAs should utilize a linear gradient from `primary` (#061b0e) to `primary_container` (#1b3022) at a 135-degree angle. This adds "soul" and dimension that flat hex codes lack.

---

## 3. Typography: Editorial Authority

We use a high-contrast pairing of **Manrope** for expressive headlines and **Inter** for functional data.

| Level | Token | Font | Size | Character |
| :--- | :--- | :--- | :--- | :--- |
| **Display** | `display-lg` | Manrope | 3.5rem | Bold, -2% tracking. For hero statements. |
| **Headline** | `headline-lg` | Manrope | 2rem | Bold, -1% tracking. For section starts. |
| **Title** | `title-lg` | Inter | 1.375rem | Medium. For card headings. |
| **Body** | `body-lg` | Inter | 1rem | Regular. For long-form reading. |
| **Label** | `label-md` | Inter | 0.75rem | Semibold, All-caps, +5% tracking. |

**Editorial Note:** Always maintain a minimum of `spacing-12` (4rem) between a Display headline and its following body text. White space is a functional element, not a void.

---

## 4. Elevation & Depth (The Layering Principle)

Depth is our primary tool for hierarchy. We treat the UI as a series of nested, physical sheets.

### Tonal Layering
Stack containers to create natural lift:
1. **Base:** `surface` (#fafaf5)
2. **Section:** `surface-container-low` (#f4f4ef)
3. **Interactive Card:** `surface-container-lowest` (#ffffff)

### Ambient Shadows
When a component must float (e.g., a critical AI modal), use an ambient shadow:
- **Color:** `on-surface` (#1a1c19) at 6% opacity.
- **Blur:** 40px to 60px.
- **Spread:** -5px to keep it tight and sophisticated.

### The "Ghost Border" Fallback
If contrast is required for accessibility (e.g., input fields), use a **Ghost Border**: `outline-variant` (#c3c8c1) at 20% opacity. Never use 100% opaque outlines.

---

## 5. Signature Components

### Primary Buttons
- **Style:** Gradient fill (`primary` to `primary_container`). 
- **Rounding:** `md` (0.75rem).
- **Interaction:** On hover, the button should lift slightly using an ambient shadow and scale to 102%.

### AI Insight Chips
- **Style:** Background of `tertiary_container` (#233000) with `tertiary_fixed` (#bef500) text.
- **Iconography:** Always accompanied by a 12px "sparkle" icon to denote AI generation.

### Data Cards (The Agritech Special)
- **Rules:** No dividers. Separate the "Soil Metric" from the "Weather Data" using a vertical `spacing-6` (2rem) gap. 
- **Header:** Use `label-md` in `on_surface_variant` (#434843) to categorize data before the value.

### Glass Navigation
- **Placement:** Fixed at the bottom or top of the viewport.
- **Effect:** `surface_container_lowest` at 80% opacity with `backdrop-filter: blur(16px)`. This creates an Apple-inspired floating dock feel.

---

## 6. Do’s and Don’ts

### Do
- **Do** use asymmetrical margins. For example, a 16.6% (2-column) left margin for text bodies to create an editorial feel.
- **Do** use `tertiary_fixed` (Lime) sparingly. It is a "high-velocity" color; if everything is highlighted, nothing is.
- **Do** lean into `rounded-xl` (1.5rem) for large image containers to soften the tech-heavy data.

### Don't
- **Don't** use black (#000000). Use `primary` (#061b0e) for maximum depth.
- **Don't** use lines to separate list items. Use a `spacing-2` gap and a `surface-container-low` background on hover.
- **Don't** center-align long blocks of text. Keep it left-aligned to maintain the "Modern Editorial" grid.

### Accessibility Note
Ensure all `tertiary` (Lime) accents on `surface` backgrounds are paired with `on_tertiary_fixed` (#151f00) for text to maintain a minimum 4.5:1 contrast ratio. Use `outline` (#737973) for focus states to ensure keyboard navigability is visible against the soft neutral backgrounds.```