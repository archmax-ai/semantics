## Purpose

A reusable Starlight theme plugin that gives any archmax documentation site the archmax.ai visual identity (tokens, fonts, chrome, landing page) from a single dependency.

## ADDED Requirements

### Requirement: Theme Plugin Package

The archmax GitHub organization SHALL provide a package `@archmax-ai/starlight-theme`, maintained in its own public repository and installable directly from a Git tag, that exports a Starlight plugin. The package MUST be installable by any archmax repository regardless of its package manager, MUST work without a build step after a plain checkout, and MUST NOT import from any package private to the semantics monorepo. Installing the plugin MUST be sufficient to apply the full archmax theme to a Starlight site: brand tokens, Starlight variable mapping, self-hosted Geist Sans and Geist Mono, and the component overrides for the site title, hero, header, and footer. The plugin MUST NOT require the consuming site to add Tailwind or any other CSS framework.

#### Scenario: Site adopts the theme with one plugin entry

- **WHEN** a Starlight site lists the plugin in its `plugins` array and has no `customCss` or `components` of its own
- **THEN** every page renders with the archmax tokens, Geist fonts, pill sidebar states, borderless surfaces, and the archmax footer
- **AND** no font request leaves the site's own origin

#### Scenario: Consumer can still add its own overrides

- **WHEN** a consuming site defines `customCss` or `components` entries of its own
- **THEN** the theme's CSS is loaded before the site's CSS so the site's rules win
- **AND** a component override in the site config takes precedence over the theme's override for the same slot

### Requirement: Plugin Options

The plugin SHALL accept options for the product name shown next to the wordmark, the version string shown in the badge, and the footer links (website, repository, imprint, privacy). Every option MUST have a default so the plugin works with no options.

#### Scenario: Product name and version rendered

- **WHEN** the plugin is configured with `product: "semantics"` and `version: "0.4.0"`
- **THEN** the header shows the archmax wordmark, the text "semantics", and a badge reading "v0.4.0"

#### Scenario: Version omitted

- **WHEN** no version is passed and the `APP_VERSION` environment variable is unset at build time
- **THEN** the badge reads "dev"

#### Scenario: Footer links configured

- **WHEN** the plugin is configured with an imprint URL and a privacy URL
- **THEN** the footer renders "Imprint" and "Privacy" links pointing to those URLs

### Requirement: Two-Layer Token Model

The theme's CSS SHALL be split into a brand layer and a framework layer. The brand layer MUST define the archmax design tokens as CSS custom properties with the same names and HSL values as the archmax website (`--background`, `--foreground`, `--card`, `--card-foreground`, `--muted`, `--muted-foreground`, `--border`, `--primary`, `--primary-foreground`, `--accent`, `--accent-foreground`, `--ring`, `--radius`) for light and dark mode, plus the seven ci-palette gradient stops. The framework layer MUST derive every Starlight `--sl-*` variable it sets from the brand layer and MUST NOT introduce hard-coded colors of its own, except for the semantic aside tints.

#### Scenario: Changing a brand value propagates

- **WHEN** a maintainer changes `--background` in the brand layer
- **THEN** the page background, sidebar background, and header background all change together
- **AND** no Starlight mapping rule needs editing

#### Scenario: Brand layer is portable

- **WHEN** the brand layer stylesheet is loaded on a page without Starlight
- **THEN** it defines only custom properties and `@font-face` rules and does not select any Starlight class

### Requirement: Landing Hero Component

The theme SHALL override Starlight's `Hero` component. The hero MUST span the full viewport width, render the animated ci-palette gradient background, show a monospace eyebrow prefixed with `// `, a semibold headline with tight letter spacing, an optional subtitle, and pill-shaped actions. The primary action MUST use the brand `--primary` colors (black on light, light on dark); secondary actions MUST use a translucent foreground fill. The gradient animation MUST be disabled when the visitor prefers reduced motion.

#### Scenario: Hero renders on the landing page

- **WHEN** a page uses `template: splash` with `hero` frontmatter
- **THEN** the hero fills the viewport width edge to edge above the content column
- **AND** the eyebrow, title, tagline, and actions are readable as black text on the gradient in light mode and light text on the dark gradient in dark mode

#### Scenario: Reduced motion respected

- **WHEN** the visitor's system has `prefers-reduced-motion: reduce`
- **THEN** the gradient is static and no animation runs

### Requirement: Footer Component

The theme SHALL override Starlight's `Footer` component with a dark footer that shows the archmax wordmark, the product tagline, the configured links, the seven ci-palette dots, and a monospace copyright line with the current year. The footer MUST keep Starlight's edit link and last-updated information when the consuming site enables them. The footer MUST NOT use borders; separation comes from background contrast.

#### Scenario: Footer on every page

- **WHEN** any documentation page renders
- **THEN** the dark footer appears below the content with wordmark, links, palette dots, and copyright
- **AND** the "Edit page" link remains available when `editLink` is configured

### Requirement: Versioned Releases

The package SHALL be released as semantic-version Git tags (`v<major>.<minor>.<patch>`) and MUST declare a peer dependency range on `@astrojs/starlight` that it has been verified against. Consuming sites MUST pin a tag rather than a branch.

#### Scenario: Consumer pins a release

- **WHEN** a consuming site installs the theme
- **THEN** its lockfile records the commit of a `v*` tag of `archmax-ai/starlight-theme`
- **AND** installing a Starlight version outside the declared peer range produces a peer dependency warning

#### Scenario: Package CI

- **WHEN** a change is pushed to the theme repository
- **THEN** typecheck and the plugin unit tests run and must pass before a release tag is created

### Requirement: Portable Brand Layer

The package SHALL expose the brand layer (tokens and fonts) as a separate entry point that contains no Starlight-specific rules, so non-Starlight sites can consume the tokens alone.

#### Scenario: Brand entry point without Starlight

- **WHEN** a site imports only the brand entry point
- **THEN** it receives the custom properties, gradient stops, and `@font-face` rules and no rule that selects a Starlight class
