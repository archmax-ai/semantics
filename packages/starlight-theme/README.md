# @archmax-ai/starlight-theme

The archmax brand theme for [Astro Starlight](https://starlight.astro.build) documentation sites: brand tokens, Geist fonts, borderless surfaces, pill navigation, the ci-palette gradient hero, and the archmax footer. One plugin entry gives a Starlight site the same identity as [archmax.ai](https://archmax.ai).

## Install

The package is installed straight from this repository, pinned to a release tag. It is not published to npm.

```bash
npm install github:archmax-ai/starlight-theme#v0.1.0
# or
pnpm add github:archmax-ai/starlight-theme#v0.1.0
```

Peer dependencies: `@astrojs/starlight ^0.42` and `astro ^7`. There is no build step: the plugin entry is plain JavaScript and the components, styles, and fonts ship as source.

## Use

```js
// astro.config.mjs
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { archmaxTheme } from "@archmax-ai/starlight-theme";

export default defineConfig({
  integrations: [
    starlight({
      title: "My product",
      plugins: [
        archmaxTheme({
          product: "my-product",
          links: { github: "https://github.com/archmax-ai/my-product" },
        }),
      ],
    }),
  ],
});
```

Remove any `customCss` or `components` entries the theme now provides. Anything you keep is loaded after the theme, so your rules win, and a component slot you set yourself is never overwritten.

## Options

| Option | Default | Purpose |
| --- | --- | --- |
| `product` | none | Product name next to the archmax wordmark in the header and footer |
| `version` | `APP_VERSION` env, then `"dev"` | Text of the version badge in the header |
| `tagline` | archmax tagline | Line under the wordmark in the footer |
| `links.website` | `https://archmax.ai` | Header link and footer link |
| `links.github` | Starlight `social` GitHub entry | Footer link |
| `links.imprint` | `https://archmax.ai/imprint` | Footer legal link |
| `links.privacy` | `https://archmax.ai/privacy` | Footer legal link |
| `copyrightHolder` | `"archmax"` | Name in the footer copyright line |

## Landing page hero

Pages with `template: splash` and a `hero` block render the gradient hero:

```yaml
hero:
  tagline: Documentation            # monospace eyebrow, rendered as "// Documentation"
  title: A semantic layer for your data.
  actions:
    - text: Get Started
      link: /getting-started/
      icon: right-arrow
      variant: primary              # black pill (light), light pill (dark)
    - text: GitHub
      link: https://github.com/archmax-ai/semantics
      icon: external
      variant: minimal              # translucent pill
```

The page `description` becomes the hero subtitle. The gradient animation stops under `prefers-reduced-motion`.

Two utility classes ship with the theme for landing pages: `.screenshot-grid` (a grid of `<figure>` elements on card surfaces) and `.steps-strip` (a numbered `<ol>` of linked cards).

## How the CSS is layered

- `brand/tokens.css`: the archmax design tokens as HSL triplets with the same names and values as the website (`--background`, `--foreground`, `--card`, `--muted`, `--border`, `--primary`, `--accent`, `--ring`, `--radius`), the ci-palette, gradient stops, and the Geist font faces. No Starlight selectors, so it can be used on its own: `import "@archmax-ai/starlight-theme/brand/tokens.css"`.
- `styles/starlight.css`: maps every Starlight `--sl-*` variable onto the brand tokens.
- `styles/components.css`: Starlight chrome (sidebar, header, cards, pagination, asides, code, gallery, steps).

To change a brand value, edit `brand/tokens.css` only. Everything else derives from it.

## Development

```bash
npm install
npm run typecheck
npm test
```

Releases are Git tags following semver (`v0.1.0`). Bump `version` in `package.json`, tag the commit, push the tag, then bump the pinned tag in each consuming site. The `@astrojs/starlight` peer range is widened only after the theme's selectors have been checked against the new Starlight version.

## License

MIT
