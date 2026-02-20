import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { rmSync } from "fs";
import { generateMatrix } from "./matrix.js";
import {
  generateVscodeTheme,
  generateVscodePackageJson,
} from "./platforms/vscode.js";
import { generateIntellijThemeJson } from "./platforms/intellij/theme-json.js";
import { generateIntellijEditorXml } from "./platforms/intellij/editor-xml.js";
import { generatePluginXml } from "./platforms/intellij/plugin-xml.js";
import { copyGradleFiles } from "./platforms/intellij/copy-gradle.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..", "..");
const TOKENS_DIR = join(ROOT, "tokens");
const MAPPINGS_DIR = join(ROOT, "mappings");
const TEMPLATES_DIR = join(ROOT, "templates");
const DIST_DIR = join(ROOT, "dist");

// Clean dist
rmSync(DIST_DIR, { recursive: true, force: true });

console.log("Generating theme matrix...");
const variants = generateMatrix(TOKENS_DIR);

console.log(`Found ${variants.length} variants:`);
for (const v of variants) {
  console.log(`  - ${v.displayName} (${v.slug})`);
}

// Generate VSCode themes
console.log("\nGenerating VSCode themes...");
for (const v of variants) {
  generateVscodeTheme(v, MAPPINGS_DIR, DIST_DIR);
  console.log(`  ✓ ${v.slug}-color-theme.json`);
}
generateVscodePackageJson(variants, TEMPLATES_DIR, DIST_DIR);
console.log("  ✓ package.json");

// Generate IntelliJ themes
console.log("\nGenerating IntelliJ themes...");
for (const v of variants) {
  generateIntellijThemeJson(v, MAPPINGS_DIR, DIST_DIR);
  const fileSlug = v.slug.replace(/-/g, "_");
  console.log(`  ✓ ${fileSlug}.theme.json`);

  generateIntellijEditorXml(v, MAPPINGS_DIR, DIST_DIR);
  console.log(`  ✓ ${fileSlug}.xml`);
}
generatePluginXml(variants, DIST_DIR);
console.log("  ✓ plugin.xml");

// Copy gradle files
copyGradleFiles(TEMPLATES_DIR, DIST_DIR);
console.log("  ✓ gradle files");

console.log("\nDone! Output in dist/");
