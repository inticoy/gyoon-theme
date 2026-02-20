import { readdirSync } from "fs";
import { join, basename } from "path";
import { TokenLayer, ThemeVariant, ResolvedTokens } from "./types.js";
import { loadYaml } from "./loader.js";
import { mergeLayers, flatten } from "./merger.js";

export function generateMatrix(tokensDir: string): ThemeVariant[] {
  const base = loadYaml(join(tokensDir, "base.yaml"));
  const modesDir = join(tokensDir, "modes");
  const accentsDir = join(tokensDir, "accents");

  const modeFiles = readdirSync(modesDir).filter((f) => f.endsWith(".yaml"));
  const accentFiles = readdirSync(accentsDir).filter((f) =>
    f.endsWith(".yaml")
  );

  const variants: ThemeVariant[] = [];

  for (const modeFile of modeFiles) {
    const mode = loadYaml(join(modesDir, modeFile));
    const modeMeta = mode._mode as Record<string, string | boolean>;
    const modeSlug = modeMeta.slug as string;
    const modeName = modeMeta.name as string;

    for (const accentFile of accentFiles) {
      const accent = loadYaml(join(accentsDir, accentFile));
      const accentMeta = accent._accent as Record<string, string>;
      const accentSlug = accentMeta.slug;
      const accentName = accentMeta.name;

      const merged = mergeLayers(base, mode, accent);

      // Remove meta keys before flattening
      delete merged._mode;
      delete merged._accent;

      const tokens: ResolvedTokens = flatten(merged);

      const nameParts = ["Gyoon", modeName];
      if (accentName) nameParts.push(accentName);
      const displayName = nameParts.join(" ");

      const slugParts = ["gyoon", modeSlug];
      if (accentSlug) slugParts.push(accentSlug);
      const slug = slugParts.join("-");

      variants.push({
        displayName,
        slug,
        mode: modeSlug,
        accent: accentSlug,
        isDark: modeMeta.isDark as boolean,
        parentScheme: modeMeta.parentScheme as string,
        vscodeBase: modeMeta.vscodeBase as string,
        tokens,
      });
    }
  }

  return variants;
}
