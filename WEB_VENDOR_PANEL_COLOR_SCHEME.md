# Courtify Vendor Panel Color Scheme

## 1. Purpose

This document defines the exact color system for the Courtify vendor panel. It is intended to help designers and developers create screens that remain visually consistent across the full dashboard.

## 2. Color System Goals

- Keep brand recognition strong through a single lime accent.
- Preserve readability in dense operational dashboards.
- Support both light and dark themes with minimal structural differences.
- Use semantic colors for states rather than decorative colors.
- Keep the palette restrained so the data remains the focus.

## 3. Brand Tokens

### 3.1 Primary Brand Accent

- Hex: `#CCE035`
- Role: main brand accent, primary buttons, active states, highlights.
- Usage: should appear consistently in both light and dark themes.

### 3.2 Support Accent

- Light theme support accent: `#1A3A2A`
- Dark theme support accent: `#48D8E8`
- Role: secondary emphasis, icons, subtle supporting actions.

### 3.3 Secondary Accent

- Light theme tertiary: `#00B8D4`
- Dark theme tertiary: `#B8B8FF`
- Role: occasional supporting highlight, charts, or special info labels.

## 4. Light Theme Palette

### 4.1 Surfaces

| Token | Hex | Use |
| --- | --- | --- |
| Background | `#F5F6F7` | Page background |
| Surface | `#FFFFFF` | Cards, panels, forms |
| Surface Variant | `#F0F1F3` | Elevated blocks, table headers |
| Card Ghost | `#14CCE035` | Accent overlay |

### 4.2 Text

| Token | Hex | Use |
| --- | --- | --- |
| Text Primary | `#1C1C1E` | Main content |
| Text Secondary | `#75808B` | Supporting text |
| Text Tertiary | `#A0A6B0` | Hints, disabled meta |

### 4.3 Borders and Dividers

| Token | Hex | Use |
| --- | --- | --- |
| Border | `#E1E8F0` | Inputs, cards, containers |
| Divider | `#D9DFE6` | Separators |
| Shadow | `#14000000` | Subtle elevation |

### 4.4 Status Colors

| Token | Hex | Use |
| --- | --- | --- |
| Success | `#34C759` | Confirmed, success |
| Warning | `#FF9F0A` | Pending, caution |
| Error | `#FF3B30` | Failure, delete, validation |
| Info | `#00B8D4` | Informational states |

## 5. Dark Theme Palette

### 5.1 Surfaces

| Token | Hex | Use |
| --- | --- | --- |
| Background | `#0A0A0A` | Main background |
| Surface | `#1C1C1E` | Cards, forms, panels |
| Surface Variant | `#2C2C2E` | Elevated containers |
| Card Ghost | `#26CCE035` | Accent overlay |

### 5.2 Text

| Token | Hex | Use |
| --- | --- | --- |
| Text Primary | `#FFFFFF` | Main content |
| Text Secondary | `#B3B3B3` | Supporting text |
| Text Tertiary | `#8E8E93` | Hints, disabled meta |

### 5.3 Borders and Dividers

| Token | Hex | Use |
| --- | --- | --- |
| Border | `#2C2C2E` | Input and card outlines |
| Divider | `#3D3D3F` | Separators |
| Shadow | `#4D000000` | Deep elevation |

### 5.4 Status Colors

| Token | Hex | Use |
| --- | --- | --- |
| Success | `#34C759` | Confirmed, success |
| Warning | `#FF9F0A` | Pending, caution |
| Error | `#FF453A` | Failure, delete, validation |
| Info | `#00C7E0` | Informational states |

## 6. Semantic Color Mapping

### 6.1 Brand and Action Mapping

| UI Role | Light | Dark |
| --- | --- | --- |
| Primary accent | `#CCE035` | `#CCE035` |
| Primary button text | `#1C1C1E` or `#FFFFFF` depending on contrast | `#0A0A0A` or `#FFFFFF` depending on contrast |
| Selected navigation | `#CCE035` | `#CCE035` |
| Icon accent | `#1A3A2A` | `#48D8E8` |

### 6.2 Background Mapping

| UI Role | Light | Dark |
| --- | --- | --- |
| Page background | `#F5F6F7` | `#0A0A0A` |
| Card background | `#FFFFFF` | `#1C1C1E` |
| Table header | `#F0F1F3` | `#2C2C2E` |
| Divider line | `#D9DFE6` | `#3D3D3F` |

### 6.3 Text Mapping

| UI Role | Light | Dark |
| --- | --- | --- |
| Primary text | `#1C1C1E` | `#FFFFFF` |
| Secondary text | `#75808B` | `#B3B3B3` |
| Disabled text | `#A0A6B0` | `#8E8E93` |

### 6.4 Status Mapping

| State | Color |
| --- | --- |
| Success / approved / confirmed | Green |
| Pending / warning / review | Orange |
| Error / rejected / validation | Red |
| Info / neutral highlight | Cyan |

## 7. Screen Usage Rules

### 7.1 Dashboard

- Primary action buttons should use the brand accent.
- Metric cards should use neutral surfaces and semantic chart colors.
- Revenue and occupancy charts should keep the accent as the strongest visual element.

### 7.2 Venues and Courts

- Use neutral cards for lists and forms.
- Use accent only for create actions, active filters, and selected states.
- Upload previews should stay on neutral backgrounds so images remain clear.

### 7.3 Bookings

- Use semantic chips for booking status.
- Keep confirmed green, pending orange, rejected red, completed muted green or neutral green.
- The QR verify action should be visually prominent but not destructive.

### 7.4 Deals

- Use accent sparingly so deals do not compete with primary operational actions.
- Use status colors for active and inactive states.

### 7.5 Settings and Profile

- Use neutral surfaces and subtle accent highlights only.
- Keep toggle states consistent with the global accent.

## 8. Chart Palette

Use this sequence for repeated analytics visuals:

1. Lime accent: primary series.
2. Cyan: secondary series.
3. Green: success or growth.
4. Orange: caution or pending.
5. Red: critical or decline.
6. Neutral gray: baseline or inactive series.

## 9. Input and State Colors

### 9.1 Inputs

- Border default: neutral border token.
- Focus border: primary accent.
- Error border: error color.
- Placeholder: tertiary text token.

### 9.2 Buttons

- Primary: lime accent background.
- Secondary: outlined or surface fill.
- Destructive: red.
- Disabled: muted background and muted text.

### 9.3 Alerts

- Success: green background tint and green icon.
- Warning: orange background tint and orange icon.
- Error: red background tint and red icon.
- Info: cyan background tint and cyan icon.

## 10. Accessibility Rules

- Do not use low-contrast text on tinted backgrounds.
- Keep primary accent usage limited so contrast stays clear.
- Avoid using color alone to indicate state; pair color with text or icons.
- Ensure charts and badges remain readable in both themes.

## 11. Implementation Guidance

- Treat the palette as a token system, not a set of one-off values.
- If a new semantic role is introduced, define light and dark values together.
- Reuse existing accent, text, border, and status tokens across new screens.
- Avoid adding new brand colors unless there is a product-level reason.

## 12. Quick Reference

- Brand accent: `#CCE035`
- Light background: `#F5F6F7`
- Dark background: `#0A0A0A`
- Light surface: `#FFFFFF`
- Dark surface: `#1C1C1E`
- Light text primary: `#1C1C1E`
- Dark text primary: `#FFFFFF`
- Success: `#34C759`
- Warning: `#FF9F0A`
- Error: `#FF3B30` in light, `#FF453A` in dark
- Info: `#00B8D4` in light, `#00C7E0` in dark