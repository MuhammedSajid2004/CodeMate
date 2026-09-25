// ─────────────────────────────────────────────────────────────────────────────
// character.js  ·  CodeMate – webview-side rendering & expression state machine
// Runs entirely inside the VS Code WebviewView context (no module system).
// ─────────────────────────────────────────────────────────────────────────────
// 

(function () {
  'use strict';

  const vscode = acquireVsCodeApi();

  const root    = document.getElementById('codemate-root');
  const face    = document.getElementById('face');
  const mouth   = document.getElementById('mouth');
  const eyeL    = document.getElementById('eye-left');
  const eyeR    = document.getElementById('eye-right');
  const pupilL  = document.getElementById('pupil-left');
  const pupilR  = document.getElementById('pupil-right');

  const MOUTH_PATHS = {
    smile:     'M 58 108 Q 80 120 102 108',
    bigSmile:  'M 52 106 Q 80 126 108 106',
    flat:      'M 60 110 L 100 110',
    frown:     'M 58 114 Q 80 104 102 114',
    surprised: 'M 72 108 Q 80 120 88 108 Q 80 98 72 108',
    smirk:     'M 58 110 Q 72 118 86 108 Q 94 106 104 108',
    sleepy:    'M 62 111 Q 80 116 98 111',
    yawn:      'M 68 104 Q 80 128 92 104 Q 80 96 68 104',
    squiggle:  'M 56 110 Q 66 104 80 110 Q 94 116 104 110',
    determined:'M 56 112 L 104 112',
    chew:      'M 62 108 Q 80 118 98 108 Q 80 114 62 108',
  };

  let currentExpression = 'idle';
  let isBlinking        = false;
  let blinkTimeout      = null;
  let expressionTimeout = null;
  let isSleepy          = false;

  function setCssVar(name, value) {
    document.documentElement.style.setProperty(name, value);
  }

  function applyTheme(theme) {
    setCssVar('--eye-color',         theme.eyeColor);
    setCssVar('--sclera-color',      theme.scleraColor);
    setCssVar('--eye-outline-color', 'transparent');
    setCssVar('--mouth-color',       theme.mouthColor);
    setCssVar('--bg-color',          theme.backgroundColor || 'transparent');
    setCssVar('--face-fill',         theme.eyeColor || 'var(--vscode-foreground, #cccccc)');
    setCssVar('--stroke-width',      (theme.strokeWidth || 2.4) + 'px');
    setCssVar('--glow',              theme.glow || 'none');

    if (theme.pixelStyle) {
      face.classList.add('pixel-style');
    } else {
      face.classList.remove('pixel-style');
    }

    // Glow only on features so the circular head stays borderless
    const glow = theme.glow ? `drop-shadow(${theme.glow.split(',')[0]})` : '';
    pupilL.style.filter = glow;
    pupilR.style.filter = glow;
    mouth.style.filter  = glow;
    face.style.filter   = '';
  }

  function applySettings(settings) {
    root.classList.remove('size-small', 'size-medium', 'size-large');
    root.classList.add('size-' + (settings.size || 'medium'));
    applyPosition(settings.position || 'bottom-right');
    if (settings.position === 'draggable') {
      enableDrag();
    }
  }

  function applyPosition(pos) {
    root.style.top    = '';
    root.style.left   = '';
    root.style.bottom = '';
    root.style.right  = '';

    switch (pos) {
      case 'top-left':
        root.style.top  = '12px';
        root.style.left = '12px';
        break;
      case 'top-right':
        root.style.top   = '12px';
        root.style.right = '12px';
        break;
      case 'bottom-left':
        root.style.bottom = '12px';
        root.style.left   = '12px';
        break;
      case 'bottom-right':
      default:
        root.style.bottom = '12px';
        root.style.right  = '12px';
        break;
    }
  }

  function enableDrag() {
    root.classList.add('draggable');
    let startX, startY, startL, startT;

    root.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      const rect = root.getBoundingClientRect();
      startL = rect.left;
      startT = rect.top;
      root.style.right  = '';
      root.style.bottom = '';

      const onMove = (me) => {
        root.style.left = (startL + me.clientX - startX) + 'px';
        root.style.top  = (startT + me.clientY - startY) + 'px';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  function setMouth(key) {
    mouth.setAttribute('d', MOUTH_PATHS[key] || MOUTH_PATHS.flat);
  }

  function setEyeState(state) {
    [eyeL, eyeR].forEach((el) => {
      el.classList.remove('closed', 'sleepy', 'wink');
      if (state) { el.classList.add(state); }
    });
  }

  function blink() {
    if (isBlinking || isSleepy) { return; }
    isBlinking = true;
    setEyeState('closed');
    setTimeout(() => {
      if (!isSleepy && currentExpression !== 'sleepy') {
        setEyeState('');
      }
      isBlinking = false;
    }, 130);
  }

  function scheduleNextBlink() {
    const delay = 3000 + Math.random() * 3000;
    blinkTimeout = setTimeout(() => {
      if (!isSleepy) { blink(); }
      scheduleNextBlink();
    }, delay);
  }

  function lookAt(dx, dy) {
    const cx = Math.max(-5, Math.min(5, dx));
    const cy = Math.max(-5, Math.min(5, dy));
    pupilL.setAttribute('cx', String(cx));
    pupilL.setAttribute('cy', String(1.5 + cy));
    pupilR.setAttribute('cx', String(cx));
    pupilR.setAttribute('cy', String(1.5 + cy));
  }

  function resetPupils() { lookAt(0, 0); }

  const MOTION = ['bouncing', 'shaking', 'pulsing', 'winking', 'nodding', 'writing', 'glancing', 'sleepy', 'dizzy', 'peeking', 'tilting'];

  function flashClass(cls, durationMs) {
    root.classList.add(cls);
    setTimeout(() => root.classList.remove(cls), durationMs);
  }

  function clearMotion() {
    root.classList.remove(...MOTION);
  }

  function setExpression(name) {
    currentExpression = name;
    isSleepy = false;
    clearMotion();
    setEyeState('');
    resetPupils();

    if (expressionTimeout) {
      clearTimeout(expressionTimeout);
      expressionTimeout = null;
    }

    switch (name) {
      case 'idle':
        setMouth('smile');
        break;

      case 'typing':
        setMouth('flat');
        lookAt(1.5, 2.5);
        root.classList.add('writing');
        revertAfter(1800);
        break;

      case 'typingBurst':
        setMouth('surprised');
        flashClass('pulsing', 400);
        lookAt(0, -3);
        revertAfter(2200);
        break;

      case 'enter':
        setMouth('determined');
        lookAt(0, 3);
        flashClass('nodding', 450);
        revertAfter(900);
        break;

      case 'tab':
        setMouth('smirk');
        lookAt(5, 0);
        flashClass('glancing', 450);
        revertAfter(900);
        break;

      case 'delete':
        setMouth('frown');
        lookAt(-1, 2);
        flashClass('shaking', 280);
        revertAfter(700);
        break;

      case 'paste':
        setMouth('surprised');
        lookAt(0, -3);
        flashClass('pulsing', 420);
        revertAfter(1400);
        break;

      case 'cut':
        setMouth('frown');
        lookAt(-4, 1);
        flashClass('tilting', 400);
        revertAfter(900);
        break;

      case 'undo':
        setMouth('squiggle');
        lookAt(-3, 0);
        flashClass('dizzy', 550);
        revertAfter(1100);
        break;

      case 'redo':
        setMouth('determined');
        lookAt(3, 0);
        flashClass('nodding', 420);
        revertAfter(900);
        break;

      case 'comment':
        setMouth('smirk');
        lookAt(2, 1);
        eyeL.classList.add('wink');
        setTimeout(() => eyeL.classList.remove('wink'), 360);
        revertAfter(1200);
        break;

      case 'format':
        setMouth('chew');
        lookAt(0, 2);
        flashClass('pulsing', 350);
        revertAfter(1100);
        break;

      case 'fileSwitch':
        setMouth('flat');
        lookAt(-5, 0);
        flashClass('peeking', 700);
        setTimeout(() => lookAt(5, 0), 280);
        setTimeout(() => resetPupils(), 700);
        revertAfter(1200);
        break;

      case 'error':
        setMouth('squiggle');
        flashClass('shaking', 450);
        lookAt(0, 3);
        break;

      case 'clearError':
        setMouth('bigSmile');
        flashClass('bouncing', 600);
        lookAt(0, -2);
        revertAfter(3000);
        break;

      case 'save':
        setMouth('smirk');
        eyeL.classList.add('wink');
        setTimeout(() => eyeL.classList.remove('wink'), 360);
        revertAfter(2000);
        break;

      case 'debugBreak':
        setMouth('surprised');
        lookAt(0, -4);
        revertAfter(4000);
        break;

      case 'debugEnd':
        setMouth('bigSmile');
        lookAt(0, -2);
        flashClass('bouncing', 600);
        revertAfter(2200);
        break;

      case 'sleepy':
        isSleepy = true;
        setMouth('sleepy');
        setEyeState('sleepy');
        root.classList.add('sleepy');
        break;

      case 'yawn':
        setMouth('yawn');
        setEyeState('sleepy');
        setTimeout(() => {
          setMouth('sleepy');
          setEyeState('sleepy');
        }, 1500);
        break;

      case 'blink':
        blink();
        break;
    }
  }

  function revertAfter(ms) {
    expressionTimeout = setTimeout(() => {
      setExpression('idle');
    }, ms);
  }

  window.addEventListener('message', (event) => {
    const msg = event.data;
    switch (msg.type) {
      case 'expression':
        setExpression(msg.name);
        break;
      case 'theme':
        applyTheme(msg.theme);
        break;
      case 'settings':
        applySettings(msg.settings);
        break;
    }
  });

  setInterval(() => {
    if (isSleepy && Math.random() < 0.25) {
      setExpression('yawn');
      setTimeout(() => {
        isSleepy = true;
        setMouth('sleepy');
        setEyeState('sleepy');
        root.classList.add('sleepy');
      }, 2000);
    }
  }, 8000);

  function init() {
    root.classList.add('size-medium');
    applyPosition('bottom-right');
    setExpression('idle');
    scheduleNextBlink();
    vscode.postMessage({ type: 'ready' });
  }

  init();
})();
