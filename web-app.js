(function () {
    const appUrl = document.body.dataset.appUrl || './v2/index.html';
    const swUrl = document.body.dataset.swUrl || './sw.js';
    const installButtons = Array.from(document.querySelectorAll('[data-install-app]'));
    const IOS_HINT_KEY = 'kovalsky_v_puti_ios_install_hint_seen';
    let deferredPrompt = null;
    let iosInstallModal = null;

    const ua = window.navigator.userAgent || '';
    const isIos = /iphone|ipad|ipod/i.test(ua);
    const isSafari = isIos && /safari/i.test(ua) && !/crios|fxios|edgios|opr\//i.test(ua);
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    function ensureIosInstallModal() {
        if (iosInstallModal) {
            return iosInstallModal;
        }

        const style = document.createElement('style');
        style.textContent = `
            .ios-install-backdrop {
                position: fixed;
                inset: 0;
                display: flex;
                align-items: flex-end;
                justify-content: center;
                padding: 16px;
                background: rgba(16, 23, 21, 0.46);
                backdrop-filter: blur(8px);
                z-index: 999;
            }

            .ios-install-backdrop[hidden] {
                display: none;
            }

            .ios-install-sheet {
                width: min(100%, 430px);
                border-radius: 28px;
                background: rgba(255, 252, 247, 0.98);
                color: #18322f;
                padding: 18px;
                border: 1px solid rgba(255, 255, 255, 0.8);
                box-shadow: 0 24px 60px rgba(15, 26, 24, 0.24);
            }

            .ios-install-kicker {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 0.14em;
                color: rgba(24, 50, 47, 0.58);
            }

            .ios-install-title {
                margin: 10px 0 8px;
                font-size: 24px;
                line-height: 1.08;
                font-weight: 800;
            }

            .ios-install-copy {
                margin: 0;
                font-size: 14px;
                line-height: 1.5;
                color: rgba(24, 50, 47, 0.72);
            }

            .ios-install-steps {
                display: grid;
                gap: 10px;
                margin: 16px 0 0;
                padding: 0;
                list-style: none;
            }

            .ios-install-step {
                display: flex;
                gap: 12px;
                align-items: flex-start;
                padding: 12px 14px;
                border-radius: 18px;
                background: rgba(24, 50, 47, 0.06);
            }

            .ios-install-step-index {
                width: 28px;
                height: 28px;
                border-radius: 999px;
                display: grid;
                place-items: center;
                flex: 0 0 auto;
                background: #18322f;
                color: #f8f3eb;
                font-size: 12px;
                font-weight: 800;
            }

            .ios-install-step strong {
                display: block;
                margin-bottom: 3px;
                font-size: 14px;
            }

            .ios-install-step span {
                display: block;
                font-size: 13px;
                line-height: 1.45;
                color: rgba(24, 50, 47, 0.72);
            }

            .ios-install-actions {
                display: flex;
                gap: 10px;
                margin-top: 16px;
            }

            .ios-install-button {
                min-height: 46px;
                border-radius: 999px;
                padding: 0 18px;
                border: 0;
                font: inherit;
                font-weight: 800;
                cursor: pointer;
            }

            .ios-install-button.primary {
                background: linear-gradient(135deg, #d95b37, #ef824a);
                color: #fffaf3;
            }

            .ios-install-button.secondary {
                background: rgba(24, 50, 47, 0.08);
                color: #18322f;
            }
        `;
        document.head.appendChild(style);

        iosInstallModal = document.createElement('div');
        iosInstallModal.className = 'ios-install-backdrop';
        iosInstallModal.hidden = true;
        iosInstallModal.innerHTML = `
            <div class="ios-install-sheet" role="dialog" aria-modal="true" aria-labelledby="ios-install-title">
                <div class="ios-install-kicker">Установка на iPhone и iPad</div>
                <h2 id="ios-install-title" class="ios-install-title">Как установить приложение</h2>
                <p class="ios-install-copy" data-ios-copy></p>
                <ol class="ios-install-steps" data-ios-steps></ol>
                <div class="ios-install-actions">
                    <button type="button" class="ios-install-button secondary" data-ios-close>Понятно</button>
                    <button type="button" class="ios-install-button primary" data-ios-open>Открыть приложение</button>
                </div>
            </div>
        `;

        iosInstallModal.addEventListener('click', event => {
            if (event.target === iosInstallModal) {
                iosInstallModal.hidden = true;
            }
        });

        iosInstallModal.querySelector('[data-ios-close]').addEventListener('click', () => {
            iosInstallModal.hidden = true;
        });

        iosInstallModal.querySelector('[data-ios-open]').addEventListener('click', () => {
            iosInstallModal.hidden = true;
            openApp();
        });

        document.body.appendChild(iosInstallModal);
        return iosInstallModal;
    }

    function setButtonState(label, disabled = false) {
        installButtons.forEach(button => {
            button.textContent = label;
            button.disabled = disabled;
        });
    }

    function showIosHint() {
        const modal = ensureIosInstallModal();
        const copy = modal.querySelector('[data-ios-copy]');
        const steps = modal.querySelector('[data-ios-steps]');

        if (isSafari) {
            copy.textContent = 'На iOS установка запускается не кнопкой, а через системное меню Safari. После добавления на экран домой приложение будет открываться как отдельное веб-приложение.';
            steps.innerHTML = `
                <li class="ios-install-step">
                    <div class="ios-install-step-index">1</div>
                    <div><strong>Открой страницу в Safari</strong><span>Установка на iPhone и iPad корректно работает именно через Safari.</span></div>
                </li>
                <li class="ios-install-step">
                    <div class="ios-install-step-index">2</div>
                    <div><strong>Нажми «Поделиться»</strong><span>Это кнопка со стрелкой вверх в нижней или верхней панели браузера.</span></div>
                </li>
                <li class="ios-install-step">
                    <div class="ios-install-step-index">3</div>
                    <div><strong>Выбери «На экран Домой»</strong><span>После этого значок появится на домашнем экране и приложение будет открываться отдельно от браузера.</span></div>
                </li>
            `;
        } else {
            copy.textContent = 'Сейчас страница открыта не в Safari. На iPhone и iPad установка как приложения выполняется через Safari, поэтому сначала открой сайт там.';
            steps.innerHTML = `
                <li class="ios-install-step">
                    <div class="ios-install-step-index">1</div>
                    <div><strong>Открой сайт в Safari</strong><span>Если ты сейчас в Chrome или другом браузере, передай ссылку в Safari и открой её там.</span></div>
                </li>
                <li class="ios-install-step">
                    <div class="ios-install-step-index">2</div>
                    <div><strong>Нажми «Поделиться»</strong><span>Это системное меню Safari со стрелкой вверх.</span></div>
                </li>
                <li class="ios-install-step">
                    <div class="ios-install-step-index">3</div>
                    <div><strong>Выбери «На экран Домой»</strong><span>После добавления значок появится на экране и приложение будет открываться без интерфейса браузера.</span></div>
                </li>
            `;
        }

        modal.hidden = false;
    }

    function openApp() {
        window.location.href = appUrl;
    }

    async function tryInstall() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const choice = await deferredPrompt.userChoice;
            deferredPrompt = null;
            if (choice.outcome === 'accepted') {
                setButtonState('Приложение устанавливается', true);
            } else {
                setButtonState('Установить приложение');
            }
            return;
        }

        const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
        if (isIos) {
            showIosHint();
            return;
        }

        openApp();
    }

    installButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            tryInstall();
        });
    });

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        deferredPrompt = event;
        setButtonState('Установить приложение');
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        setButtonState('Приложение установлено', true);
    });

    if (isIos && !isStandalone && installButtons.length) {
        setButtonState(isSafari ? 'Как установить на iPhone' : 'Открыть в Safari');

        if (!window.localStorage.getItem(IOS_HINT_KEY)) {
            window.setTimeout(() => {
                showIosHint();
                window.localStorage.setItem(IOS_HINT_KEY, '1');
            }, 800);
        }
    }

    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register(swUrl)
                .then(registration => registration.update())
                .catch(error => {
                    console.error('Не удалось зарегистрировать service worker', error);
                });
        });
    }
})();
