# Change: Redesign the docs site theme to match archmax.ai and make it reusable

## Why

The docs at semantics.archmax.ai still read as a lightly recolored Starlight default: a flat white landing page with a plain "Documentation" heading and a purple button, invisible cards (white on white), tree lines in the sidebar, a rule under every page title, bordered screenshots, and no footer. The archmax website (archmax.ai) has a distinct identity the docs do not carry: the animated ci-palette gradient hero with a monospace `//` eyebrow, grey page with plain white surfaces, black pill buttons, semibold-max typography, a dark footer with legal links and the ci-palette dots. Visitors clicking "Docs" on the website land somewhere that looks like a different company. The earlier `update-docs-brand-styling` change fixed fonts and the accent hue but stopped short of layout, surfaces, and the landing page, and it left the docs with an inverted surface model (white page, grey cards) compared to the website (grey page, white cards).

The theme also lives as one hand-written `custom.css` inside `apps/docs`, so no other archmax project can reuse it.

## What Changes

- **Brand token layer**: adopt the website's token set verbatim (the same HSL variables and values as `archmax_website/src/app/globals.css`: `--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--accent`, `--ring`, `--radius`) as the single source of brand values in the docs, and derive every Starlight `--sl-*` variable from them. Light mode becomes grey page (`0 0% 96%`) with white content surfaces; dark mode becomes `0 0% 12%` page with `0 0% 4%` surfaces, matching the website's dark footer and dark theme.
- **Monochrome interaction model**: primary CTAs become black pills in light mode and light pills in dark mode (the website's `--primary`), secondary CTAs become translucent foreground pills. The 257° purple stays only on inline links, the active table-of-contents item, and focus rings. **BREAKING** for the current look: the purple "Get Started" button goes away.
- **Landing page**: replace the default Starlight splash hero with a full-bleed hero on the ci-palette gradient (the website's `GradientBackground`, 40 s flow, disabled under `prefers-reduced-motion`), a monospace `// Documentation` eyebrow, a semibold tagline headline, and the pill CTAs. Feature cards become white cards on the grey page with a `rounded-full bg-muted` icon chip (the website's icon-card pattern). Screenshots lose their 1 px border and sit on white card surfaces. Add a "Four steps" strip (Describe, Test, Deploy, Query) that mirrors the website's process section and links to the matching guides.
- **Page chrome**: sidebar without Starlight's tree lines, pill hover and active states, semibold group labels; remove the rule under page titles and the borders on the pagination cards (background contrast and spacing instead, the website's "background contrast → spacing → borders" order); header nav with a pill-styled "archmax.ai" back link next to GitHub; a compact dark footer with the archmax wordmark, product tagline, Website / GitHub / Imprint / Privacy links, the ci-palette dots, and a monospace copyright line. The Imprint and Privacy links point to the website's legal pages; a publicly served site from Germany needs them reachable.
- **Typography**: cap weight at semibold (600) everywhere including `h1`, keep `tracking-tight` on headings, use Geist Mono for eyebrows, badges, and the footer meta line, keep 16 px body text.
- **Reusable theme package in its own repository**: move the whole theme out of `apps/docs/src/styles/custom.css` into a Starlight plugin `@archmax-ai/starlight-theme` maintained in a new public repository `archmax-ai/starlight-theme` in the GitHub org and installed as a Git tag dependency (`github:archmax-ai/starlight-theme#v0.1.0`), not via npm. It registers the brand tokens CSS, the Starlight mapping CSS, the self-hosted Geist fonts, and the component overrides (`SiteTitle`, `Hero`, `Footer`, `Header`), and takes options for product name, version, and footer links. The theme is developed on this branch as a temporary workspace package (`packages/starlight-theme`) against the real docs site, then split into the new repository with `git subtree split` and tagged before this change merges; `apps/docs` consumes the tagged version with one `plugins` entry. The Pangea SDK docs (`archmax-ai/harness`, `docs/`, also Starlight 0.42) are the second consumer and adopt the theme in a follow-up PR in that repo.
- **Docs**: the Contributing section gets a "Docs theme" page explaining the token layers, where to change a color, and how another project adopts the plugin.

## Capabilities

### New Capabilities

- `docs-brand-theme`: the reusable archmax Starlight theme plugin: token layers, fonts, component overrides, options, and the behaviour any site that installs it gets.

### Modified Capabilities

- `documentation-site`: the "Brand-Consistent Theming", "Borderless Cards and Code Blocks", and "Sidebar Active State" requirements change (surface model, monochrome CTAs, no dividers/tree lines); new requirements for the landing page hero, the footer, the typography cap, and consuming the theme through the shared package.

## Impact

- **New repository**: `archmax-ai/starlight-theme` (buildless plugin entry `index.js` + `index.d.ts`, `brand/tokens.css` + fonts, `styles/starlight.css`, `styles/components.css`, `components/{SiteTitle,Hero,Footer,Header}.astro`, `package.json`, README, CI workflow). Releases are Git tags; nothing is published to npm. It is scaffolded inside this monorepo under `packages/starlight-theme` during development and removed from here once published.
- **Changed**: `apps/docs/astro.config.mjs` (plugin instead of `customCss` + `components`), `apps/docs/src/content/docs/index.mdx` (hero frontmatter, cards, steps strip, screenshot markup), `apps/docs/package.json` (`@archmax-ai/starlight-theme` pinned to a Git tag), `apps/docs/src/content/docs/contributing/` (new theme page), `openspec/config.yaml` (docs theming conventions).
- **Removed**: `apps/docs/src/styles/custom.css`, `apps/docs/src/components/SiteTitle.astro`, `apps/docs/public/fonts/` (move into the package).
- **Dependencies**: none new at runtime; the package depends on `@astrojs/starlight` and `astro` as peers.
- **CI**: `docs.yml` unchanged (still `pnpm --filter @archmax/docs build`). The theme repo runs its own typecheck and test workflow; Renovate bumps the pinned tag here and in `archmax-ai/harness`.
- **Other repositories**: `archmax-ai/harness` (`docs/astro.config.mjs`, `docs/src/styles/custom.css`) adopts the theme in a separate PR after publication; not part of this change's tasks beyond a hand-off note.
- **Out of scope**: restyling the admin app or the website, sharing tokens with them at build time, changing any docs prose beyond the landing page and the new theme page.
