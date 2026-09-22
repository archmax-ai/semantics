import { describe, expect, it } from "vitest";
import {
  THEME_COMPONENTS,
  THEME_CSS,
  applyThemeConfig,
  archmaxTheme,
  resolveOptions,
} from "./index.js";

describe("applyThemeConfig", () => {
  it("loads theme CSS before the consumer's custom CSS", () => {
    const update = applyThemeConfig({ title: "Docs", customCss: ["./src/custom.css"] });
    expect(update.customCss).toEqual([...THEME_CSS, "./src/custom.css"]);
  });

  it("fills component slots without overwriting consumer overrides", () => {
    const update = applyThemeConfig({
      title: "Docs",
      components: { SiteTitle: "./src/MyTitle.astro" },
    });
    expect(update.components).toMatchObject({
      SiteTitle: "./src/MyTitle.astro",
      Hero: THEME_COMPONENTS.Hero,
      Header: THEME_COMPONENTS.Header,
      Footer: THEME_COMPONENTS.Footer,
    });
  });

  it("keeps Expressive Code disabled when the consumer disabled it", () => {
    expect(applyThemeConfig({ title: "Docs", expressiveCode: false }).expressiveCode).toBe(false);
  });

  it("lets consumer style overrides win over theme defaults", () => {
    const update = applyThemeConfig({
      title: "Docs",
      expressiveCode: {
        themes: ["github-dark"],
        styleOverrides: { borderRadius: "0", frames: { shadowColor: "red" } },
      },
    });
    expect(update.expressiveCode).toMatchObject({
      themes: ["github-dark"],
      styleOverrides: {
        borderRadius: "0",
        borderWidth: "0px",
        frames: { shadowColor: "red", editorTabBarBackground: "var(--sl-color-gray-6)" },
      },
    });
  });
});

describe("resolveOptions", () => {
  it("falls back to dev when neither option nor APP_VERSION is set", () => {
    expect(resolveOptions({}, {}, {}).version).toBe("dev");
  });

  it("reads APP_VERSION from the environment", () => {
    expect(resolveOptions({}, {}, { APP_VERSION: "0.4.0" }).version).toBe("0.4.0");
  });

  it("prefers an explicit version over the environment", () => {
    expect(resolveOptions({ version: "1.2.3" }, {}, { APP_VERSION: "0.4.0" }).version).toBe("1.2.3");
  });

  it("derives the GitHub link from the Starlight social config", () => {
    const resolved = resolveOptions(
      {},
      { social: [{ icon: "github", label: "GitHub", href: "https://github.com/archmax-ai/x" }] },
      {},
    );
    expect(resolved.links.github).toBe("https://github.com/archmax-ai/x");
  });

  it("uses archmax.ai defaults for website and legal links", () => {
    const { links } = resolveOptions({}, {}, {});
    expect(links).toMatchObject({
      website: "https://archmax.ai",
      imprint: "https://archmax.ai/imprint",
      privacy: "https://archmax.ai/privacy",
    });
  });
});

describe("archmaxTheme", () => {
  it("returns a Starlight plugin with a config:setup hook", () => {
    const plugin = archmaxTheme({ product: "semantics" });
    expect(plugin.name).toBe("@archmax-ai/starlight-theme");
    expect(typeof plugin.hooks["config:setup"]).toBe("function");
  });
});
