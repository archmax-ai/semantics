## MODIFIED Requirements

### Requirement: Brand-Consistent Theming

The documentation site SHALL use color tokens, typography, and visual treatments consistent with the archmax marketing website, sourced from the `@archmax-ai/starlight-theme` package (pinned to a release tag of its repository) rather than a site-local stylesheet.

The surface model MUST follow the website: the page background is grey and content surfaces (cards, code blocks, pagination cards, screenshot frames) are plain white in light mode; in dark mode the page is dark grey (`0 0% 12%`) and content surfaces are near black (`0 0% 4%`).

Interactive color MUST be monochrome by default: primary calls to action use the brand `--primary` (black in light mode, light in dark mode) and secondary calls to action use a translucent foreground fill. The 257° purple accent MUST appear only on inline content links, the active table-of-contents entry, and focus rings.

The gray scale MUST be pure neutral (hue 0°) with no color tint.

#### Scenario: Neutral grays in light mode

- **WHEN** a user views the documentation site in light mode
- **THEN** the page background is `hsl(0 0% 96%)`, text is `hsl(0 0% 8%)`, and cards and code blocks are white
- **AND** cards are distinguishable from the page without a border

#### Scenario: Neutral grays in dark mode

- **WHEN** a user views the documentation site in dark mode
- **THEN** the page background is `hsl(0 0% 12%)`, text is `hsl(0 0% 95%)`, and cards and code blocks are `hsl(0 0% 4%)`

#### Scenario: Monochrome calls to action

- **WHEN** a user views the landing page in light mode
- **THEN** the primary action is a black pill with white text and the secondary action is a translucent dark pill
- **AND** no button uses the purple accent

#### Scenario: Purple accent on interactive elements only

- **WHEN** a user views any page
- **THEN** the 257° purple appears only on inline content links, the active table-of-contents entry, and focus rings

### Requirement: Borderless Cards and Code Blocks

Cards, code blocks, pagination cards, asides, and screenshot frames SHALL have no visible border. Separation MUST come from background contrast first and spacing second, matching the website's borderless surface rule. The horizontal rule Starlight draws under the page title MUST be removed.

Code blocks and cards MUST use `border-radius: 0.75rem`.

#### Scenario: Cards are borderless with white background

- **WHEN** a user views a page with card components
- **THEN** cards have no border, a `0.75rem` radius, and a white (light) or near-black (dark) background

#### Scenario: Code blocks are borderless with rounded corners

- **WHEN** a user views a page with code blocks
- **THEN** code blocks have no border, `border-radius: 0.75rem`, and the content-surface background

#### Scenario: Screenshots without frame border

- **WHEN** a user views the landing page screenshot gallery
- **THEN** each screenshot sits on a rounded content surface with padding and no 1 px border

#### Scenario: No rule under the page title

- **WHEN** a user views any content page
- **THEN** there is no horizontal line between the title and the first paragraph

### Requirement: Sidebar Active State

The sidebar SHALL follow the website's navigation pattern: no vertical tree lines on nested items, semibold group labels, and pill-shaped hover and active states. The active item MUST use the brand `--muted` background with foreground text and `border-radius: 9999px`; hovered items MUST use a translucent foreground fill with the same radius.

#### Scenario: Active sidebar item has pill shape

- **WHEN** a user is on a documentation page
- **THEN** the corresponding sidebar link has the muted background, foreground text, and `border-radius: 9999px`

#### Scenario: No tree lines

- **WHEN** a user views a sidebar group with nested items
- **THEN** no vertical guide line is drawn along the nested items

## ADDED Requirements

### Requirement: Landing Page Hero

The landing page SHALL use the theme's hero: full-bleed ci-palette gradient, a monospace `// Documentation` eyebrow, the product tagline as a semibold headline, and two pill actions ("Get Started" primary, "View on GitHub" secondary). Below the hero the page MUST show feature cards as white surfaces with a muted round icon chip, a "Four steps" strip (Describe, Test, Deploy, Query) whose steps link to the matching guides, the screenshot gallery on content surfaces, and the existing product overview table.

#### Scenario: Landing page matches the website hero

- **WHEN** a user opens the documentation root
- **THEN** the first screen shows the gradient hero with the eyebrow, headline, and two pill actions
- **AND** the primary action leads to the installation page

#### Scenario: Four steps link to guides

- **WHEN** a user clicks a step in the "Four steps" strip
- **THEN** they land on the guide for that step (Semantic Models, Testing, MCP Integration, Data Federation or MCP Tools)

### Requirement: Brand Footer

Every documentation page SHALL end with the theme's dark footer showing the archmax wordmark, the tagline "The open-source semantic layer for powerful AI agents", links to archmax.ai, the GitHub repository, the website's imprint page, and the website's privacy page, the ci-palette dots, and a monospace copyright line.

#### Scenario: Legal links reachable from the docs

- **WHEN** a user scrolls to the bottom of any documentation page
- **THEN** they find working "Imprint" and "Privacy" links

### Requirement: Typography Weight Cap

The documentation site SHALL use Geist Sans with a maximum font weight of 600 for all text, including page titles and the hero headline, `letter-spacing: -0.025em` on headings, and Geist Mono for eyebrows, the version badge, and footer meta text. Body text MUST be at least 16 px.

#### Scenario: No bold weights

- **WHEN** a user inspects any heading on the site
- **THEN** its computed font weight is 600 or lower

### Requirement: Theme Documentation

The Contributing section SHALL include a "Docs theme" page describing the two token layers, where to change a brand value, how the plugin options work, and how another archmax project adds the theme to its Starlight site.

#### Scenario: Contributor finds theming guidance

- **WHEN** a contributor wants to change a docs color or start a new archmax docs site
- **THEN** the Contributing section tells them which file holds the brand tokens and how to install the plugin
