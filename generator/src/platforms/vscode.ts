import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { ThemeVariant } from "../types.js";

interface VscodeMapping {
  colors: Record<string, string>;
  tokenColors: Array<{
    name?: string;
    scope: string | string[];
    foreground?: string;
    fontStyle?: string;
  }>;
  semanticTokenColors: Record<string, string>;
}

function resolveToken(ref: string, tokens: Record<string, string>): string {
  // If it starts with # it's a literal color
  if (ref.startsWith("#")) return ref;
  // Otherwise look up in resolved tokens
  return tokens[ref] ?? ref;
}

export function generateVscodeTheme(
  variant: ThemeVariant,
  mappingsDir: string,
  distDir: string
): void {
  const mappingContent = readFileSync(
    join(mappingsDir, "vscode.yaml"),
    "utf-8"
  );
  const mapping = yaml.load(mappingContent) as VscodeMapping;

  const { tokens } = variant;

  // Build colors
  const colors: Record<string, string> = {};
  for (const [key, ref] of Object.entries(mapping.colors)) {
    const resolved = resolveToken(ref, tokens);
    if (resolved) {
      colors[key] = resolved;
    }
  }

  // Build tokenColors
  const tokenColors: Array<Record<string, unknown>> = [];
  for (const tc of mapping.tokenColors) {
    const entry: Record<string, unknown> = {};
    if (tc.scope) {
      entry.scope = tc.scope;
    }
    const settings: Record<string, string> = {};
    if (tc.foreground) {
      const resolved = resolveToken(tc.foreground, tokens);
      if (resolved) {
        // VSCode needs #RRGGBB format — ensure 'ff' suffix for full opacity
        settings.foreground = resolved.length === 7 ? resolved + "ff" : resolved;
      }
    }
    if (tc.fontStyle) {
      settings.fontStyle = tc.fontStyle;
    }
    entry.settings = settings;
    tokenColors.push(entry);
  }

  // Build semanticTokenColors
  const semanticTokenColors: Record<string, string> = {};
  for (const [key, ref] of Object.entries(mapping.semanticTokenColors)) {
    semanticTokenColors[key] = resolveToken(ref, tokens);
  }

  const theme = {
    name: variant.displayName,
    colors,
    tokenColors,
    semanticHighlighting: true,
    semanticTokenColors,
  };

  const themesDir = join(distDir, "vscode", "themes");
  mkdirSync(themesDir, { recursive: true });

  const filename = `${variant.slug}-color-theme.json`;
  writeFileSync(join(themesDir, filename), JSON.stringify(theme, null, "\t"));
}

export function generateVscodePackageJson(
  variants: ThemeVariant[],
  templatesDir: string,
  distDir: string
): void {
  const templatePath = join(templatesDir, "vscode", "package.template.json");
  const template = JSON.parse(readFileSync(templatePath, "utf-8"));

  const themes = variants.map((v) => ({
    label: v.displayName,
    uiTheme: v.isDark ? "vs-dark" : "vs",
    path: `./themes/${v.slug}-color-theme.json`,
  }));

  template.contributes = { themes };

  const vscodeDir = join(distDir, "vscode");
  mkdirSync(vscodeDir, { recursive: true });
  writeFileSync(
    join(vscodeDir, "package.json"),
    JSON.stringify(template, null, 2)
  );
}
