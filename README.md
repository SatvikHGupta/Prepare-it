# Prepare it

Free interview practice. Search practice problems by keyword, topic, question type, domain and difficulty, and see what candidates report publicly about interviews at specific companies and roles.

Every problem says plainly how its answer was checked, and none of them is copied from, or claimed to be asked by, any company.

## Features

**Practice**
- Search with filters for difficulty, question type, domain, topic, tag and how the answer was checked
- Three result views (list, table, cards), grouping, sorting, typo suggestions and a random problem
- Problem pages with a hidden answer and derivation, runnable-style SQL tables, syntax-highlighted code, line-by-line diffs and typeset math
- Previous and next navigation that follows the list you came from, with `j` and `k` shortcuts
- Bookmarks saved on the device, no account needed

**Explore**
- Pages for roles, companies, domains, topics, tags and question types
- Company pages with the roles and levels people report, the usual interview steps, charts, and a practice set matched to the topics that come up most

**Experience**
- Light, dark and system modes with a choice of accent colours, all checked for contrast
- Keyboard friendly: skip link, visible focus, every scrollable block reachable with Tab
- Respects reduced-motion settings
- Works on phones: menus and filters become bottom sheets
- Contact form that opens your own email app; nothing is sent from the page

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) and React 19 |
| Language | JavaScript and JSX |
| State | Zustand |
| Content rendering | marked, KaTeX, Shiki |
| Charts | Chart.js, loaded only when a chart scrolls into view |
| Fonts | Fraunces, Instrument Sans, JetBrains Mono (self-hosted) |
| Testing | Vitest, Testing Library, happy-dom |
| Linting | ESLint with the Next.js config |

## Getting started

Requires Node.js 22.13 or newer.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

| Command | Purpose |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run the test suite |

## Project structure

```
src/
  app/          routes and metadata
  components/   ui, layout, problem, entity, search, charts, theme
  lib/          search engine, rendering (markdown, math, code), helpers
  theme/        theme engine
  themes/       modes and accent colours
  styles/       global stylesheets
public/         static assets
```

## Accessibility

Prepare it aims for WCAG 2.1 AA. Colour pairs are validated when the project builds, interactive controls are keyboard operable, charts have a hidden data table for screen readers, and motion is removed for people who ask for reduced motion.

## Contact

Found a mistake in a problem, or want something removed? Use the contact page on the site.