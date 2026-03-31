/**
 * Painel de Acessibilidade — Pinacoteca Fayga Ostrower
 * Gerencia todas as opções de acessibilidade com persistência em localStorage.
 */

(function () {
    'use strict';

    const PANEL_HTML = `
    <div class="acc-panel" id="accPanel" role="dialog" aria-modal="true" aria-label="Painel de Acessibilidade">
        <div class="acc-panel-header">
            <h3><i class="fas fa-universal-access"></i> Acessibilidade</h3>
            <button class="acc-panel-close" id="accPanelClose" aria-label="Fechar painel">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="acc-panel-body">

            <!-- Tamanho do Texto -->
            <div class="acc-option-group">
                <div class="acc-option-label">
                    <i class="fas fa-text-height"></i> Tamanho do Texto
                </div>
                <div class="acc-btn-group">
                    <button class="acc-btn active" id="accFontNormal" aria-pressed="true">
                        <i class="fas fa-font" style="font-size:0.7rem"></i> Normal
                    </button>
                    <button class="acc-btn" id="accFontLarge" aria-pressed="false">
                        <i class="fas fa-font" style="font-size:0.85rem"></i> Grande
                    </button>
                    <button class="acc-btn" id="accFontXLarge" aria-pressed="false">
                        <i class="fas fa-font"></i> Muito Grande
                    </button>
                </div>
            </div>

            <!-- Contraste -->
            <div class="acc-option-group">
                <div class="acc-option-label">
                    <i class="fas fa-adjust"></i> Contraste
                </div>
                <div class="acc-toggle-row">
                    <span><i class="fas fa-moon" style="margin-right:0.4rem;opacity:0.6"></i> Alto Contraste</span>
                    <label class="acc-switch" aria-label="Alto contraste">
                        <input type="checkbox" id="accHighContrast">
                        <span class="acc-switch-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Fonte para Dislexia -->
            <div class="acc-option-group">
                <div class="acc-option-label">
                    <i class="fas fa-book-open"></i> Leitura
                </div>
                <div class="acc-toggle-row">
                    <span><i class="fas fa-spell-check" style="margin-right:0.4rem;opacity:0.6"></i> Fonte para Dislexia</span>
                    <label class="acc-switch" aria-label="Fonte para dislexia">
                        <input type="checkbox" id="accDyslexia">
                        <span class="acc-switch-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Movimento e Cursor -->
            <div class="acc-option-group">
                <div class="acc-option-label">
                    <i class="fas fa-sliders-h"></i> Interação
                </div>
                <div style="display:flex; flex-direction:column; gap:0.8rem;">
                    <div class="acc-toggle-row">
                        <span><i class="fas fa-ban" style="margin-right:0.4rem;opacity:0.6"></i> Reduzir Animações</span>
                        <label class="acc-switch" aria-label="Reduzir animações">
                            <input type="checkbox" id="accReduceMotion">
                            <span class="acc-switch-slider"></span>
                        </label>
                    </div>
                    <div class="acc-toggle-row">
                        <span><i class="fas fa-mouse-pointer" style="margin-right:0.4rem;opacity:0.6"></i> Cursor Ampliado</span>
                        <label class="acc-switch" aria-label="Cursor ampliado">
                            <input type="checkbox" id="accLargeCursor">
                            <span class="acc-switch-slider"></span>
                        </label>
                    </div>
                </div>
            </div>

            <!-- Foco Visível -->
            <div class="acc-option-group">
                <div class="acc-option-label">
                    <i class="fas fa-keyboard"></i> Navegação
                </div>
                <div class="acc-toggle-row">
                    <span><i class="fas fa-border-style" style="margin-right:0.4rem;opacity:0.6"></i> Destacar Foco do Teclado</span>
                    <label class="acc-switch" aria-label="Destacar foco do teclado">
                        <input type="checkbox" id="accHighlightFocus">
                        <span class="acc-switch-slider"></span>
                    </label>
                </div>
            </div>

            <!-- Reset -->
            <button class="acc-reset-btn" id="accReset">
                <i class="fas fa-undo"></i> Restaurar Padrões
            </button>
        </div>
    </div>`;

    function init() {
        // Inject panel into body
        document.body.insertAdjacentHTML('beforeend', PANEL_HTML);

        const trigger = document.querySelector('.acc-trigger');
        const panel = document.getElementById('accPanel');
        const closeBtn = document.getElementById('accPanelClose');

        if (!trigger || !panel) return;

        // --- Toggle Panel ---
        trigger.addEventListener('click', () => {
            const isOpen = panel.classList.toggle('open');
            trigger.classList.toggle('active', isOpen);
            trigger.setAttribute('aria-expanded', isOpen);
            if (isOpen) closeBtn.focus();
        });

        // Close on Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && panel.classList.contains('open')) {
                panel.classList.remove('open');
                trigger.classList.remove('active');
                trigger.focus();
            }
        });

        // Close when clicking outside panel & trigger
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target) && !trigger.contains(e.target)) {
                panel.classList.remove('open');
                trigger.classList.remove('active');
            }
        });

        closeBtn.addEventListener('click', () => {
            panel.classList.remove('open');
            trigger.classList.remove('active');
            trigger.focus();
        });

        // --- Font Size ---
        const fontBtns = {
            normal: document.getElementById('accFontNormal'),
            large:  document.getElementById('accFontLarge'),
            xlarge: document.getElementById('accFontXLarge'),
        };

        function setFont(size) {
            document.body.classList.remove('acc-large-text', 'acc-xlarge-text');
            Object.values(fontBtns).forEach(b => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });

            if (size === 'large') {
                document.body.classList.add('acc-large-text');
                fontBtns.large.classList.add('active'); fontBtns.large.setAttribute('aria-pressed', 'true');
            } else if (size === 'xlarge') {
                document.body.classList.add('acc-xlarge-text');
                fontBtns.xlarge.classList.add('active'); fontBtns.xlarge.setAttribute('aria-pressed', 'true');
            } else {
                fontBtns.normal.classList.add('active'); fontBtns.normal.setAttribute('aria-pressed', 'true');
            }
            save('accFont', size);
        }

        fontBtns.normal.addEventListener('click', () => setFont('normal'));
        fontBtns.large.addEventListener('click',  () => setFont('large'));
        fontBtns.xlarge.addEventListener('click', () => setFont('xlarge'));

        // --- Toggles ---
        function bindToggle(id, bodyClass, storageKey) {
            const checkbox = document.getElementById(id);
            if (!checkbox) return;

            checkbox.addEventListener('change', () => {
                document.body.classList.toggle(bodyClass, checkbox.checked);
                save(storageKey, checkbox.checked);
            });

            return checkbox;
        }

        const toggleContrastCb   = bindToggle('accHighContrast',   'acc-high-contrast',   'accHighContrast');
        const toggleDyslexiaCb   = bindToggle('accDyslexia',       'acc-dyslexia-font',   'accDyslexia');
        const toggleMotionCb     = bindToggle('accReduceMotion',    'acc-reduced-motion',  'accReduceMotion');
        const toggleCursorCb     = bindToggle('accLargeCursor',     'acc-large-cursor',    'accLargeCursor');
        const toggleFocusCb      = bindToggle('accHighlightFocus',  'acc-focus-highlight', 'accHighlightFocus');

        // Highlight focus CSS
        const focusStyle = document.createElement('style');
        focusStyle.id = 'acc-focus-style';
        focusStyle.textContent = 'body.acc-focus-highlight *:focus { outline: 3px solid #FFD700 !important; outline-offset: 4px !important; box-shadow: 0 0 0 6px rgba(255,215,0,0.3) !important; }';
        document.head.appendChild(focusStyle);

        // --- Reset ---
        document.getElementById('accReset').addEventListener('click', () => {
            setFont('normal');
            [toggleContrastCb, toggleDyslexiaCb, toggleMotionCb, toggleCursorCb, toggleFocusCb].forEach(cb => {
                if (cb) { cb.checked = false; cb.dispatchEvent(new Event('change')); }
            });
            localStorage.removeItem('accPrefs');
        });

        // --- Persistence (localStorage) ---
        function save(key, value) {
            try {
                const prefs = JSON.parse(localStorage.getItem('accPrefs') || '{}');
                prefs[key] = value;
                localStorage.setItem('accPrefs', JSON.stringify(prefs));
            } catch(e) {}
        }

        function loadPreferences() {
            try {
                const prefs = JSON.parse(localStorage.getItem('accPrefs') || '{}');
                if (prefs.accFont) setFont(prefs.accFont);

                const map = [
                    { key: 'accHighContrast',   cb: toggleContrastCb  },
                    { key: 'accDyslexia',       cb: toggleDyslexiaCb  },
                    { key: 'accReduceMotion',   cb: toggleMotionCb    },
                    { key: 'accLargeCursor',    cb: toggleCursorCb    },
                    { key: 'accHighlightFocus', cb: toggleFocusCb     },
                ];
                map.forEach(({ key, cb }) => {
                    if (prefs[key] && cb) {
                        cb.checked = true;
                        cb.dispatchEvent(new Event('change'));
                    }
                });
            } catch(e) {}
        }

        loadPreferences();
    }

    // Run after DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
