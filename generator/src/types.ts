/** Flat key-value map from a single YAML file */
export type TokenLayer = Record<string, unknown>;

/** Fully resolved flat tokens after merge: token path → color string */
export type ResolvedTokens = Record<string, string>;

/** One theme variant produced by mode × accent */
export interface ThemeVariant {
  /** e.g. "Gyoon Dark", "Gyoon Light Green" */
  displayName: string;
  /** e.g. "gyoon-dark", "gyoon-light-green" */
  slug: string;
  /** e.g. "dark" | "light" */
  mode: string;
  /** e.g. "" | "green" */
  accent: string;
  isDark: boolean;
  parentScheme: string;
  vscodeBase: string;
  tokens: ResolvedTokens;
}

/** Structure for VSCode tokenColor entries in mapping */
export interface VscodeTokenColorMapping {
  scope: string | string[];
  foreground?: string;
  fontStyle?: string;
}

/** Structure for IntelliJ editor attribute entries */
export interface EditorAttribute {
  FOREGROUND?: string;
  BACKGROUND?: string;
  FONT_TYPE?: string;
  EFFECT_TYPE?: string;
  EFFECT_COLOR?: string;
  ERROR_STRIPE_COLOR?: string;
}
