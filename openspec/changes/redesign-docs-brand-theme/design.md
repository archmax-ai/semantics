## Context

See proposal.md for motivation. Current state that shapes the approach:

- `apps/docs` runs Starlight 0.42 on Astro 7. Theming today is one 330-line `custom.css` with hex values plus a `SiteTitle.astro` override. Fonts sit in `apps/docs/public/fonts`.
- The website (`archmax_website`, Next 16 + Tailwind 4) defines its identity as HSL triplets in `globals.css` (`--background: 0 0% 96%`, `--card: 0 0% 100%`, dark `0 0% 12%` / `0 0% 4%`, `--primary` black in light and `257 17% 72%` in dark, `--ring: 257 17% 55%`) and a seven-stop ci-palette gradient (`#8c987f … #c2d0e4`). Its AGENTS.md rules: pure black/white/grey with no accent color, semibold max, `rounded-xl` surfaces without border or shadow, "background contrast → spacing → borders", 16 px minimum.
- The admin app (`apps/frontend/src/globals.css`) uses the same palette in OKLCH and ships a dark variant of the gradient (`#3b4035 … #515760`).
- Starlight's built-in theme is driven by `--sl-color-*` variables with an inverted gray scale between light and dark, and its plugin API (`config:setup` → `updateConfig({ customCss, components })`, `addIntegration`) lets a package inject stylesheets and component overrides. Overridable components include `Hero`, `Header`, `Footer`, `SiteTitle`, `Sidebar`, `Pagination`, `PageTitle`.
- A second Starlight docs site already exists: the Pangea SDK docs in `archmax-ai/harness` (`docs/`, Starlight 0.42, Astro 7, npm not pnpm, GitHub Pages under `/harness`), styled only with a content-width tweak. It cannot install a subdirectory of this monorepo as a dependency, so the theme has to be a published package. The org already publishes `@archmax-ai/harness` to npm, so the scope and publishing setup exist.

## Goals / Non-Goals

**Goals:**

- Docs read as the same product family as archmax.ai on first glance: hero, surfaces, buttons, footer.
- One place holds brand values, and that place is copy-identical to the website's token block so drift is visible in a diff.
- The theme is a dependency, not a folder: `plugins: [archmaxTheme({...})]`.
- Plain CSS only, no Tailwind in the docs.

**Non-Goals:**

- Publishing to npm in this change (the package is shaped for it; publishing is a follow-up).
- Sharing tokens with the admin app or the website at build time (they keep their own copies for now).
- Restyling Expressive Code syntax colors beyond frame and background.
- Localizing the docs.

## Decisions

### D1: Theme as a Starlight plugin in its own repository, installed from Git tags

`@archmax-ai/starlight-theme`, developed in the public repository `archmax-ai/starlight-theme` and installed as `github:archmax-ai/starlight-theme#v<version>`, exports `archmaxTheme(options)` returning a `StarlightPlugin`. In `config:setup` it prepends its three stylesheets to `customCss` (so consumer CSS wins) and fills `components` for `SiteTitle`, `Hero`, `Header`, `Footer` unless the consumer already set that slot. Options are passed to the components through a virtual module registered by a small Astro integration via `addIntegration` (the same mechanism Starlight uses for `virtual:starlight/user-config`).

Alternatives: keep everything in `apps/docs` (cheapest, zero reuse); a workspace package inside this monorepo (works for semantics only, `harness` cannot consume it); a git subtree/copy into other repos (drifts immediately); a shared Astro "layout" package without the plugin API (consumers still wire CSS and components by hand). The plugin is the Starlight-native way and is what published themes (`starlight-theme-*`) do.

**Two-step development path.** Iterating against the real docs site is far faster than a publish-and-bump loop, so the package is first scaffolded here as `packages/starlight-theme` (workspace dependency) and built to completion on this branch. Once screenshots match, its history is extracted with `git subtree split --prefix packages/starlight-theme`, pushed to the new repository, tagged `v0.1.0`, and `apps/docs` switches to the Git tag dependency; the workspace copy is deleted before merge. The package is written from the start with no imports from other workspace packages so the split is mechanical.

**Repository scope.** The repository is named for what it is, `starlight-theme`, but the brand layer (`styles/tokens.css`, fonts, later the logo SVGs) is kept in a `brand/` subfolder with no Starlight references so it can be exported separately (`@archmax-ai/starlight-theme/brand/tokens.css`) or moved into a broader `archmax-ai/brand` repository later if the website or the admin app start consuming it. Astro stays: both docs sites are on Starlight, the static output and Pagefind search fit GitHub Pages, and moving to a Next.js docs framework to share React components with the website would cost two migrations for a benefit the token layer already provides.

