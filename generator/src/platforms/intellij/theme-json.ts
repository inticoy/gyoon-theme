import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { ThemeVariant } from "../../types.js";

type MappingValue = string | number | Record<string, unknown>;
type UIMapping = Record<string, MappingValue>;

function resolveValue(
  value: MappingValue,
  tokens: Record<string, string>
): unknown {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    if (value.startsWith("#")) return value;
    if (value.startsWith("__base.")) {
      const resolved = tokens[value.replace("__base.", "")] ?? value;
      // Convert numeric strings back to numbers for JSON
      const num = Number(resolved);
      if (!isNaN(num) && resolved !== "") return num;
      return resolved;
    }
    return tokens[value] ?? value;
  }
  if (typeof value === "object" && value !== null) {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = resolveValue(v as MappingValue, tokens);
    }
    return result;
  }
  return value;
}

export function generateIntellijThemeJson(
  variant: ThemeVariant,
  mappingsDir: string,
  distDir: string
): void {
  const mappingContent = readFileSync(
    join(mappingsDir, "intellij", "ui.yaml"),
    "utf-8"
  );
  const mapping = yaml.load(mappingContent) as UIMapping;

  const { tokens } = variant;

  // Separate icons from ui mapping
  const iconMapping = mapping.icons as Record<string, unknown> | undefined;
  delete mapping.icons;

  // Resolve all UI values
  const ui: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(mapping)) {
    ui[key] = resolveValue(value, tokens);
  }

  // Resolve icons
  let icons: Record<string, unknown> | undefined;
  if (iconMapping) {
    icons = resolveValue(iconMapping, tokens) as Record<string, unknown>;
  }

  // Build editor scheme path
  const fileSlug = variant.slug.replace(/-/g, "_");
  const editorScheme = `/theme/${fileSlug}.xml`;

  const themeJson: Record<string, unknown> = {
    name: variant.displayName,
    dark: variant.isDark,
    author: "inticoy",
    editorScheme,
    ui,
  };

  if (icons) {
    themeJson.icons = icons;
  }

  const themeDir = join(
    distDir,
    "intellij",
    "src",
    "main",
    "resources",
    "theme"
  );
  mkdirSync(themeDir, { recursive: true });

  writeFileSync(
    join(themeDir, `${fileSlug}.theme.json`),
    JSON.stringify(themeJson, null, 2)
  );
}
