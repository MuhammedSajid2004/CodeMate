# CodeMate

A small animated face for VS Code that sits in the sidebar and reacts while you work.

The face is a soft circle that blends into the panel — eyes and a mouth only, no robot chrome or hard borders. It blinks on its own, looks around, and changes expression as you type, save, debug, and hit errors.

---

## Features

- **Minimal face** — circular, borderless, eyes + mouth only
- **Live reactions** to editor events
- **Themes** — Classic, Neon, Pastel, Retro Pixel, Minimal Mono, or custom colors
- **Size & placement** — small / medium / large, plus corner or draggable position
- **Idle sleepy mode** after two minutes without edits

### What it reacts to

| You do this | The face does this |
| --- | --- |
| Type | Concentrated look, light bob |
| Type fast / paste a lot | Surprised pulse |
| Enter | Nod |
| Tab / indent | Glance aside, smirk |
| Backspace | Quick frown |
| Paste | Wide-eyed pulse |
| Cut | Tilt + frown |
| Undo | Dizzy wobble |
| Redo | Determined nod |
| Comment (`//`, `/*`, `--`, `# `) | Smirk + wink |
| Format document | Short “chew” pulse |
| Switch file | Eyes peek left then right |
| Save | Wink |
| Errors appear | Shake, wavy mouth |
| Errors clear | Bounce, big smile |
| Breakpoint / debug start | Surprised stare |
| Debug session ends | Bounce + smile |
| Idle (~2 min) | Sleepy lids, occasional yawn |

---

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/) `1.95.0` or later
- [Node.js](https://nodejs.org/) (to compile from source)

This is an unpublished local extension. Load it in the Extension Development Host to try it.

---

## Run from source

```bash
git clone https://github.com/MuhammedSajid2004/CodeMate.git
cd CodeMate
npm install
npm run compile
```

Then in VS Code:

1. Open this folder
2. Press **F5** (`Run Extension`)
3. In the new window, open the **CodeMate** icon in the activity bar

`watch` mode while developing:

```bash
npm run watch
```

---

## Settings

Search **CodeMate** in Settings, or edit `settings.json`:

| Setting | Default | What it does |
| --- | --- | --- |
| `codemate.theme` | `"Classic"` | `Classic`, `Neon`, `Pastel`, `Retro Pixel`, `Minimal Mono`, `custom` |
| `codemate.size` | `"medium"` | `small`, `medium`, `large` |
| `codemate.position` | `"bottom-right"` | Corner, or `draggable` |
| `codemate.reactionIntensity` | `"normal"` | `off`, `subtle`, `normal`, `playful` |
| `codemate.customColors` | `{}` | `eyeColor`, `mouthColor`, `backgroundColor` when theme is `custom` |
| `codemate.enableErrorReaction` | `true` | React to diagnostics |
| `codemate.enableIdleReaction` | `true` | Sleepy after idle |
| `codemate.enableSaveReaction` | `true` | Wink on save |
| `codemate.enableDebugReaction` | `true` | React to debug events |
| `codemate.enableTypingBurstReaction` | `true` | Extra reaction for fast typing |

Example:

```json
{
  "codemate.theme": "Neon",
  "codemate.size": "medium",
  "codemate.position": "bottom-right"
}
```

---

## Themes

| Theme | Look |
| --- | --- |
| **Classic** | Dark eyes and mouth on a soft circle |
| **Neon** | Cyan / magenta glow |
| **Pastel** | Soft purple and pink |
| **Retro Pixel** | Blocky green-on-black |
| **Minimal Mono** | Follows the VS Code foreground color |
| **custom** | Your own `codemate.customColors` |

---

## Project layout

```
CodeMate/
├── src/
│   ├── extension.ts            # Editor event listeners
│   ├── CodeMateViewProvider.ts # Sidebar webview
│   ├── themes.ts               # Theme presets
│   └── types.ts                # Shared types
├── media/
│   ├── character.html          # Face SVG
│   ├── character.css           # Layout + motion
│   ├── character.js            # Expression state machine
│   └── icon.svg                # Activity bar icon
└── package.json
```

---
