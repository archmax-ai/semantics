## 1. Theme package scaffold

- [x] 1.1 Scaffold `packages/starlight-theme` as a temporary workspace package with `package.json` (`@archmax-ai/starlight-theme`, ESM, `exports` for `.`, `./components/*`, `./styles/*`, and `./brand/*`, peer deps on `@astrojs/starlight ^0.42` and `astro ^7`, `typecheck` and `test` scripts, no build step), `tsconfig.json`, and `README.md` with install instructions; verify `pnpm install` links it, `pnpm typecheck` runs it, and it imports nothing from other workspace packages.
- [x] 1.2 Implement `index.js` (plain ESM with JSDoc types, `index.d.ts` beside it) exporting `archmaxTheme(options)` as a Starlight plugin that prepends the three stylesheets to `customCss`, fills unset `components` slots, and registers a virtual module with the options via `addIntegration`; verify with a Vitest unit test that consumer `customCss` comes last and consumer `components` are not overwritten.
- [x] 1.3 Move `Geist-Variable.woff2` and `GeistMono-Variable.woff2` into `packages/starlight-theme/brand/fonts/` and delete `apps/docs/public/fonts/`; verify the built site requests the fonts from its own origin only.

## 2. Token and mapping stylesheets

- [x] 2.1 Write `brand/tokens.css` with the website's HSL triplets for light and dark, the seven light gradient stops and the seven dark stops, `--radius`, and the `@font-face` rules using relative font URLs; verify by diffing the token block against `archmax_website/src/app/globals.css` with zero value differences.
- [x] 2.2 Write `styles/starlight.css` mapping every `--sl-color-*`, `--sl-font*`, and `--sl-line-height` from the brand tokens for both themes, and set Expressive Code `codeBackground` and `borderWidth: 0` through the plugin; verify in the built site that light page background computes to `rgb(245, 245, 245)` and code block background to white, and dark to `rgb(31, 31, 31)` / `rgb(10, 10, 10)`.
- [x] 2.3 Write `styles/components.css` for sidebar (no tree lines, pill hover and active, semibold group labels), removed title rule, borderless pagination surfaces, search pill, asides, inline code inside cards, screenshot grid card surfaces, and the steps strip; verify each rule visually in light and dark screenshots and confirm no `border` remains on cards, code blocks, pagination, or figures via DevTools.

## 3. Component overrides

- [x] 3.1 Port `SiteTitle.astro` into the package reading product name and version from the plugin options with `APP_VERSION` and `"dev"` fallbacks; verify the header shows "archmax semantics vdev" locally and "v<tag>" when `APP_VERSION` is set.
- [x] 3.2 Implement `Hero.astro`: full-bleed section, gradient background (light stops with black text, dark stops with foreground text), mono `// ` eyebrow from `hero.tagline`, semibold headline from `hero.title`, subtitle from page description, primary and secondary pill actions, reduced-motion guard; verify no horizontal scrollbar at 1440 px and 390 px widths and that the animation stops under emulated reduced motion.
- [x] 3.3 Implement `Footer.astro`: Starlight `EditLink`, `LastUpdated`, `Pagination` above a dark block with wordmark, tagline, Website / GitHub / Imprint / Privacy links from options, ci-palette dots, mono copyright with current year; verify it renders on a content page and on the splash page and that "Edit page" still works.
- [x] 3.4 Implement `Header.astro` reusing Starlight's title, search, social icons, and theme select, adding the pill "archmax.ai" link and the frost background; verify keyboard focus order and that the mobile menu toggle still works.

## 4. Wire the docs site

- [x] 4.1 Add `"@archmax-ai/starlight-theme": "workspace:*"` to `apps/docs/package.json`, replace `customCss` and `components` in `astro.config.mjs` with `plugins: [archmaxTheme({ product: "semantics", links: {...} }), starlightImageZoom()]`, and delete `apps/docs/src/styles/custom.css` and `apps/docs/src/components/SiteTitle.astro`; verify `pnpm --filter @archmax/docs build` exits 0 with 33 pages.
- [x] 4.2 Update `apps/docs/src/content/docs/index.mdx`: eyebrow in `hero.tagline`, sentence headline in `hero.title`, actions unchanged, feature cards with muted icon chips, new "Four steps" strip linking to Semantic Models, Testing, MCP Integration, and Data Federation, screenshot figures unchanged in markup; verify every link resolves in the built site.
- [x] 4.3 Add `openspec/config.yaml` context notes for docs theming (token layers live in the package, no hex in `apps/docs`, borderless surfaces, semibold cap); verify `openspec validate redesign-docs-brand-theme --strict` still passes.

## 5. Split into its own repository and publish

- [x] 5.1 Create the public GitHub repository `archmax-ai/starlight-theme`, extract the package with `git subtree split --prefix packages/starlight-theme` and push it as `main`; verify the new repo passes standalone with `npm install && npm run typecheck && npm test`.
- [x] 5.2 Add `ci.yml` (typecheck and test on push and pull request) to the theme repo, modelled on `archmax-ai/harness`; verify the workflow file is valid and the first run is green.
- [x] 5.3 Tag `v0.1.0` on the theme repo's `main` and push the tag; verify `git ls-remote --tags` lists it.
- [x] 5.4 Replace the workspace dependency in `apps/docs/package.json` with `github:archmax-ai/starlight-theme#v0.1.0`, delete `packages/starlight-theme` and its Vitest project from this monorepo, run `pnpm install`, and rebuild; verify the built site's screenshots are pixel-identical to the workspace build.
- [x] 5.5 Write a hand-off note (issue in `archmax-ai/harness`) with the exact `astro.config.mjs` diff for adopting the theme in the Pangea SDK docs; verify the issue links to the theme repository README.

## 6. Verification and documentation

- [ ] 6.1 Capture light and dark screenshots of the landing page, `guides/semantic-models`, and `reference/mcp-tools` from the built site with the Playwright Chromium in `apps/e2e` and attach before/after pairs to the PR; verify visually against archmax.ai: grey page with white surfaces, black pill CTA, no tree lines, no title rule, dark footer present.
- [x] 6.2 Run `pnpm typecheck && pnpm lint` from the root and confirm both exit 0 with the workspace package removed and the npm dependency in place.
- [x] 6.3 Add `apps/docs/src/content/docs/contributing/docs-theme.mdx` ("Docs theme": link to the theme repository, token layers, where to change a value, plugin options, how another archmax project installs the published package) and register it in the Contributing sidebar; verify the page appears in the sidebar and in Pagefind search in the built site.
- [x] 6.4 Check README.md for statements about docs styling or fonts location and align them if any exist; verify with a grep for `public/fonts` and `custom.css` returning nothing.