### D2: Two CSS layers with website-identical names

- `styles/tokens.css`: `:root` and `:root[data-theme="dark"]` blocks that reproduce the website's `globals.css` values verbatim as HSL triplets (`--background: 0 0% 96%` …), the `--gradient-1..7` stops (light) and the frontend's dark stops, `--radius: 0.625rem`, plus the `@font-face` rules (font files ship inside the package and are referenced relatively, so Vite hashes and serves them; the `public/fonts` copy in `apps/docs` is deleted).
- `styles/starlight.css`: maps `--sl-*` from `hsl(var(--…))`. Light: `--sl-color-black: hsl(var(--background))` (page), `--sl-color-gray-6/7: hsl(var(--card))` (code/sidebar surfaces), `--sl-color-gray-5: hsl(var(--border))`, `--sl-color-gray-2/3: hsl(var(--muted-foreground))`, `--sl-color-white: hsl(var(--foreground))`, `--sl-color-text-accent: hsl(var(--accent-foreground))` for links, `--sl-color-bg-nav`/`--sl-color-bg-sidebar: hsl(var(--background))`. Dark: analogous with the dark triplets. Expressive Code gets `codeBackground: var(--sl-color-gray-6)` and `borderWidth: 0`.
- `styles/components.css`: chrome rules (sidebar pills, no tree lines, no title rule, pagination surfaces, asides, screenshot grid, search pill).

Why HSL triplets instead of the current hex: they can be pasted from and diffed against the website file, and the admin app can later adopt the same file. Why not OKLCH like the frontend: the website is the brand source and uses HSL.

### D3: Monochrome CTAs, purple only on links

Starlight's `variant: primary` hero button uses `--sl-color-text-accent`. Rather than fight it with `!important`, the custom `Hero` renders its own action markup with classes `.hero-action--primary` (`hsl(var(--primary))` / `hsl(var(--primary-foreground))`) and `.hero-action--secondary` (`color-mix(in srgb, hsl(var(--foreground)) 8%, transparent)`), matching the website `Button` `default` and `outline` variants. Content links keep the purple through `--sl-color-text-accent`. The TOC active item keeps it too (Starlight uses the same variable), which the website's "no accent" rule tolerates because the earlier spec already reserved purple for "links, active highlights, focus".

### D4: Full-bleed hero via component override, not PageFrame

`Hero.astro` wraps its content in a section with `margin-inline: calc(50% - 50vw); width: 100vw` so it escapes Starlight's content column without touching `PageFrame`. Light mode uses the website gradient with black text (`text-black`, `black/55` eyebrow, `black/70` subtitle, exactly the website's opacities); dark mode swaps to the frontend's dark gradient with `--foreground` text. Animation is the website's `flow` keyframes at 40 s, wrapped in `@media (prefers-reduced-motion: no-preference)`. Eyebrow text is the page's `hero.tagline`-adjacent field: the component reads `hero.title` for the headline and the page `description` for the subtitle, and a new optional frontmatter key is avoided by using the Starlight `hero.tagline` for the eyebrow and `hero.title` for the headline (the current landing page puts the sentence in `tagline`; it moves to `title`).

Alternative considered: keep Starlight's hero and only restyle it. Rejected: its markup has no eyebrow slot and its actions are hard-wired to accent colors.

### D5: Footer replaces Starlight's footer but keeps its slots

`Footer.astro` renders the dark block (`.dark`-equivalent tokens applied locally by setting the dark triplets on the footer element, the same trick the website uses with `className="dark"`) and includes Starlight's `EditLink`, `LastUpdated`, and `Pagination` above it so nothing is lost. Links come from plugin options; defaults point to archmax.ai, its `/imprint` and `/privacy` pages, and the semantics repo.

### D6: Header keeps Starlight's header, adds a nav link

`Header.astro` reuses Starlight's `SiteTitle`, `Search`, `SocialIcons`, `ThemeSelect` and inserts an "archmax.ai ↗" link styled like the website nav items (`px-3 py-1.5 rounded-full text-muted-foreground hover:bg-muted/70`, hand-written CSS). Frost effect stays (`backdrop-filter: blur(12px)`, `background/80`), the same values the website applies once scrolled.

### D7: Landing content stays MDX in `apps/docs`

Feature cards use Starlight's `Card`/`CardGrid` with theme CSS (icon chip `rounded-full bg-muted`, muted-foreground icon, no colored icon backgrounds; the ci palette is reserved for the gradient). The "Four steps" strip is a small ordered list with `.steps-strip` classes defined in `components.css`, no new component. Screenshot `<figure>` markup stays; CSS gives each figure a card surface with `0.75rem` radius and `0.5rem` padding.

