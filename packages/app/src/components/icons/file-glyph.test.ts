import { describe, expect, it } from "vitest";
import { resolveFileGlyph } from "./file-glyph";

describe("resolveFileGlyph", () => {
  it.each([
    ["app.tsx", "code"],
    ["main.go", "code"],
    ["README.md", "doc"],
    ["notes.txt", "doc"],
    ["package.json", "json"],
    ["config.yaml", "json"],
    ["photo.PNG", "image"],
    ["logo.svg", "image"],
    ["build.sh", "terminal"],
    ["theme.test.ts", "test"],
    ["button.spec.tsx", "test"],
  ] as const)("draws %s as %s", (fileName, glyph) => {
    expect(resolveFileGlyph(fileName)).toBe(glyph);
  });

  it("leaves an unknown or extensionless file as a blank page", () => {
    expect(resolveFileGlyph("archive.xyz")).toBeNull();
    expect(resolveFileGlyph("Makefile")).toBeNull();
  });
});
