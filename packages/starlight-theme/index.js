/**
 * @typedef {import("./index.d.ts").ArchmaxThemeOptions} ArchmaxThemeOptions
 * @typedef {import("./index.d.ts").ResolvedArchmaxThemeOptions} ResolvedArchmaxThemeOptions
 * @typedef {import("./index.d.ts").UserConfig} UserConfig
 * @typedef {import("./index.d.ts").ConfigUpdate} ConfigUpdate
 * @typedef {import("@astrojs/starlight/types").StarlightPlugin} StarlightPlugin
 * @typedef {import("astro").AstroIntegration} AstroIntegration
 */

export const PACKAGE_NAME = "@archmax-ai/starlight-theme";
export const VIRTUAL_MODULE_ID = "virtual:archmax-starlight-theme/options";

export const THEME_CSS = [
  `${PACKAGE_NAME}/brand/tokens.css`,
  `${PACKAGE_NAME}/styles/starlight.css`,
  `${PACKAGE_NAME}/styles/components.css`,
];

export const THEME_COMPONENTS = {
  SiteTitle: `${PACKAGE_NAME}/components/SiteTitle.astro`,
  Header: `${PACKAGE_NAME}/components/Header.astro`,
  Hero: `${PACKAGE_NAME}/components/Hero.astro`,
  Footer: `${PACKAGE_NAME}/components/Footer.astro`,
};

export const THEME_EXPRESSIVE_CODE_STYLES = {
  borderRadius: "0.75rem",
  borderWidth: "0px",
  codeBackground: "var(--sl-color-gray-6)",
  frames: {
    editorTabBarBackground: "var(--sl-color-gray-6)",
    editorActiveTabBackground: "var(--sl-color-gray-6)",
    terminalTitlebarBackground: "var(--sl-color-gray-6)",
    terminalBackground: "var(--sl-color-gray-6)",
    shadowColor: "transparent",
  },
};

const DEFAULTS = {
  website: "https://archmax.ai",
  imprint: "https://archmax.ai/imprint",
  privacy: "https://archmax.ai/privacy",
  tagline: "The open-source semantic layer for powerful AI agents",
  copyrightHolder: "archmax",
};

/**
 * @param {Pick<UserConfig, "social">} config
 * @returns {string | undefined}
 */
function githubFromSocial(config) {
  const social = config.social;
  if (!Array.isArray(social)) return undefined;
  return social.find((entry) => entry.icon === "github")?.href;
}

/**
 * @param {ArchmaxThemeOptions} [options]
 * @param {Pick<UserConfig, "social">} [config]
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {ResolvedArchmaxThemeOptions}
 */
export function resolveOptions(options = {}, config = {}, env = process.env) {
  return {
    product: options.product,
    version: options.version ?? env.APP_VERSION ?? "dev",
    tagline: options.tagline ?? DEFAULTS.tagline,
    links: {
      website: options.links?.website ?? DEFAULTS.website,
      github: options.links?.github ?? githubFromSocial(config),
      imprint: options.links?.imprint ?? DEFAULTS.imprint,
      privacy: options.links?.privacy ?? DEFAULTS.privacy,
    },
    copyrightHolder: options.copyrightHolder ?? DEFAULTS.copyrightHolder,
  };
}

/**
 * @param {UserConfig["expressiveCode"]} userValue
 * @returns {UserConfig["expressiveCode"]}
 */
function mergeExpressiveCode(userValue) {
  if (userValue === false) return false;
  const user = typeof userValue === "object" ? userValue : {};
  /** @type {Record<string, unknown> & { frames?: Record<string, unknown> }} */
  const userStyles = user.styleOverrides ?? {};
  const styleOverrides = {
    ...THEME_EXPRESSIVE_CODE_STYLES,
    ...userStyles,
    frames: { ...THEME_EXPRESSIVE_CODE_STYLES.frames, ...(userStyles.frames ?? {}) },
  };
  return { ...user, styleOverrides };
}

/**
 * Computes the Starlight config update the theme applies. Theme CSS is loaded first so the
 * consuming site's `customCss` wins; component slots the site already set are left untouched.
 *
 * @param {UserConfig} config
 * @returns {ConfigUpdate}
 */
export function applyThemeConfig(config) {
  return {
    customCss: [...THEME_CSS, ...(config.customCss ?? [])],
    components: { ...THEME_COMPONENTS, ...(config.components ?? {}) },
    expressiveCode: mergeExpressiveCode(config.expressiveCode),
  };
}

/** @param {ResolvedArchmaxThemeOptions} resolved */
function vitePluginThemeOptions(resolved) {
  const resolvedVirtualModuleId = `\0${VIRTUAL_MODULE_ID}`;
  return {
    name: "vite-plugin-archmax-starlight-theme",
    /** @param {string} id */
    resolveId(id) {
      return id === VIRTUAL_MODULE_ID ? resolvedVirtualModuleId : undefined;
    },
    /** @param {string} id */
    load(id) {
      return id === resolvedVirtualModuleId
        ? `export default ${JSON.stringify(resolved)};`
        : undefined;
    },
  };
}

/**
 * @param {ResolvedArchmaxThemeOptions} resolved
 * @returns {AstroIntegration}
 */
function themeIntegration(resolved) {
  return {
    name: PACKAGE_NAME,
    hooks: {
      "astro:config:setup"({ updateConfig }) {
        updateConfig({ vite: { plugins: [vitePluginThemeOptions(resolved)] } });
      },
    },
  };
}

/**
 * @param {ArchmaxThemeOptions} [options]
 * @returns {StarlightPlugin}
 */
export function archmaxTheme(options = {}) {
  return {
    name: PACKAGE_NAME,
    hooks: {
      "config:setup"({ config, updateConfig, addIntegration }) {
        updateConfig(applyThemeConfig(config));
        addIntegration(themeIntegration(resolveOptions(options, config)));
      },
    },
  };
}

export default archmaxTheme;
