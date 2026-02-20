import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";
import { ThemeVariant } from "../../types.js";

interface EditorMapping {
  colors: Record<string, string>;
  attributes: Record<string, Record<string, string>>;
}

function resolve(ref: string, tokens: Record<string, string>): string {
  if (ref.startsWith("#")) return ref.replace(/^#/, "");
  if (ref.startsWith("__base.")) return tokens[ref.replace("__base.", "")] ?? ref;
  const val = tokens[ref] ?? ref;
  return val.replace(/^#/, "");
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function generateIntellijEditorXml(
  variant: ThemeVariant,
  mappingsDir: string,
  distDir: string
): void {
  const mappingContent = readFileSync(
    join(mappingsDir, "intellij", "editor.yaml"),
    "utf-8"
  );
  const mapping = yaml.load(mappingContent) as EditorMapping;

  const { tokens } = variant;

  const lines: string[] = [];
  lines.push(
    `<scheme name="${escapeXml(variant.displayName)}" version="142" parent_scheme="${escapeXml(variant.parentScheme)}">`
  );
  lines.push("  <metaInfo>");
  lines.push(
    '    <property name="created">2024-01-01T00:00:00</property>'
  );
  lines.push(
    '    <property name="modified">2024-01-01T00:00:00</property>'
  );
  lines.push(
    `    <property name="originalScheme">${escapeXml(variant.displayName)}</property>`
  );
  lines.push("  </metaInfo>");
  lines.push("");

  // Colors
  lines.push("  <colors>");
  for (const [name, ref] of Object.entries(mapping.colors)) {
    const resolved = resolve(ref, tokens);
    if (!resolved || resolved === ref) {
      // Empty value (like SELECTION_FOREGROUND)
      lines.push(`    <option name="${escapeXml(name)}" />`);
    } else {
      lines.push(
        `    <option name="${escapeXml(name)}" value="${resolved}" />`
      );
    }
  }
  lines.push("  </colors>");
  lines.push("");

  // Attributes
  lines.push("  <attributes>");
  for (const [name, attrs] of Object.entries(mapping.attributes)) {
    lines.push(`    <option name="${escapeXml(name)}">`);
    lines.push("      <value>");
    for (const [attrKey, ref] of Object.entries(attrs)) {
      const resolved = resolve(ref, tokens);
      lines.push(
        `        <option name="${escapeXml(attrKey)}" value="${resolved}" />`
      );
    }
    lines.push("      </value>");
    lines.push("    </option>");
  }
  lines.push("  </attributes>");
  lines.push("</scheme>");

  const themeDir = join(
    distDir,
    "intellij",
    "src",
    "main",
    "resources",
    "theme"
  );
  mkdirSync(themeDir, { recursive: true });

  const fileSlug = variant.slug.replace(/-/g, "_");
  writeFileSync(join(themeDir, `${fileSlug}.xml`), lines.join("\n") + "\n");
}
