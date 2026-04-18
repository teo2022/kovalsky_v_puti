(function () {
    const appUrl = document.body.dataset.appUrl || './v2/index.html';
    const swUrl = document.body.dataset.swUrl || './sw.js';
    const installButtons = Array.from(document.querySelectorAll('[data-install-app]'));
    let deferredPrompt = null;

    function setButtonState(label, disabled = false) {
        installButtons.forEach(button => {
            button.textContent = label;
            button.disabled = disabled;
        });
    }

    function showIosHint() {
        window.alert('Чтобы установить приложение на iPhone или iPad, открой страницу в Safari, нажми "Поделиться" и выбери "На экран Домой".');
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
