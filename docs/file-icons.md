# File Icons

Files are drawn in one of two styles, chosen under Settings › Appearance › File icons and stored as `fileIconStyle` in the app settings:

| Style             | Look                                                | Source                              |
| ----------------- | --------------------------------------------------- | ----------------------------------- |
| Outline (default) | A white page with a folded corner and a small glyph | `components/icons/outline-file.tsx` |
| Material          | Toned-down colored icons from `material-icon-theme` | `components/material-file-icon.tsx` |

Directories and projects are always pastel folders (`components/icons/folder.tsx`), whichever style is chosen.

## Rendering a file icon

Render `<FileIcon fileName size />` from `components/icons/file.tsx`, or `createFileIcon(fileName)` where a panel needs an icon component. `FileIcon` reads the setting; call sites never branch on it. Importing `OutlineFileIcon` or `MaterialFileIcon` anywhere but `file.tsx` is wrong.

## Outline style

The page and glyph colors are the `iconFill`, `iconOutline` and `iconGlyph` theme tokens, so the icon follows light, dark and every dark variant without per-theme code.

There are six glyphs: code, doc, JSON, test, image and terminal. `resolveFileGlyph` in `components/icons/file-glyph.ts` picks one. It reuses the Material extension table (`EXTENSION_TO_ICON`, through `getFileIconName`) instead of keeping a second one, and maps the few non-code Material names to their glyph. Every other known extension is code. A `.test.` / `.spec.` name is a test. An unknown extension is a blank page.

To give a new extension a glyph, add it to the Material table (below). If it is not code, add its Material name to `GLYPH_BY_ICON_NAME`.

## Folders

`PastelFolder` takes a `colorKey` and hashes it to one of five pastels (`deriveFolderColorName` in `styles/identity-colors.ts`). Projects key on their view key and directories on their path, so a folder keeps its color across renders and screens. The fills and strokes are the `folder` theme token: light and dark have their own set, and every dark variant shares the dark one. A project with an uploaded or discovered icon shows that icon instead.

## Material style

`components/material-file-icons.ts` is the vendor table: `SVG_ICONS` holds SVG strings copied verbatim from the theme and `EXTENSION_TO_ICON` maps extensions to icon names. Keep it a faithful copy so re-copying an icon stays a mechanical edit. `components/file-icon-svg.ts` desaturates and caches them.

material-icon-theme picks its palette for VS Code's file tree, where the icon is the only color on the row. Ours share rows with status dots, diff stats and check badges, so every hex is pulled toward neutral at the same perceived lightness (`desaturateHexColor` in `utils/color.ts`, OKLab). `ICON_CHROMA` in `file-icon-svg.ts` is the single knob. Do not add per-icon overrides.

### Adding a Material icon

1. Find the icon name in the manifest:

```bash
node -e "
const m = require('./node_modules/material-icon-theme/dist/material-icons.json');
console.log('fileExtensions:', m.fileExtensions['YOUR_EXT']);
console.log('languageIds:', m.languageIds['YOUR_LANG']);
"
```

2. Copy `node_modules/material-icon-theme/icons/ICON_NAME.svg` into `SVG_ICONS` and add `"ext": "icon_name"` to `EXTENSION_TO_ICON`.
3. Run `npm run typecheck`.
