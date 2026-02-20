import { cpSync, mkdirSync } from "fs";
import { join } from "path";

export function copyGradleFiles(
  templatesDir: string,
  distDir: string
): void {
  const src = join(templatesDir, "intellij");
  const dest = join(distDir, "intellij");
  mkdirSync(dest, { recursive: true });

  // Copy all template files from intellij template
  cpSync(src, dest, { recursive: true });
}