### D8: Package tooling and release

**No npm, no build step.** Consumers install the package straight from GitHub (`github:archmax-ai/starlight-theme#v0.1.0`), which both pnpm (semantics) and npm (harness) support and which records the exact commit in the lockfile. A Git install has to work from the bare clone, so the plugin entry is plain ESM JavaScript (`index.js`, typed with JSDoc) with a hand-written `index.d.ts`; the `.astro` components, CSS, and fonts ship as source anyway. `package.json`: name `@archmax-ai/starlight-theme`, `"type": "module"`, `exports` for `.`, `./components/*`, `./styles/*`, and `./brand/*`, `peerDependencies` on `@astrojs/starlight ^0.42` and `astro ^7`, scripts `typecheck` (`tsc --noEmit` with `checkJs`) and `test` (Vitest for the plugin function). `astro check` is not run: it would add `@astrojs/check` and its language server to the dev dependencies for four components that `astro build` of a consumer already compiles.

Releases are annotated Git tags (`v0.1.0`) with semver; a `ci.yml` runs typecheck and tests on push and pull request. Renovate updates GitHub tag dependencies, so consumers get bump PRs as with npm. Starlight minor bumps are the expected release trigger; the peer range is widened only after the theme's selectors are re-verified. npm publishing stays possible later by adding a release workflow; nothing in the package layout prevents it. The repository is public so consumers install without credentials, even though some consumers (harness) are private.

Alternatives: npm publish (needs an npm token, a release workflow, and an npm account nobody is logged into; buys provenance and a version list the team does not need); GitHub Packages (requires auth even for public reads); a monorepo subpath Git dependency (pnpm only, harness uses npm).

## Risks / Trade-offs

- [Starlight internal class names change between minor versions and break `components.css` selectors] → pin `@astrojs/starlight` peer range to `^0.42`, capture before/after screenshots in the PR, and re-shoot on Starlight bumps (Renovate already opens those PRs).
- [Full-bleed hero via `100vw` causes a horizontal scrollbar when a vertical scrollbar is present] → set `overflow-x: clip` on the hero's parent and use `calc(50% - 50vw)` margins, verify in Chromium and Safari.
- [Grey page + white code blocks reduce contrast for inline code inside cards] → inline code inside `.card` uses `hsl(var(--muted))` background; check the landing cards and asides.
- [Black text on the gradient fails contrast on the lightest stop (`#c2d0e4`)] → the website ships this combination already; keep `text-black` at full opacity for the headline and verify the eyebrow at `black/55` stays above 4.5:1 on the lightest stop, otherwise raise to `black/65`.
- [Removing the purple CTA makes "Get Started" less prominent] → black pill on a gradient is the website's own hero pattern and is higher contrast than the current purple.
- [Component override precedence: consumer overrides must win] → plugin only fills a `components` slot when the consumer config leaves it unset, with a unit test on the plugin function.
- [Legal footer links point to another domain] → acceptable; the website owns imprint and privacy text. If the docs later collect analytics, a docs-specific privacy note is needed.

## Migration Plan

1. Develop the theme as `packages/starlight-theme` on this branch and switch `apps/docs` to the plugin; delete `custom.css`, `SiteTitle.astro`, and `public/fonts`.
2. Build with `pnpm --filter @archmax/docs build`, shoot light/dark screenshots of the landing page, a guide, and a reference page with the Playwright Chromium already installed for `apps/e2e`, and attach them to the PR next to the current ones.
3. Create the public repository `archmax-ai/starlight-theme`, push the `git subtree split` result, add the CI workflow, tag `v0.1.0`.
4. Replace the workspace dependency with `github:archmax-ai/starlight-theme#v0.1.0`, delete `packages/starlight-theme` from this repo, rebuild, and confirm the screenshots are unchanged.
5. Merge; deploy happens through the existing `docs.yml`. Rollback is a revert of the PR; no data or URLs change.
6. Follow-up PR in `archmax-ai/harness`: add the dependency, replace `customCss` with the plugin, set `product: "Pangea SDK"` and its GitHub link.

## Open Questions

- Whether the repository should be named `starlight-theme` or `brand` from day one. Default is `starlight-theme` with a `brand/` subfolder; renaming a GitHub repository later redirects, so this can be revisited without breaking consumers.
- Whether to keep the colored icon chips (sage/rose/blue/purple) on the landing cards as a nod to the graph view, or follow the website's muted chips strictly. Default is the website pattern; can be flipped with one CSS rule.
