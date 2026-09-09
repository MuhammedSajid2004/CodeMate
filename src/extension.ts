// ─────────────────────────────────────────────────────────────────────────────
// extension.ts  ·  CodeMate – activation entry point
// ─────────────────────────────────────────────────────────────────────────────

import * as vscode from 'vscode';
import { CodeMateViewProvider } from './CodeMateViewProvider';
import { ExpressionName } from './types';

// ── Tuneable constants ────────────────────────────────────────────────────────
const IDLE_THRESHOLD_MS = 2 * 60 * 1000; // 2 minutes until "sleepy"
const BURST_WINDOW_MS = 3_000;            // window to count keystrokes for "burst"
const BURST_THRESHOLD = 30;              // keystrokes in window to trigger burst

/** Classify editor edits so each action can drive its own face animation. */
function classifyDocumentChange(e: vscode.TextDocumentChangeEvent): ExpressionName | undefined {
  if (e.reason === vscode.TextDocumentChangeReason.Undo) { return 'undo'; }
  if (e.reason === vscode.TextDocumentChangeReason.Redo) { return 'redo'; }
  if (e.contentChanges.length >= 8) { return 'format'; }

  let sawEnter = false;
  let sawTab = false;
  let sawDelete = false;
  let sawComment = false;
  let inserted = 0;
  let deleted = 0;

  for (const change of e.contentChanges) {
    const text = change.text;
    deleted += change.rangeLength;

    if (text.includes('\n')) {
      sawEnter = true;
    } else if (isCommentInsert(text)) {
      sawComment = true;
      inserted += text.length;
    } else if (text === '\t' || (/^[ \t]+$/.test(text) && text.length >= 2)) {
      sawTab = true;
    } else if (text === '' && change.rangeLength > 0) {
      sawDelete = true;
    } else {
      inserted += text.length;
    }
  }

  if (sawEnter) { return 'enter'; }
  if (sawComment) { return 'comment'; }
  if (sawTab) { return 'tab'; }
  if (sawDelete && inserted === 0) {
    return deleted > 40 ? 'cut' : 'delete';
  }
  if (inserted > 80) { return 'paste'; }
  return undefined;
}

function isCommentInsert(text: string): boolean {
  const t = text.trimStart();
  return (
    t.startsWith('//') ||
    t.startsWith('/*') ||
    t.startsWith('--') ||
    t.startsWith('<!--') ||
    /^#\s/.test(t)
  );
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new CodeMateViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      CodeMateViewProvider.viewType,
      provider,
      { webviewOptions: { retainContextWhenHidden: true } }
    )
  );

  // ── Typing / idle tracking ────────────────────────────────────────────────
  let idleTimer: ReturnType<typeof setTimeout> | undefined;
  let keystrokeCount = 0;
  let burstTimer: ReturnType<typeof setTimeout> | undefined;
  let isIdle = false;
  let errorCount = 0;

  function resetIdleTimer() {
    if (idleTimer) { clearTimeout(idleTimer); }
    if (isIdle) {
      isIdle = false;
      provider.postMessage({ type: 'expression', name: 'idle' });
    }
    idleTimer = setTimeout(() => {
      const cfg = vscode.workspace.getConfiguration('codemate');
      if (!cfg.get<boolean>('enableIdleReaction', true)) { return; }
      isIdle = true;
      provider.postMessage({ type: 'expression', name: 'sleepy' });
    }, IDLE_THRESHOLD_MS);
  }

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument((e) => {
      if (!e.contentChanges.length) { return; }

      resetIdleTimer();

      const special = classifyDocumentChange(e);
      if (special) {
        provider.postMessage({ type: 'expression', name: special });
        return;
      }

      provider.postMessage({ type: 'expression', name: 'typing' });

      const cfg = vscode.workspace.getConfiguration('codemate');
      if (cfg.get<boolean>('enableTypingBurstReaction', true)) {
        keystrokeCount += e.contentChanges.length;
        if (!burstTimer) {
          burstTimer = setTimeout(() => {
            if (keystrokeCount >= BURST_THRESHOLD) {
              provider.postMessage({ type: 'expression', name: 'typingBurst' });
            }
            keystrokeCount = 0;
            burstTimer = undefined;
          }, BURST_WINDOW_MS);
        }
      }
    })
  );

  // ── Save ──────────────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(() => {
      const cfg = vscode.workspace.getConfiguration('codemate');
      if (!cfg.get<boolean>('enableSaveReaction', true)) { return; }
      resetIdleTimer();
      provider.postMessage({ type: 'expression', name: 'save' });
    })
  );

  // ── Diagnostics / errors ──────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.languages.onDidChangeDiagnostics((e) => {
      const cfg = vscode.workspace.getConfiguration('codemate');
      if (!cfg.get<boolean>('enableErrorReaction', true)) { return; }

      // Count errors across all URIs in the event
      let newCount = 0;
      for (const uri of e.uris) {
        const diags = vscode.languages.getDiagnostics(uri);
        newCount += diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error).length;
      }

      if (newCount > errorCount) {
        provider.postMessage({ type: 'expression', name: 'error' });
      } else if (newCount === 0 && errorCount > 0) {
        provider.postMessage({ type: 'expression', name: 'clearError' });
      }
      errorCount = newCount;
    })
  );

  // ── Debug ─────────────────────────────────────────────────────────────────
  context.subscriptions.push(
    vscode.debug.onDidChangeBreakpoints((e) => {
      const cfg = vscode.workspace.getConfiguration('codemate');
      if (!cfg.get<boolean>('enableDebugReaction', true)) { return; }
      if (e.added.length || e.changed.length) {
        provider.postMessage({ type: 'expression', name: 'debugBreak' });
      }
    })
  );

  context.subscriptions.push(
    vscode.debug.onDidStartDebugSession(() => {
      const cfg = vscode.workspace.getConfiguration('codemate');
      if (!cfg.get<boolean>('enableDebugReaction', true)) { return; }
      provider.postMessage({ type: 'expression', name: 'debugBreak' });
    })
  );

  context.subscriptions.push(
    vscode.debug.onDidTerminateDebugSession(() => {
      const cfg = vscode.workspace.getConfiguration('codemate');
      if (!cfg.get<boolean>('enableDebugReaction', true)) { return; }
      resetIdleTimer();
      provider.postMessage({ type: 'expression', name: 'debugEnd' });
    })
  );

  context.subscriptions.push(
    vscode.window.onDidChangeActiveTextEditor(() => {
      resetIdleTimer();
      provider.postMessage({ type: 'expression', name: 'fileSwitch' });
    })
  );

  // ── Settings changes → live update ───────────────────────────────────────
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('codemate')) {
        provider.sendSettings();
      }
    })
  );

  // Start idle timer immediately
  resetIdleTimer();
}

export function deactivate() {}
