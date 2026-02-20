import { TokenLayer, ResolvedTokens } from "./types.js";

/** Deep-merge source into target (mutates target) */
export function deepMerge(target: TokenLayer, source: TokenLayer): TokenLayer {
  for (const key of Object.keys(source)) {
    const sv = source[key];
    const tv = target[key];
    if (
      sv !== null &&
      typeof sv === "object" &&
      !Array.isArray(sv) &&
      tv !== null &&
      typeof tv === "object" &&
      !Array.isArray(tv)
    ) {
      deepMerge(tv as TokenLayer, sv as TokenLayer);
    } else {
      target[key] = sv;
    }
  }
  return target;
}

/**
 * Merge base + mode + accent layers.
 * For accent, apply `_when_<mode>` block and strip meta keys.
 */
export function mergeLayers(
  base: TokenLayer,
  mode: TokenLayer,
  accent: TokenLayer
): TokenLayer {
  // Start with a deep clone of base
  let merged = structuredClone(base) as TokenLayer;

  // Merge mode on top
  merged = deepMerge(merged, structuredClone(mode) as TokenLayer);

  // Determine current mode slug
  const modeSlug = (mode as Record<string, unknown>)._mode
    ? ((mode as Record<string, unknown>)._mode as Record<string, string>).slug
    : "dark";

  // Clone accent and extract conditional blocks
  const accentClone = structuredClone(accent) as TokenLayer;
  const whenKey = `_when_${modeSlug}`;
  const conditionalBlock = accentClone[whenKey] as TokenLayer | undefined;

  // Remove all _when_* and _accent meta keys from accent before merge
  for (const key of Object.keys(accentClone)) {
    if (key.startsWith("_when_") || key === "_accent") {
      delete accentClone[key];
    }
  }

  // Merge non-conditional accent overrides (usually empty for green)
  merged = deepMerge(merged, accentClone);

  // Merge conditional block if it exists
  if (conditionalBlock) {
    merged = deepMerge(merged, conditionalBlock);
  }

  return merged;
}

/** Flatten nested object to dot-separated paths */
export function flatten(
  obj: TokenLayer,
  prefix = ""
): ResolvedTokens {
  const result: ResolvedTokens = {};
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value as TokenLayer, path));
    } else {
      result[path] = String(value ?? "");
    }
  }
  return result;
}
