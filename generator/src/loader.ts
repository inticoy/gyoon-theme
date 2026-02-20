import { readFileSync } from "fs";
import yaml from "js-yaml";
import { TokenLayer } from "./types.js";

export function loadYaml(filePath: string): TokenLayer {
  const content = readFileSync(filePath, "utf-8");
  return (yaml.load(content) as TokenLayer) ?? {};
}
