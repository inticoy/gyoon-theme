import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import { ThemeVariant } from "../../types.js";

export function generatePluginXml(
  variants: ThemeVariant[],
  distDir: string
): void {
  const metaInfDir = join(
    distDir,
    "intellij",
    "src",
    "main",
    "resources",
    "META-INF"
  );
  mkdirSync(metaInfDir, { recursive: true });

  const extensions: string[] = [];
  for (const v of variants) {
    const fileSlug = v.slug.replace(/-/g, "_");
    const id = `com.github.inticoy.${v.slug}-theme`;
    extensions.push(
      `        <themeProvider id="${id}"\n                       path="/theme/${fileSlug}.theme.json"/>`
    );
    extensions.push(
      `        <bundledColorScheme path="/theme/${fileSlug}"/>`
    );
    extensions.push("");
  }

  // Build theme descriptions
  const themeDescriptions = variants.map((v) => {
    if (v.isDark) {
      return `    <h3>${v.displayName}</h3>\n    <ul>\n        <li>Dark theme with carefully crafted colors</li>\n    </ul>`;
    }
    return `    <h3>${v.displayName}</h3>\n    <ul>\n        <li>Light theme with carefully crafted colors</li>\n    </ul>`;
  });

  const xml = `<idea-plugin>
    <id>com.github.inticoy.gyoon-theme</id>
    <name>Gyoon Theme</name>
    <vendor email="inticoy@gmail.com" url="https://github.com/inticoy">inticoy</vendor>

    <description><![CDATA[
    <h2>Gyoon Theme</h2>
    <p>A collection of carefully crafted themes for JetBrains IDEs.</p>
${themeDescriptions.join("\n")}
    <p>Supports all JetBrains IDEs (IntelliJ IDEA, WebStorm, PyCharm, GoLand, etc.)</p>
    ]]></description>

    <depends>com.intellij.modules.platform</depends>

    <extensions defaultExtensionNs="com.intellij">
${extensions.join("\n")}
    </extensions>
</idea-plugin>
`;

  writeFileSync(join(metaInfDir, "plugin.xml"), xml);
}
