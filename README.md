# CodeMate 

> A tiny, friendly animated face that lives in your VS Code sidebar and reacts to what you're doing.

**No body. No pet. No gimmicks.** Just two eyes and a mouth, floating in the corner of your editor.

---

## Features

| What it does | How it looks |
|---|---|
| Idle blinking every 3–6 s | Smooth eyelid animation |
| Typing steadily | Eyes shift slightly, flat mouth |
| Fast typing burst | Wide eyes, surprised mouth, pulse bounce |
| New error in Problems panel | Concerned squiggle mouth + shake |
| All errors cleared | Big smile + bounce |
| File saved | Smirk + wink |
| Debugger breakpoint | Surprised "O" mouth |
| Long idle (2 min) | Half-closed sleepy eyes + breathing |

### Themes

| Theme | Description |
|---|---|
| **Classic** | Black eyes, line mouth, transparent background |
| **Neon** | Cyan eyes, pink mouth, dark glow |
| **Pastel** | Soft purple/pink, rounded shapes |
| **Retro Pixel** | Green on black, pixel-art rendering |
| **Minimal Mono** | Matches VS Code's foreground colour automatically |
| **custom** | Define your own colours in settings |

---

## Installation & Running in Extension Development Host

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [VS Code](https://code.visualstudio.com/) 1.95+

### Steps

```bash
# 1. Clone / open the project folder
cd "C:/Users/Muhammed Sajid/Documents/Projects/CodeMate"

# 2. Install dependencies
npm install

# 3. Compile TypeScript
npm run compile
# or watch mode
npm run watch

# 4. Press F5 in VS Code (or Run → Start Debugging)
#    This opens a new Extension Development Host window.

# 5. In the Host window, open the CodeMate panel:
#    Click the 👁️ face icon in the Activity Bar on the left.
```

---

## Settings

Open **Settings** (`Ctrl+,`) and search for **CodeMate**:

| Setting | Default | Description |
|---|---|---|
| `codemate.theme` | `Classic` | Select a preset or `custom` |
| `codemate.size` | `medium` | `small` / `medium` / `large` |
| `codemate.position` | `bottom-right` | Which corner the face sits in |
| `codemate.reactionIntensity` | `normal` | `off` / `subtle` / `normal` / `playful` |
| `codemate.customColors` | `{}` | `eyeColor`, `mouthColor`, `backgroundColor` |
| `codemate.enableErrorReaction` | `true` | Toggle error reactions |
| `codemate.enableIdleReaction` | `true` | Toggle idle/sleep |
| `codemate.enableSaveReaction` | `true` | Toggle save wink |
| `codemate.enableDebugReaction` | `true` | Toggle debug reactions |
| `codemate.enableTypingBurstReaction` | `true` | Toggle burst detection |

All settings update the face **live** without requiring a reload.

---

## Adding a Custom Theme

Themes are defined in [`src/themes.ts`](src/themes.ts). To add a new one:

### 1. Add a preset object

```typescript
// src/themes.ts
export const themes: Record<string, Theme> = {
  // … existing themes …

  'Cyber Punk': {
    name: 'Cyber Punk',
    eyeColor: '#ff2d78',
    scleraColor: '#1a001a',
    eyeOutlineColor: '#ff2d78',
    mouthColor: '#ffe600',
    backgroundColor: 'transparent',
    glow: '0 0 10px #ff2d78, 0 0 20px #ff2d78',
    strokeWidth: 2.5,
  },
};
```

### 2. Register the enum value in `package.json`

```json
"codemate.theme": {
  "enum": ["Classic", "Neon", "Pastel", "Retro Pixel", "Minimal Mono", "Cyber Punk", "custom"]
}
```

### 3. Recompile (`npm run compile`) and reload the Extension Host.

That's it — the theme is now selectable from Settings.

---

## Project Structure

```
CodeMate/
├── media/
│   ├── character.html   # Webview HTML template
│   ├── character.css    # All styles & keyframe animations
│   ├── character.js     # Expression state machine + message handler
│   └── icon.svg         # Activity bar icon
├── src/
│   ├── extension.ts             # Activation, event listeners
│   ├── CodeMateViewProvider.ts  # WebviewViewProvider
│   ├── themes.ts                # Theme preset definitions
│   └── types.ts                 # Shared TypeScript types
├── package.json
└── tsconfig.json
```

---

## License

