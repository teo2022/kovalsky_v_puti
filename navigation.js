// Навигация между интерфейсами Дневника путешественника от Ковальского
// Этот скрипт обеспечивает переходы между всеми страницами приложения

const NAV_CONFIG = {
    'index.html': { name: 'export', label: 'Экспорт' },
    'moment.html': { name: 'dashboard', label: 'Дашборд' },
    'drive.html': { name: 'active', label: 'Активный маршрут' },
    'wait.html': { name: 'planned', label: 'Планируемый маршрут' }
};

// Получить текущую страницу
function getCurrentPage() {
    return window.location.pathname.split('/').pop() || 'index.html';
}

// Переход на указанную страницу
function navigateTo(page) {
    const pages = ['index.html', 'moment.html', 'drive.html', 'wait.html'];
    if (pages.includes(page)) {
        window.location.href = page;
    } else {
        console.warn('Страница не найдена:', page);
    }
}

// Функция возврата назад - умная навигация
function goBack() {
    const currentPage = getCurrentPage();
    
    // Если мы на главной странице (moment.html), показываем подсказку
    if (currentPage === 'moment.html') {
        showToast('Вы на главной странице');
        return;
    }
    
    // Для страниц маршрутов - возврат на главную
    if (currentPage === 'drive.html' || currentPage === 'wait.html') {
        // Сначала пытаемся сохранить текущее состояние
        if (typeof saveState === 'function') {
            saveState();
        }
        navigateTo('moment.html');
        return;
    }
    
    // Для index.html - возврат на главную
    if (currentPage === 'index.html') {
        navigateTo('moment.html');
        return;
    }
    
    // По умолчанию - на главную
    navigateTo('moment.html');
}

// Универсальная функция toast уведомлений
function showToast(message, duration = 3000) {
    // Проверяем, есть ли уже элемент toast на странице
    let toast = document.getElementById('toast');
    
    if (!toast) {
        // Создаём новый toast если его нет
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg z-50 hidden';
        toast.innerHTML = '<span id="toast-message"></span>';
        document.body.appendChild(toast);
    }
    
    const messageEl = document.getElementById('toast-message');
    if (messageEl) {
        messageEl.textContent = message;
    }
    
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, duration);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Навигация загружена. Текущая страница:', getCurrentPage());
});

// Экспорт функций для глобального доступа
window.navigateTo = navigateTo;
window.goBack = goBack;
window.showToast = showToast;
window.getCurrentPage = getCurrentPage;
