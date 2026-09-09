// ─────────────────────────────────────────────────────────────────────────────
// CodeMateViewProvider.ts  ·  WebviewViewProvider implementation
// ─────────────────────────────────────────────────────────────────────────────

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { getTheme } from './themes';
import { CodeMateSettings, WebviewMessage } from './types';

export class CodeMateViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'codemateView';

  private _view?: vscode.WebviewView;

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    this._view = webviewView;

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [
        vscode.Uri.joinPath(this._extensionUri, 'media'),
      ],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Once loaded, send the current settings
    webviewView.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'ready') {
        this.sendSettings();
      }
    });
  }

  /** Send any WebviewMessage to the active view */
  public postMessage(message: WebviewMessage) {
    this._view?.webview.postMessage(message);
  }

  /** Read current VS Code settings and push to webview */
  public sendSettings() {
    const cfg = vscode.workspace.getConfiguration('codemate');
    const settings: CodeMateSettings = {
      theme: cfg.get<string>('theme', 'Classic'),
      size: cfg.get<'small' | 'medium' | 'large'>('size', 'medium'),
      position: cfg.get<CodeMateSettings['position']>('position', 'bottom-right'),
      reactionIntensity: cfg.get<CodeMateSettings['reactionIntensity']>('reactionIntensity', 'normal'),
      customColors: cfg.get<CodeMateSettings['customColors']>('customColors', {}),
      enableErrorReaction: cfg.get<boolean>('enableErrorReaction', true),
      enableIdleReaction: cfg.get<boolean>('enableIdleReaction', true),
      enableSaveReaction: cfg.get<boolean>('enableSaveReaction', true),
      enableDebugReaction: cfg.get<boolean>('enableDebugReaction', true),
      enableTypingBurstReaction: cfg.get<boolean>('enableTypingBurstReaction', true),
    };

    this.postMessage({ type: 'settings', settings });

    // Also resolve and send the concrete theme object
    let theme = getTheme(settings.theme);
    if (settings.theme === 'custom' && settings.customColors) {
      theme = {
        ...theme,
        eyeColor: settings.customColors.eyeColor ?? theme.eyeColor,
        mouthColor: settings.customColors.mouthColor ?? theme.mouthColor,
        backgroundColor: settings.customColors.backgroundColor ?? theme.backgroundColor,
      };
    }
    this.postMessage({ type: 'theme', theme });
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    const mediaPath = vscode.Uri.joinPath(this._extensionUri, 'media');
    const cssUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'character.css'));
    const jsUri = webview.asWebviewUri(vscode.Uri.joinPath(mediaPath, 'character.js'));

    // Read the HTML template and inject CSP-safe URIs
    const htmlPath = vscode.Uri.joinPath(mediaPath, 'character.html');
    let html = fs.readFileSync(htmlPath.fsPath, 'utf8');
    html = html
      .replace('{{CSS_URI}}', cssUri.toString())
      .replace('{{JS_URI}}', jsUri.toString())
      .replace(/{{CSP_SOURCE}}/g, webview.cspSource);
    return html;
  }
}
