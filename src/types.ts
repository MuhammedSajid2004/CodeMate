// ─────────────────────────────────────────────────────────────────────────────
// types.ts  ·  Shared type definitions for CodeMate
// ─────────────────────────────────────────────────────────────────────────────

export type ExpressionName =
  | 'idle'
  | 'typing'
  | 'typingBurst'
  | 'enter'
  | 'tab'
  | 'delete'
  | 'paste'
  | 'cut'
  | 'undo'
  | 'redo'
  | 'comment'
  | 'format'
  | 'fileSwitch'
  | 'error'
  | 'clearError'
  | 'save'
  | 'debugBreak'
  | 'debugEnd'
  | 'sleepy'
  | 'yawn'
  | 'blink';

export type ReactionIntensity = 'off' | 'subtle' | 'normal' | 'playful';

export interface CodeMateSettings {
  theme: string;
  size: 'small' | 'medium' | 'large';
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'draggable';
  reactionIntensity: ReactionIntensity;
  customColors: {
    eyeColor?: string;
    mouthColor?: string;
    backgroundColor?: string;
  };
  enableErrorReaction: boolean;
  enableIdleReaction: boolean;
  enableSaveReaction: boolean;
  enableDebugReaction: boolean;
  enableTypingBurstReaction: boolean;
}

// Messages from extension host → webview
export type WebviewMessage =
  | { type: 'expression'; name: ExpressionName }
  | { type: 'settings'; settings: CodeMateSettings }
  | { type: 'theme'; theme: import('./themes').Theme };
