import type { StarlightPlugin } from "@astrojs/starlight/types";

type ConfigSetupOptions = Parameters<
  NonNullable<StarlightPlugin["hooks"]["config:setup"]>
>[0];
export type UserConfig = ConfigSetupOptions["config"];
export type ConfigUpdate = Parameters<ConfigSetupOptions["updateConfig"]>[0];

export interface ArchmaxThemeLinks {
  /** Company website, linked from the header and footer. */
  website?: string;
  /** Source repository. Defaults to the Starlight `social` GitHub entry when present. */
  github?: string;
  /** Legal notice page. */
  imprint?: string;
  /** Privacy policy page. */
  privacy?: string;
}

export interface ArchmaxThemeOptions {
  /** Product name shown next to the archmax wordmark, for example `"semantics"`. */
  product?: string;
  /** Version shown in the header badge. Defaults to `APP_VERSION`, then `"dev"`. */
  version?: string;
  /** Short line under the wordmark in the footer. */
  tagline?: string;
  /** Footer and header links. */
  links?: ArchmaxThemeLinks;
  /** Name in the footer copyright line. */
  copyrightHolder?: string;
}

export interface ResolvedArchmaxThemeOptions {
  product: string | undefined;
  version: string;
  tagline: string;
  links: {
    website: string;
    github: string | undefined;
    imprint: string;
    privacy: string;
  };
  copyrightHolder: string;
}

export const PACKAGE_NAME: "@archmax-ai/starlight-theme";
export const VIRTUAL_MODULE_ID: "virtual:archmax-starlight-theme/options";
export const THEME_CSS: string[];
export const THEME_COMPONENTS: {
  SiteTitle: string;
  Header: string;
  Hero: string;
  Footer: string;
};
export const THEME_EXPRESSIVE_CODE_STYLES: {
  borderRadius: string;
  borderWidth: string;
  codeBackground: string;
  frames: Record<string, string>;
};

export function resolveOptions(
  options?: ArchmaxThemeOptions,
  config?: Pick<UserConfig, "social">,
  env?: NodeJS.ProcessEnv,
): ResolvedArchmaxThemeOptions;

/**
 * Computes the Starlight config update the theme applies. Theme CSS is loaded first so the
 * consuming site's `customCss` wins; component slots the site already set are left untouched.
 */
export function applyThemeConfig(config: UserConfig): ConfigUpdate;

export function archmaxTheme(options?: ArchmaxThemeOptions): StarlightPlugin;
export default archmaxTheme;
