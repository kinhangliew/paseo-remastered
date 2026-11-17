# Handoff: soft-texture UI reskin

Design mockups (canvas): https://claude.ai/artifact/5S6a8uKNV19UReHp1FpNxg

- `Main.dc.html` / `MainDark.dc.html`: the desktop workspace, light / dark (interactive: expand/collapse, tab switching, the Changes/Files switch)
- `Mobile.dc.html` / `MobileDark.dc.html`: the phone Sessions screen, light / dark
- `Kit.dc.html`: the light/dark color table, folders in both themes, file icons and motion values

The mockup source defines every color as a CSS variable (the `.lt` / `.dk` classes in each file's `<helmet>`). Those variables are the token list for this handoff.

## Goal and scope

Restyle every element of the app to look and move like the reference video: soft cool-gray floating panels, pastel two-tone folders, outlined file icons, a hover highlight that fades in and out, and a staggered expand/collapse.

**Do not change the layout.** Keep the sidebar / conversation / right-pane structure, the content and order of every row, the routing and the interaction logic exactly as they are. Only change colors, corner radii, icons and motion.

Before you start, read: `docs/design.md`, `docs/hover.md`, `docs/unistyles.md`, `docs/file-icons.md`, `docs/coding-standards.md`, and the platform gating section of `CLAUDE.md`.

## 1. Tokens

Tokens live in `packages/app/src/styles/theme.ts`. Change values and add tokens; do not hard-code colors in components.

| Token                     | Light                      | Dark                           | Use                                                       |
| ------------------------- | -------------------------- | ------------------------------ | --------------------------------------------------------- |
| `surface0`                | `#FFFFFF`                  | `#161618`                      | Main content area                                         |
| `surfaceSidebar`          | `#F3F4F5`                  | `#202124`                      | Sidebar, right pane                                       |
| `surfaceSidebarHover`     | `#E8E9EC`                  | `#2B2C30`                      | Row hover                                                 |
| `surfaceSidebarSelected`  | `#E3E5E9`                  | `#323338`                      | Selected row                                              |
| New `surfacePill`         | `#FFFFFF`                  | `#36373C`                      | Active tab, segmented control indicator                   |
| New `surfaceComposer`     | `#FFFFFF`                  | `#1E1F22`                      | Composer card (border light `#E8E9EC` / dark `#2E2F33`)   |
| Inline code background    | `#F1F2F4`                  | `#26272B`                      | `code`                                                    |
| foreground                | `#1C1C1E`                  | `#ECECEE`                      | Primary text, selected row                                |
| New `foregroundSecondary` | `#4A4A4F`                  | `#C4C4C9`                      | Unselected row text                                       |
| foregroundMuted           | `#6B6B70`                  | `#9A9AA1`                      | Group labels, counts (≥4.5:1 on the panel in both themes) |
| New `iconFill`            | `#FFFFFF`                  | `#2A2B2F`                      | File/workspace icon fill                                  |
| New `iconOutline`         | `#B9BAC0`                  | `#5A5B62`                      | Icon outline                                              |
| New `iconGlyph`           | `#7D7E85`                  | `#A3A4AB`                      | Small glyph inside icons                                  |
| diff +                    | `#1F8A4C`                  | `#4CC27A`                      |                                                           |
| diff −                    | `#C23B3B`                  | `#F07272`                      |                                                           |
| running dot               | `#34A85E`                  | `#3FBF6E`                      | Breathing dot                                             |
| Send button               | bg `#1C1C1E` / glyph white | bg `#ECECEE` / glyph `#161618` | Black and white swap                                      |

Shadows: light `0 1px 2px rgba(20,20,30,.04), 0 10px 30px rgba(20,20,30,.06)`; dark `0 1px 2px rgba(0,0,0,.3), 0 12px 32px rgba(0,0,0,.35)`. Dark mode relies mostly on lighter surfaces, not shadows, to separate layers.

**Dark theme variants**: `theme.ts` has several built-in dark themes (`dark`, `zinc`, `midnight`, `claude`, `ghostty`, `pureBlack`). The dark column above is the new value set for the default `dark` theme. The other variants keep their own surface tints, and their hover, selected, pill and icon colors are derived with `derive-colors.ts` using the same steps as the table (each step one level lighter than the surface). Folder colors use the same dark set in every dark theme.

Corner radius (`BORDER_RADIUS`, `theme.ts:603`): add `panel: 20` (floating panels) and `row: 12` (rows); the composer card uses `20`. On phone, rows use 14 and the panel uses 24.

The light theme's base surfaces are around `theme.ts:324`. `packages/app/src/styles/theme-contrast.test.ts` must still pass after the changes.

## 2. Panels

- The sidebar and right pane become **floating panels**: a 10px gap from the window edge and from each other, `borderRadius.panel`, background `surfaceSidebar`, no divider lines. The main content area stays a full white background.
- Panel widths, collapse behavior and drag-to-resize all stay as they are.
- On compact layouts (phone), the sidebar content sits in a gray rounded panel with 12px side margins (see `Mobile.dc.html`).

## 3. Icons

### Folders / projects: pastel two-tone

The 20×20 path is in the canvas's `Main.dc.html` (search for `M2.6 5.8`). It has a light fill, a 1.2px colored outline, and a 55%-opacity line across the folder for the tab.

| Color  | Light fill | Light stroke | Dark fill | Dark stroke |
| ------ | ---------- | ------------ | --------- | ----------- |
| Blue   | `#DDEBFD`  | `#5E9BEF`    | `#1E3150` | `#6EA8F7`   |
| Green  | `#DCF2E3`  | `#5DB97F`    | `#1B3527` | `#6CCB8E`   |
| Pink   | `#FCE1EC`  | `#EA87AF`    | `#3F2232` | `#F095BC`   |
| Orange | `#FDE8D0`  | `#EC9D45`    | `#3E2C18` | `#F2AC5A`   |
| Purple | `#ECE6FD`  | `#9B83EC`    | `#2D2549` | `#A994F2`   |

In dark mode the fill drops to a deep tint of the same hue and the stroke gets brighter, so the folder still reads as soft and colored without glowing.

- **Project rows in the sidebar**: the folder replaces the current project avatar or initial. Pick its color deterministically from a hash of the project key; `styles/identity-colors.ts` already does something similar, so reuse it. If the project has a custom icon (repo avatar / emoji), keep showing it.
- **File tree directories**: use the same folders, colored by hashing the directory path, or all blue (decide during implementation).

### Files / workspaces: outline + small glyph

- A file is a white page with a folded corner (outline `iconOutline`, 1.1px) and a glyph inside (`iconGlyph`). Glyphs: code `<>`, doc lines, JSON `{}`, test ✓, image, terminal `>_`. The paths are in `Kit.dc.html`.
- A workspace is a white rounded square with a glyph inside: `monitor` for a local checkout, `branch` for a worktree.
- The running state is shown by an 8px green dot in the icon's bottom-right corner (with a 2px ring in the panel color) that pulses.

**Decided: outline icons become the default, and Material stays available as an option.**

- Add a "File icons" choice under Settings › Appearance: `Outline` (default) / `Material`. Store it in the existing appearance preferences, and add the strings for every locale under `i18n/resources`.
- Add a new `OutlineFileIcon` component: map file extensions to the six glyphs (code / doc / JSON / test / image / terminal) and fall back to a blank page for anything else. Reuse the extension table in `material-file-icons.ts` (`EXTENSION_TO_ICON`) for the mapping instead of keeping a second copy.
- Callers use a single `FileIcon` that picks `OutlineFileIcon` or `MaterialFileIcon` based on the setting. Do not branch on the setting at each call site.
- Directories always use the pastel folders, whichever file icon option is selected.
- Update `docs/file-icons.md` to cover both themes and the setting (rewrite the existing content; don't append).

## 4. Rows and controls

- Row height 34–38px (pointer) / 48pt (touch), corner radius `row`, horizontal padding 10, 8–10px between icon and text. Child rows are indented 30px.
- Background in each state:
  - Default: transparent.
  - Hover: `surfaceSidebarHover`.
  - Selected: `surfaceSidebarSelected`, with the text switching to the primary color.
- Pressed: the row scales to 0.985.
- Counts and diff stats sit at the right end of the row, with `tabular-nums`.
- Agent tabs: put them on a gray track (`surfaceSidebar`, radius 14, 4px padding). The active tab is a white pill (radius 10) with a soft shadow, and each tab gets a status dot (green = running, gray = idle, orange = needs attention).
- `segmented-control.tsx` (the Changes/Files switch): a white indicator slides beneath the labels instead of the selection jumping.
- Composer: a white card with a 1px border `#E8E9EC`, radius 20, shadow `0 1px 2px rgba(20,20,30,.04), 0 10px 30px rgba(20,20,30,.06)`. The send button is a black circle. Keep the existing toolbar geometry (`composer/input/toolbar-rails.ts`).
- Tool calls: one row per command, with the terminal icon + "Shell" (muted) + the command in monospace. A run of consecutive tool calls folds into a group ("Ran N commands") that uses the same expand animation.
- Inline code: background `#F1F2F4`, radius 6.

The sources of these components: the sidebar is in `components/sidebar-workspace-list.tsx`; the file tree is in `components/file-explorer-pane.tsx` and `components/tree-rail.tsx`; tabs are in `composer/draft/workspace-tab.tsx`; tool calls are in `components/message.tsx` and `components/tool-call-details.tsx`. Row primitives must go through `PressHighlight` (`components/ui/press-highlight.tsx`), so the change lands in one place instead of being styled separately on each screen.

## 5. Motion

Curve `ease-out = cubic-bezier(.2,.8,.2,1)`. Use `react-native-reanimated`, which is already used in `tree-rail.tsx` and `split-container.tsx`.

| Motion                  | Duration            | Detail                                                                            |
| ----------------------- | ------------------- | --------------------------------------------------------------------------------- |
| Hover highlight         | 180ms ease          | Background fades in, **and fades back out on leave**                              |
| Pressed                 | 180ms               | scale 0.985                                                                       |
| Expand height           | 340ms ease-out      | Same curve for collapse                                                           |
| Chevron                 | 280ms ease-out      | 0° → 90°                                                                          |
| Child row enter         | 300ms, 40ms stagger | opacity 0→1, translateY −6→0, blur 3→0 (blur on web only); first row delayed 60ms |
| Child rows on collapse  | 180ms               | All fade out together, no delay                                                   |
| Tab / segment indicator | 320ms ease-out      | Slides between options                                                            |
| Running dot             | 1.8s loop           | The ring breathes                                                                 |

Implementation notes:

- **Collapse needs the children to stay mounted until the animation ends.** `sidebar-workspace-list.tsx:1754` currently renders nothing when collapsed (`if (!collapsed)`), so collapsing can't animate. Keep the children mounted while the collapse plays, then unmount them (or use reanimated `exiting`).
- Height: measure the content height with `onLayout` and animate it. On web, `grid-template-rows: 0fr→1fr` also works; put the web and native versions in `.web.tsx` / `.native.tsx` files, not an `if (isWeb)` branch.
- Stagger: give each child an `entering` with a delay of `60 + index * 40` ms. Cap it at 8 rows, after which the delay stops growing, so long lists don't drag.
- Hover only works on web, so implement it the way `docs/hover.md` describes. Native gets only the pressed fill.
- `DraggableList` (when manual sort is on) must still drag correctly; the enter animation must not fight its layout.
- Respect `prefers-reduced-motion` / `AccessibilityInfo.isReduceMotionEnabled`: when it is on, keep only the fades and drop the movement and blur.
- Follow `docs/agent-stream-disclosure.md` for the tool-call group in the chat timeline, so expanding it doesn't make the scroll jump.

## 6. Copy and language

This reskin does not change any copy. The Chinese text in the mockups is only there for display. Every label keeps using the existing i18n keys (`t(...)`, `packages/app/src/i18n/resources/*.ts`), and the language follows Paseo's own setting (Settings › General › Language, which includes `zh-CN`). Do not hard-code Chinese or English strings into components. Check the layout with long-text languages (ru, fr) and right-to-left (ar): rows truncate with an ellipsis and the counts stay right-aligned.

## 7. Suggested order (one PR per phase)

1. Tokens (light + dark) + floating panels + row states (theme only, no icon or motion changes)
2. Icons: pastel folders, the `OutlineFileIcon` + the "File icons" setting, workspace icons, running dot
3. Motion: expand/collapse primitive (sidebar first, then the file tree, then tool groups), hover fades, sliding indicators
4. Tabs, the segmented control and the composer card

## 8. Acceptance

- Side by side with the canvas, the desktop and the phone screens match in both light and dark: colors, corner radii, icons, row height.
- Every built-in dark variant (zinc, midnight, claude, ghostty, pureBlack) still layers correctly: hover and selected states are visible, and text passes the contrast floor.
- Switching the file icon setting (Outline / Material) takes effect immediately, and the folders stay pastel.
- Expanding and collapsing a project or directory looks the same as in the video: the height changes smoothly, the chevron rotates and the children appear one after another. Collapsing has no lag and no flash.
- `npm run typecheck`, `npm run lint` and `theme-contrast.test.ts` pass. Run only the test files you changed.
- Provide before/after screenshots and screen recordings for web, Electron, iOS and Android, following `docs/qa.md`.
- Layout, routing and behavior are unchanged, and the existing tests pass.
