# Courtify Vendor Panel Theme Guide

## 1. Purpose

This guide defines the visual language for the web-based Courtify vendor panel. It is intended to keep every screen visually consistent across dashboard, venues, courts, bookings, deals, analytics, and settings.

The theme direction follows the current Courtify brand system: a lime accent, neutral surfaces, high-contrast typography, and clean card-based layouts that remain readable in both light and dark modes.

## 2. Theme Principles

- Keep the interface operational and calm, not decorative.
- Use one strong accent color consistently for primary actions and selected states.
- Use neutral surfaces to separate dense data areas.
- Prefer clear hierarchy over heavy visual effects.
- Design for fast scanning, because vendors will use the panel for daily operations.
- Maintain parity between light and dark mode so screen structure does not change with theme.

## 3. Brand Direction

### 3.1 Core Visual Identity

- Brand accent: lime green.
- Support accent: deep green for icons and subtle highlights.
- Contrast color: cyan used sparingly for secondary emphasis.
- Base surfaces: white or near-black depending on theme.
- Structure: cards, tables, panels, chips, and side navigation.

### 3.2 Personality

- Confident.
- Functional.
- Modern.
- Slightly premium.
- Never playful or cluttered.

## 4. Typography

### 4.1 Type Roles

- Page title: large, bold, compact.
- Section title: medium-bold.
- Card title: semibold.
- Body text: regular and highly readable.
- Meta text: smaller, muted, but still legible.
- Table labels: compact and semibold for dense data scanning.

### 4.2 Typographic Rules

- Use one font family across the web panel unless a design system already exists.
- Avoid mixing too many font weights.
- Keep line height comfortable in forms and tables.
- Prefer sentence case for headings and labels.
- Use all caps only for very small status badges or compact metric labels.

### 4.3 Suggested Hierarchy

- H1: dashboard page title.
- H2: module title.
- H3: card title or form step title.
- Body: standard content.
- Caption: hints, timestamps, metadata.

## 5. Layout System

### 5.1 Page Structure

- Left sidebar for primary navigation on desktop.
- Top bar for search, notifications, profile, and context actions.
- Main content area with a max width suitable for dashboards.
- Content sections should be grouped into cards or panels.

### 5.2 Spacing Rules

- Use an 8px spacing system.
- Small gaps: 8 to 12 px.
- Medium gaps: 16 to 24 px.
- Large page spacing: 32 px and above.
- Keep form field spacing consistent across all modules.

### 5.3 Grid and Density

- Dashboard metrics: 2, 3, or 4-column responsive grid.
- Forms: single column on smaller widths, two columns on wider layouts.
- Tables: full width with fixed headers where useful.
- Lists: card list view for narrow screens.

## 6. Screen Composition Rules

### 6.1 Standard Screen Pattern

Each major screen should follow this order:

1. Title and context.
2. Key actions.
3. Summary widgets or filters.
4. Main content area.
5. Secondary details or notes.

### 6.2 Card Pattern

- Use cards for summary metrics, forms, and grouped data.
- Cards should have subtle elevation or a thin border, not both aggressively.
- Keep card headers compact and aligned.
- Place primary actions in the card header or top-right corner.

### 6.3 Table Pattern

- Use tables for bookings, venue lists, court lists, and deal lists.
- Include sticky headers where the dataset is large.
- Keep row actions minimal and predictable.
- Use status chips rather than colored text when possible.

### 6.4 Empty and Loading States

- Empty states should explain what the user can do next.
- Loading states should preserve layout to avoid jumping.
- Skeleton loaders are preferred for analytics, lists, and cards.

## 7. Component Guidelines

### 7.1 Buttons

- Primary button: lime accent background with strong text contrast.
- Secondary button: outlined or neutral fill.
- Destructive button: red only for irreversible actions.
- CTA placement should stay consistent across modules.

### 7.2 Inputs

- Inputs should have visible labels, not placeholder-only labels.
- Focus state should use the primary accent.
- Error state should be clear and immediate.
- Helper text should be concise.

### 7.3 Chips and Tags

- Use chips for filters, sports, days, and quick selectors.
- Selected chips should feel active but not overpowering.
- Status chips should use semantic colors only.

### 7.4 Cards and Panels

- Use a uniform radius across the app.
- Keep padding consistent in every card.
- Avoid mixing multiple shadow styles in one screen.

### 7.5 Navigation

- Active nav item should use the brand accent.
- Inactive items should stay muted.
- On mobile, compress navigation into a drawer or bottom-level equivalent only if needed.

## 8. Responsive Behavior

### 8.1 Desktop

- Sidebar visible by default.
- Tables and analytics can use full width.
- Multi-column forms are acceptable when they improve speed.

### 8.2 Tablet

- Sidebar may collapse into a slimmer rail.
- Metrics grid should reduce to 2 columns.
- Tables should still remain readable without overflow issues.

### 8.3 Mobile Width

- Navigation should become compact.
- Cards should stack vertically.
- Forms should collapse to single-column layouts.
- Critical actions should remain reachable without horizontal scrolling.

## 9. Light and Dark Mode Rules

### 9.1 Light Mode

- Use airy surfaces and subtle borders.
- Keep text dark enough for long-form readability.
- Avoid overusing saturated backgrounds.

### 9.2 Dark Mode

- Use deep neutral surfaces, not pure black everywhere.
- Preserve spacing and hierarchy exactly as light mode.
- Keep borders visible but subtle.
- Ensure charts, chips, and status badges remain legible.

### 9.3 Theme Consistency Rule

- Only color values change between themes.
- Layout, spacing, hierarchy, and behavior must remain the same.

## 10. Screen Design Templates

### 10.1 Dashboard Template

- Page title.
- Time range selector.
- Metric cards.
- Revenue chart.
- Booking trend block.
- Recent activity list.

### 10.2 Venue Management Template

- Search and filters.
- Venue cards or table.
- Create venue action.
- Detail drawer or full page detail.
- Form wizard for create and edit.

### 10.3 Court Management Template

- Venue selector.
- Court list.
- Create and edit court form.
- Pricing configuration section.
- Upload preview section.

### 10.4 Booking Template

- Status tabs.
- Search and venue filter.
- Booking table.
- Detail panel.
- QR verification action.

### 10.5 Deals Template

- Filter bar.
- Deal table or cards.
- Create deal action.
- Edit deal drawer.
- Toggle and delete actions.

## 11. Motion and Feedback

- Use subtle transitions for tab switches and panel expansion.
- Keep animation durations short.
- Use motion to clarify state changes, not to decorate every click.
- Success feedback should be immediate and restrained.
- Error feedback should be direct and actionable.

## 12. Icons and Imagery

- Prefer outline icons for navigation and actions.
- Use filled icons only when a state is active or emphasized.
- Keep imagery minimal and functional.
- Venue and court photos should be framed consistently.

## 13. Design Do and Do Not

### Do

- Keep spacing consistent.
- Reuse the same card and form patterns.
- Use semantic color meaning.
- Design for quick scanning.

### Do Not

- Do not introduce unrelated accent colors.
- Do not vary spacing by module.
- Do not use decorative gradients as the primary visual language.
- Do not make data screens feel like marketing pages.

## 14. Handoff Notes

- Use this guide together with the color reference document.
- Keep component styling tied to theme tokens, not one-off values.
- Add new screen patterns only if they fit the existing dashboard language.