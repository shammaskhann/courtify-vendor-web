# Courtify Vendor Web - Vibe Coding Rules

The following rules dictate the architectural, styling, and behavioral constraints for the project. These rules must be followed on every task.

---

## 1. Project Principles

- Prefer simplicity over cleverness.
- Never duplicate logic.
- Reuse existing components before creating new ones.
- Every feature should be modular.
- Follow existing project patterns.
- Keep files under ~300 lines whenever possible.
- Use TypeScript strictly.
- Never use `any`.
- Never disable eslint rules.

---

## 2. Architecture Rules

### Folder Structure
- Shared UI → `src/components/ui`
- Business logic → `src/services`
- Helpers → `src/utils`
- Constants → `src/constants`
- Types → `src/types`
- Never mix API logic inside UI.

### API Rules
Never fetch directly inside UI. Use this flow:
`Page` → `Hook` → `Service` → `API`
*(Example: `Dashboard` → `useUsers()` → `userService` → `fetch()`)*

### State Management
- Server state: `TanStack Query`
- Local UI: `useState`
- Global UI: `Zustand`
Avoid huge Context providers.

### Error Handling
Every async function must handle Loading, Error, Success, and Empty states. Never assume success.

### Performance
Lazy load: Charts, Heavy tables, Editors, Maps.
Memoize only when needed. Never optimize prematurely.

### Security
- Never trust frontend validation.
- Always sanitize: Forms, URLs, Query params, Uploaded files.
- Never expose secrets.

### Git Rules
One feature → One branch → One PR.
Commit messages: `feat:`, `fix:`, `refactor:`, `style:`, `docs:`, `test:`

---

## 3. Component Guidelines

- One component = One responsibility.
- Never create components larger than 200-300 lines. Extract reusable sections.
- Prefer composition over prop drilling.
- **Naming:** Components (`PascalCase`), Hooks (`camelCase`), Files (`kebab-case`), Variables (`camelCase`), Constants (`UPPER_CASE`).

### Forms
Always use `React Hook Form` + `Zod`. Validation lives in Zod. Never duplicate validation logic in the UI.

### Tables
Must support: Loading, Sorting, Searching, Pagination, Empty state, Error state.

### Modals & Toasts
- Never use browser alerts (`alert()`, `confirm()`). Use Dialog, Confirmation, Success, Delete confirmation.
- Every important action should give feedback (Saved, Deleted, Updated, Copied, Failed). Never silently fail.

### Accessibility
- Every form must have: Label, Placeholder, Error feedback, `aria-label` if needed.
- Buttons must be: Keyboard accessible, Focus visible.

---

## 4. Design System Rules

### Semantic Colors
Never hardcode colors like `text-red-500` or `#2D72FF`. Always use semantic tokens:
`Primary`, `Secondary`, `Success`, `Danger`, `Warning`, `Info`, `Surface`, `Background`, `Muted`, `Border`, `Card`, `Accent`.
*(Example: `bg-primary`, `text-primary`, `border-border`)*

### Spacing Rules
Use an 8px spacing system: `4, 8, 12, 16, 24, 32, 40, 48, 64, 80`. Avoid random spacing like `mt-[13px]`.

### Typography
Only define typography once. Do not randomly change font sizes.
`Heading XL`, `Heading LG`, `Heading`, `Subtitle`, `Body`, `Caption`, `Label`.

### Icons & Buttons
- Choose ONE icon library: **lucide-react**. Never mix with others.
- Buttons have fixed variants: `Primary`, `Secondary`, `Outline`, `Ghost`, `Danger`, `Link`.
- Button sizes: `sm`, `md`, `lg`.

### Responsive Rules
Design mobile first. Support `Mobile`, `Tablet`, `Desktop`. Never hide important functionality on mobile.

---

## 5. AI Prompt Rules (Golden Rule)
Treat the AI as a teammate by creating strict **constraints** so every prompt produces code that matches the rest of the project.

**Example of a Good Prompt:**
> "Create a dashboard page using the existing Card, Button, Badge, Table, and Dialog components. Follow the project's spacing, typography, semantic color tokens, loading/error/empty state patterns, and file organization. Do not introduce new patterns or dependencies."
