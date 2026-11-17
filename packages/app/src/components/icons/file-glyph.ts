import { getFileIconName } from "@/components/material-file-icons";

export type FileGlyph = "code" | "doc" | "json" | "test" | "image" | "terminal";

export const GLYPH_PATHS: Record<FileGlyph, string> = {
  code: "M8.7 10.2l-1.6 1.6 1.6 1.6M11.3 10.2l1.6 1.6-1.6 1.6",
  doc: "M7.4 10h5.2M7.4 12h5.2M7.4 14h3.2",
  json: "M8.8 9.8c-.9 0-.9.6-.9 1.1s-.3 .9-.8 .9c.5 0 .8.4.8.9s0 1.1.9 1.1M11.2 9.8c.9 0 .9.6.9 1.1s.3.9.8.9c-.5 0-.8.4-.8.9s0 1.1-.9 1.1",
  test: "M7.6 12.1l1.6 1.5 3.2-3.3",
  image: "M7.2 14.4l2-2.3 1.5 1.5 1-1 1.5 1.8M8.4 9.8h.01",
  terminal: "M7.4 10.2l1.8 1.6-1.8 1.6M10.4 13.6h2.6",
};

// Material icon names (`EXTENSION_TO_ICON`) that are not code. Every other known name is code.
const GLYPH_BY_ICON_NAME: Partial<Record<string, FileGlyph>> = {
  image: "image",
  svg: "image",
  markdown: "doc",
  document: "doc",
  json: "json",
  yaml: "json",
  toml: "json",
  xml: "json",
  settings: "json",
  lock: "json",
  console: "terminal",
};

const TEST_FILE_PATTERN = /[._-](test|spec)\.[^.]+$/i;

/** The glyph inside the page, or null for a blank page when the type is unknown. */
export function resolveFileGlyph(fileName: string): FileGlyph | null {
  if (TEST_FILE_PATTERN.test(fileName)) return "test";
  const iconName = getFileIconName(fileName);
  if (iconName === null) return null;
  return GLYPH_BY_ICON_NAME[iconName] ?? "code";
}
