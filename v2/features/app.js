import { createStore } from '../core/store.js';

const store = createStore();
const headerEl = document.getElementById('app-header');
const mainEl = document.getElementById('app-main');
const navEl = document.getElementById('bottom-nav');
const modalRoot = document.getElementById('modal-root');

const screenMeta = {
    dashboard: {
        eyebrow: 'Ковальский в пути',
        title: 'Маршруты, контент и ритм поездки',
        subtitle: 'Новая версия собирает маршрут, идеи и работу с контентом в один мобильный поток.'
    },
    route: {
        eyebrow: 'Ковальский в пути',
        title: 'Рабочее пространство маршрута',
        subtitle: 'Таймлайн поездки, захват моментов, расходы и экспорт без переключения между экранами.'
    },
    library: {
        eyebrow: 'Ковальский в пути',
        title: 'Материалы и быстрый экспорт',
        subtitle: 'Собранные моменты, заготовки и шаблон публикации для следующего поста.'
    },
    settings: {
        eyebrow: 'Ковальский в пути',
        title: 'Система расходов и данных',
        subtitle: 'Настройка категорий расходов, полей и базовой схемы приложения.'
    }
};

function formatCurrency(amount) {
    return `${amount.toLocaleString('ru-RU')} ₽`;
}

function countAllMoments(routes) {
    return routes.reduce((sum, route) => sum + route.moments.length, 0);
}

function countAllExpenses(routes) {
    return routes.reduce((sum, route) => sum + route.expenses.reduce((acc, item) => acc + item.amount, 0), 0);
}

function getSelectedRoute(state) {
    return state.routes.find(route => route.id === state.ui.selectedRouteId) || state.routes[0];
}

function getExpenseCategory(state, categoryId) {
    return state.expenseCategories.find(category => category.id === categoryId) || state.expenseCategories[0];
}

function summarizeExpense(expense, state) {
    const category = getExpenseCategory(state, expense.category);
    const details = expense.details || {};
    const summary = category.fields
        .filter(field => details[field.id])
        .slice(0, 2)
        .map(field => `${field.label}: ${details[field.id]}`);

    return {
        label: category.label,
        icon: category.icon,
        details: summary.join(' · ')
    };
}

function getExpenseDisplayTitle(expense, state) {
    return getExpenseCategory(state, expense.category)?.label || expense.title || 'Расход';
}

function getChecklistProgress(checklist) {
    const total = checklist.items.length;
    const done = checklist.items.filter(item => item.done).length;

    return { done, total };
}

function getChecklistKindLabel(kind) {
    return {
        packing: 'Что взять',
        detour: 'Куда заехать',
        plan: 'План',
        tasks: 'Задачи'
    }[kind] || 'Чеклист';
}

function serializeChecklistItems(checklist) {
    return (checklist?.items || []).map(item => item.label).join('\n');
}

function getPlanStepStatusLabel(status) {
    return {
        todo: 'Запланировано',
        doing: 'В работе',
        done: 'Отработано'
    }[status] || 'План';
}

function getPlanStepTypeLabel(type) {
    return {
        logistics: 'Логистика',
        shoot: 'Съемка',
        stop: 'Остановка',
        content: 'Контент',
        meeting: 'Встреча'
    }[type] || 'Шаг';
}

function getPlanStepPriorityLabel(priority) {
    return {
        high: 'Высокий',
        medium: 'Средний',
        low: 'Низкий'
    }[priority] || 'Средний';
}

function getPlanProgress(route) {
    const total = route.planSteps.length;
    const done = route.planSteps.filter(item => item.status === 'done').length;
    const doing = route.planSteps.filter(item => item.status === 'doing').length;

    return { total, done, doing };
}

function buildHeader(state) {
    const meta = screenMeta[state.ui.screen];
    const selectedRoute = getSelectedRoute(state);

    headerEl.innerHTML = `
        <div class="eyebrow">${meta.eyebrow}</div>
        <div class="title-row">
            <div>
                <h1 class="page-title">${meta.title}</h1>
                <p class="page-subtitle">${state.ui.screen === 'route' && selectedRoute ? selectedRoute.title : meta.subtitle}</p>
            </div>
            <button class="header-action" data-action="header-action">${state.ui.screen === 'route' ? '←' : '+'}</button>
        </div>
    `;

    headerEl.querySelector('[data-action="header-action"]').addEventListener('click', () => {
        if (state.ui.screen === 'route') {
            store.navigate('dashboard');
        } else {
            store.openCapture('route');
        }
    });
}

function renderDashboard(state) {
    const metrics = [
        { label: 'Маршрутов', value: state.routes.length },
        { label: 'Моментов', value: countAllMoments(state.routes) },
        { label: 'Бюджет', value: formatCurrency(countAllExpenses(state.routes)) }
    ];

    const recentMoments = state.routes
        .flatMap(route => route.moments.map(moment => ({ ...moment, routeTitle: route.title })))
        .slice(0, 4);

    return `
        <section class="screen-section">
            <article class="hero-card">
                <span class="hero-kicker">Ковальский в пути / маршрутная система</span>
                <h2 class="hero-title">Маршрут как редакционный штаб в дороге.</h2>
                <p class="page-subtitle" style="color: rgba(248, 241, 231, 0.8);">Внутри одного маршрута живут идеи, расходы, точки, черновики и экспорт. Не дневник, а рабочая машина для тревел-контента.</p>
                <div class="hero-grid">
                    ${metrics.map(metric => `
                        <div class="metric-card" style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.08);">
                            <div class="metric-label" style="color: rgba(248,241,231,0.72);">${metric.label}</div>
                            <div class="metric-value">${metric.value}</div>
                        </div>
                    `).join('')}
                </div>
            </article>
        </section>
        <section class="screen-section">
            <div class="section-header">
                <h3 class="section-title">Быстрые действия</h3>
                <button class="section-link" data-action="go-library">Открыть центр материалов</button>
            </div>
            <div class="quick-grid">
                <button class="action-card primary" data-capture="route">
                    <p class="action-card-title">Новый маршрут</p>
                    <p class="action-card-copy">Создать следующую поездку и сразу задать ей режим: план, в пути или спонтанно.</p>
                </button>
                <button class="action-card secondary" data-capture="moment">
                    <p class="action-card-title">Поймать момент</p>
                    <p class="action-card-copy">Сохранить инсайт, локацию или кусок будущего поста.</p>
                </button>
            </div>
        </section>
        <section class="screen-section">
            <div class="section-header">
                <h3 class="section-title">Маршруты</h3>
                <span class="section-link">3 режима: план / в пути / спонтанно</span>
            </div>
            <div class="routes-stack">
                ${state.routes.map(route => `
                    <div class="route-card">
                        <button class="route-open" data-route-id="${route.id}">
                            <div class="route-topline">
                                <span class="route-status status-${route.status}">${getStatusLabel(route.status)}</span>
                                <span class="soft-pill">${route.region}</span>
                            </div>
                            <h4 class="route-title">${route.title}</h4>
                            <p class="route-desc">${route.coverMood}</p>
                            <div class="inline-stat-row" style="margin-top: 10px;">
                                <div class="inline-stat">
                                    <span class="metric-label">Моменты</span>
                                    <strong>${route.moments.length}</strong>
                                </div>
                                <div class="inline-stat">
                                    <span class="metric-label">Траты</span>
                                    <strong>${route.expenses.length}</strong>
                                </div>
                            </div>
                        </button>
                        <div class="item-actions item-actions-inline">
                            <button class="mini-action" data-action="edit-route" data-route-id="${route.id}">Ред.</button>
                            ${state.routes.length > 1 ? `<button class="mini-action danger-link" data-action="delete-route" data-route-id="${route.id}">Удалить</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="screen-section">
            <div class="section-header">
                <h3 class="section-title">Последние материалы</h3>
            </div>
            <article class="list-card">
                ${recentMoments.map(moment => `
                    <div class="list-item">
                        <div class="list-badge">${getMomentIcon(moment.category)}</div>
                        <div class="list-body">
                            <p class="list-title">${moment.title}</p>
                            <div class="list-meta">${moment.routeTitle} · ${moment.location} · ${moment.createdAt}</div>
                            <div class="list-note">${moment.content}</div>
                        </div>
                    </div>
                `).join('')}
            </article>
        </section>
    `;
}

function renderRoute(state) {
    const route = getSelectedRoute(state);
    const totalExpenses = route.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return `
        <section class="screen-section">
            <article class="hero-card">
                <span class="hero-kicker">Ковальский в пути / ${getStatusLabel(route.status)}</span>
                <h2 class="hero-title">${route.title}</h2>
                <p class="page-subtitle" style="color: rgba(248, 241, 231, 0.8);">${route.region} · ${route.dateRange} · ${route.coverMood}</p>
                <div class="hero-grid">
                    <div class="metric-card" style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.08);">
                        <div class="metric-label" style="color: rgba(248,241,231,0.72);">Моментов</div>
                        <div class="metric-value">${route.moments.length}</div>
                    </div>
                    <div class="metric-card" style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.08);">
                        <div class="metric-label" style="color: rgba(248,241,231,0.72);">Точек</div>
                        <div class="metric-value">${route.waypoints.length}</div>
                    </div>
                    <div class="metric-card" style="background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.08);">
                        <div class="metric-label" style="color: rgba(248,241,231,0.72);">Бюджет</div>
                        <div class="metric-value" style="font-size: 18px;">${formatCurrency(totalExpenses)}</div>
                    </div>
                </div>
            </article>
        </section>
        <section class="screen-section">
            <div class="tab-row">
                ${['timeline', 'plan', 'budget', 'export'].map(tab => `
                    <button class="tab-button ${state.ui.routeTab === tab ? 'active' : ''}" data-route-tab="${tab}">${getTabLabel(tab)}</button>
                `).join('')}
            </div>
        </section>
        <section class="screen-section">
            ${renderRouteTab(route, state.ui.routeTab, state)}
        </section>
    `;
}

function renderRouteTab(route, tab, state) {
    if (tab === 'timeline') {
        return `
            <div class="cards-stack">
                <div class="sheet-card">
                    <div class="section-header">
                        <h3 class="section-title">История маршрута</h3>
                        <button class="section-link" data-capture="moment">+ Момент</button>
                    </div>
                    <div class="timeline-stack">
                        ${route.history.length ? route.history.map(entry => `
                            <div class="list-item" style="padding: 0;">
                                <div class="list-badge">${getHistoryIcon(entry.kind)}</div>
                                <div class="list-body">
                                    <p class="list-title">${entry.title}</p>
                                    <div class="list-meta">${entry.meta} · ${entry.createdAt}</div>
                                    ${entry.note ? `<div class="list-note">${entry.note}</div>` : ''}
                                </div>
                            </div>
                        `).join('') : `<p class="muted-copy">История пока пустая. Добавь момент, шаг, расход или работу по чеклисту, и событие появится здесь.</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    if (tab === 'plan') {
        const planProgress = getPlanProgress(route);

        return `
            <div class="cards-stack">
                <div class="sheet-card">
                    <div class="section-header">
                        <h3 class="section-title">План маршрута и отработка</h3>
                        <button class="section-link" data-capture="plan-step">+ Шаг</button>
                    </div>
                    <div class="inline-stat-row" style="margin-bottom: 10px;">
                        <div class="inline-stat">
                            <span class="metric-label">Всего шагов</span>
                            <strong>${planProgress.total}</strong>
                        </div>
                        <div class="inline-stat">
                            <span class="metric-label">В работе</span>
                            <strong>${planProgress.doing}</strong>
                        </div>
                        <div class="inline-stat">
                            <span class="metric-label">Отработано</span>
                            <strong>${planProgress.done}</strong>
                        </div>
                    </div>
                    <div class="cards-stack">
                        ${route.planSteps.length ? route.planSteps.map(step => `
                            <div class="plan-step-card status-${step.status}">
                                <div class="section-header">
                                    <div>
                                        <div class="route-topline">
                                            <span class="soft-pill">${step.time || 'Без времени'}</span>
                                            <span class="soft-pill">${getPlanStepTypeLabel(step.type)}</span>
                                            <span class="soft-pill">${getPlanStepPriorityLabel(step.priority)}</span>
                                        </div>
                                        <h4 class="route-title" style="font-size:15px;">${step.title}</h4>
                                        <p class="route-desc">${getPlanStepStatusLabel(step.status)}</p>
                                    </div>
                                    <div class="item-actions">
                                        <button class="mini-action" data-action="cycle-plan-step" data-item-id="${step.id}">${getPlanStepStatusLabel(step.status)}</button>
                                        <button class="mini-action" data-action="edit-plan-step" data-item-id="${step.id}">Ред.</button>
                                        <button class="mini-action danger-link" data-action="delete-plan-step" data-item-id="${step.id}">Удалить</button>
                                    </div>
                                </div>
                                ${step.note ? `<p class="route-desc" style="margin-top: 8px;">${step.note}</p>` : ''}
                                <div class="plan-result-box">
                                    <div class="metric-label">Факт / результат</div>
                                    <div class="plan-result-copy">${step.result || 'Пока без отработки. После выполнения зафиксируй результат в карточке шага.'}</div>
                                </div>
                            </div>
                        `).join('') : `<p class="muted-copy">Собери план поездки по шагам: что снять, где остановиться, что проверить по дороге и что уже реально отработано.</p>`}
                    </div>
                </div>
                <div class="sheet-card">
                    <div class="section-header">
                        <h3 class="section-title">Черновики и чеклисты</h3>
                        <button class="section-link" data-capture="checklist">+ Чеклист</button>
                    </div>
                    <div class="cards-stack">
                        ${route.drafts.map(draft => `<div class="route-card"><div class="route-topline"><span class="soft-pill">${draft.status}</span></div><h4 class="route-title" style="font-size:15px;">${draft.title}</h4></div>`).join('')}
                        ${route.checklists.length ? route.checklists.map(checklist => {
                            const progress = getChecklistProgress(checklist);
                            return `
                                <div class="route-card">
                                    <div class="section-header">
                                        <div>
                                            <div class="route-topline">
                                                <span class="soft-pill">${getChecklistKindLabel(checklist.kind)}</span>
                                            </div>
                                            <h4 class="route-title" style="font-size:15px;">${checklist.title}</h4>
                                            <p class="route-desc">${progress.done} / ${progress.total} выполнено</p>
                                            ${checklist.note ? `<p class="route-desc" style="margin-top:6px;">${checklist.note}</p>` : ''}
                                        </div>
                                        <div class="item-actions">
                                            <button class="mini-action" data-action="edit-checklist" data-item-id="${checklist.id}">Ред.</button>
                                            <button class="mini-action danger-link" data-action="delete-checklist" data-item-id="${checklist.id}">Удалить</button>
                                        </div>
                                    </div>
                                    <div class="checklist-stack">
                                        ${checklist.items.map(item => `
                                            <button class="checklist-item ${item.done ? 'is-done' : ''}" data-action="toggle-checklist-item" data-checklist-id="${checklist.id}" data-checklist-item-id="${item.id}">
                                                <span class="checkmark">${item.done ? '✓' : ''}</span>
                                                <span class="checklist-copy">${item.label}</span>
                                            </button>
                                        `).join('')}
                                    </div>
                                </div>
                            `;
                        }).join('') : `<p class="muted-copy">Добавь чеклист для сборов, заездов между точками или подготовительных задач.</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    if (tab === 'budget') {
        return `
            <div class="sheet-card">
                <div class="section-header">
                    <h3 class="section-title">Расходы маршрута</h3>
                    <div class="compact-actions">
                        <button class="section-link" data-action="open-expense-settings">Настроить</button>
                        <button class="section-link" data-capture="expense">+ Расход</button>
                    </div>
                </div>
                ${route.expenses.length ? route.expenses.map(expense => {
                    const summary = summarizeExpense(expense, state);
                    return `
                        <div class="list-item">
                            <div class="list-badge">${summary.icon}</div>
                            <div class="list-body">
                                <p class="list-title">${getExpenseDisplayTitle(expense, state)}</p>
                                <div class="list-meta">${expense.createdAt}</div>
                                ${summary.details ? `<div class="list-note">${summary.details}</div>` : ''}
                            </div>
                            <strong>${formatCurrency(expense.amount)}</strong>
                            <div class="item-actions">
                                <button class="mini-action" data-action="edit-expense" data-item-id="${expense.id}">Ред.</button>
                                <button class="mini-action danger-link" data-action="delete-expense" data-item-id="${expense.id}">Удалить</button>
                            </div>
                        </div>
                    `;
                }).join('') : `<p class="muted-copy">Пока бюджет пуст. Добавь первый расход в пару касаний.</p>`}
            </div>
        `;
    }

    return `
        <div class="cards-stack">
            <div class="sheet-card">
                <div class="section-header">
                    <h3 class="section-title">Экспорт-предпросмотр</h3>
                    <button class="section-link" data-action="go-library">Открыть центр материалов</button>
                </div>
                <div class="markdown-box">${buildExport(route, state)}</div>
            </div>
        </div>
    `;
}

function renderLibrary(state) {
    const route = getSelectedRoute(state);

    return `
        <section class="screen-section">
            <div class="sheet-card">
                <div class="section-header">
                    <h3 class="section-title">Экспорт по активному маршруту</h3>
                    <button class="section-link" data-route-id="${route.id}">Открыть маршрут</button>
                </div>
                <div class="markdown-box">${buildExport(route, state)}</div>
            </div>
        </section>
        <section class="screen-section">
            <div class="section-header">
                <h3 class="section-title">Архив моментов</h3>
            </div>
            <div class="cards-stack">
                ${state.routes.flatMap(routeItem => routeItem.moments.map(moment => `
                    <article class="list-card">
                        <div class="chip-row">
                            <span class="chip">${routeItem.title}</span>
                            <span class="soft-pill">${moment.category}</span>
                        </div>
                        <h4 class="route-title" style="font-size: 16px;">${moment.title}</h4>
                        <p class="route-desc">${moment.content}</p>
                    </article>
                `)).join('')}
            </div>
        </section>
    `;
}

function renderSettings(state) {
    return `
        <section class="screen-section">
            <div class="sheet-card">
                <div class="section-header">
                    <h3 class="section-title">Схема расходов</h3>
                    <button class="section-link" data-action="new-expense-category">+ Категория</button>
                </div>
                <p class="muted-copy" style="margin-bottom: 10px;">Каждая категория задает свой набор полей в модалке расходов. Это перенесено из старой версии и теперь редактируется прямо здесь.</p>
                <div class="cards-stack">
                    ${state.expenseCategories.map(category => `
                        <div class="route-card">
                            <div class="section-header">
                                <div class="chip-row">
                                    <span class="soft-pill">${category.icon}</span>
                                    <h4 class="route-title" style="margin:0; font-size:15px;">${category.label}</h4>
                                </div>
                                <div class="compact-actions">
                                    <button class="section-link" data-action="edit-expense-category" data-category-id="${category.id}">Изм.</button>
                                    <button class="section-link" data-action="new-expense-field" data-category-id="${category.id}">+ Поле</button>
                                    ${state.expenseCategories.length > 1 ? `<button class="section-link danger-link" data-action="delete-expense-category" data-category-id="${category.id}">Удалить</button>` : ''}
                                </div>
                            </div>
                            <div class="field-chip-list">
                                ${category.fields.map(field => `
                                    <span class="field-chip">
                                        ${field.label}
                                        <button type="button" class="chip-remove" data-action="remove-expense-field" data-category-id="${category.id}" data-field-id="${field.id}">×</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="button-row">
                    <button class="btn btn-secondary" data-action="reset-demo">Сбросить демоданные</button>
                </div>
            </div>
        </section>
    `;
}

function renderBottomNav(state) {
    const items = [
        ['dashboard', '◌', 'Дашборд'],
        ['route', '✦', 'Маршрут'],
        ['library', '▣', 'Материалы'],
        ['settings', '☰', 'Система']
    ];

    navEl.innerHTML = items.map(([screen, icon, label]) => `
        <button class="nav-button ${state.ui.screen === screen ? 'active' : ''}" data-screen="${screen}">
            <span class="nav-icon">${icon}</span>
            <span class="nav-label">${label}</span>
        </button>
    `).join('');

    navEl.querySelectorAll('[data-screen]').forEach(button => {
        button.addEventListener('click', () => store.navigate(button.dataset.screen));
    });
}

function renderExpenseDynamicFields(category, details = {}) {
    return (category?.fields || []).map(field => {
        if (field.type === 'select') {
            return `
                <div class="field">
                    <label>${field.label}</label>
                    <select name="field_${field.id}">
                        ${(field.options || []).map(option => `<option value="${option}" ${String(details[field.id] || '') === option ? 'selected' : ''}>${option}</option>`).join('')}
                    </select>
                </div>
            `;
        }

        return `
            <div class="field">
                <label>${field.label}</label>
                <input type="${field.type}" name="field_${field.id}" placeholder="${field.placeholder || ''}" value="${details[field.id] || ''}">
            </div>
        `;
    }).join('');
}

function renderModal(state) {
    const type = state.ui.captureType;
    if (!type) {
        modalRoot.innerHTML = '';
        return;
    }

    const route = getSelectedRoute(state);
    modalRoot.innerHTML = `
        <div class="modal-backdrop" data-action="close-modal">
            <div class="modal-sheet" data-modal="sheet">
                ${buildModal(type, route, state)}
            </div>
        </div>
    `;

    modalRoot.querySelector('[data-action="close-modal"]').addEventListener('click', event => {
        if (event.target.dataset.action === 'close-modal') {
            store.closeCapture();
        }
    });

    modalRoot.querySelector('[data-action="cancel-modal"]').addEventListener('click', () => store.closeCapture());

    if (type === 'expense') {
        const categorySelect = modalRoot.querySelector('[name="category"]');
        const dynamicRoot = modalRoot.querySelector('[data-role="expense-fields"]');
        const itemId = state.ui.captureMeta?.itemId;
        const editingExpense = itemId ? route.expenses.find(item => item.id === itemId) : null;
        const rerenderFields = () => {
            dynamicRoot.innerHTML = renderExpenseDynamicFields(
                getExpenseCategory(state, categorySelect.value),
                categorySelect.value === editingExpense?.category ? (editingExpense?.details || {}) : {}
            );
        };
        categorySelect.addEventListener('change', rerenderFields);
        rerenderFields();
    }

    const form = modalRoot.querySelector('form');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(form).entries());

        if (type === 'route') store.saveRoute(data);
        if (type === 'moment') store.saveMoment(data);
        if (type === 'expense') store.saveExpense(data);
        if (type === 'waypoint') store.saveWaypoint(data);
        if (type === 'plan-step') store.savePlanStep(data);
        if (type === 'checklist') store.saveChecklist(data);
        if (type === 'expense-category') store.saveExpenseCategory(data);
        if (type === 'expense-field') store.addExpenseField(data);
    });
}

function buildModal(type, route, state) {
    const meta = state.ui.captureMeta || {};
    const editingRoute = meta.routeId ? state.routes.find(item => item.id === meta.routeId) : null;
    const editingMoment = meta.itemId ? route.moments.find(item => item.id === meta.itemId) : null;
    const editingExpense = meta.itemId ? route.expenses.find(item => item.id === meta.itemId) : null;
    const editingWaypoint = meta.itemId ? route.waypoints.find(item => item.id === meta.itemId) : null;
    const editingPlanStep = meta.itemId ? route.planSteps.find(item => item.id === meta.itemId) : null;
    const editingChecklist = meta.itemId ? route.checklists.find(item => item.id === meta.itemId) : null;
    const editingCategory = meta.categoryId ? getExpenseCategory(state, meta.categoryId) : null;
    const expenseCategoryOptions = state.expenseCategories.map(category => `
        <option value="${category.id}" ${(editingExpense?.category || state.expenseCategories[0].id) === category.id ? 'selected' : ''}>${category.icon} ${category.label}</option>
    `).join('');

    const content = {
        route: {
            title: editingRoute ? 'Редактировать маршрут' : 'Новый маршрут',
            badge: 'Маршруты',
            fields: `
                <input type="hidden" name="routeId" value="${editingRoute?.id || ''}">
                <div class="field"><label>Название</label><input name="title" required placeholder="Например: Осенний Кавказ" value="${editingRoute?.title || ''}"></div>
                <div class="field"><label>Статус</label><select name="status">
                    <option value="planned" ${editingRoute?.status === 'planned' ? 'selected' : ''}>План</option>
                    <option value="active" ${editingRoute?.status === 'active' ? 'selected' : ''}>В пути</option>
                    <option value="spontaneous" ${editingRoute?.status === 'spontaneous' ? 'selected' : ''}>Спонтанно</option>
                </select></div>
                <div class="field"><label>Даты</label><input name="dateRange" placeholder="5–12 августа" value="${editingRoute?.dateRange || ''}"></div>
                <div class="field"><label>Регион</label><input name="region" placeholder="Алтай, Кавказ, Карелия" value="${editingRoute?.region || ''}"></div>
                <div class="field"><label>Описание</label><textarea name="coverMood" placeholder="О чем маршрут, какой вайб, что там важно">${editingRoute?.coverMood || ''}</textarea></div>
            `
        },
        moment: {
            title: editingMoment ? 'Редактировать момент' : 'Новый момент',
            badge: route.title,
            fields: `
                <input type="hidden" name="itemId" value="${editingMoment?.id || ''}">
                <div class="field"><label>Заголовок</label><input name="title" required placeholder="Что произошло или зацепило?" value="${editingMoment?.title || ''}"></div>
                <div class="field"><label>Категория</label><select name="category">
                    <option value="insight" ${editingMoment?.category === 'insight' ? 'selected' : ''}>Инсайт</option>
                    <option value="food" ${editingMoment?.category === 'food' ? 'selected' : ''}>Еда</option>
                    <option value="location" ${editingMoment?.category === 'location' ? 'selected' : ''}>Локация</option>
                </select></div>
                <div class="field"><label>Локация</label><input name="location" placeholder="${route.region}" value="${editingMoment?.location || ''}"></div>
                <div class="field"><label>Текст</label><textarea name="content" required placeholder="Короткая мысль, эмоция, идея для поста или гида">${editingMoment?.content || ''}</textarea></div>
            `
        },
        expense: {
            title: editingExpense ? 'Редактировать расход' : 'Новый расход',
            badge: route.title,
            fields: `
                <input type="hidden" name="itemId" value="${editingExpense?.id || ''}">
                <div class="field"><label>Категория</label><select name="category">${expenseCategoryOptions}</select></div>
                <div class="field"><label>Сумма</label><input name="amount" type="number" required placeholder="0" value="${editingExpense?.amount || ''}"></div>
                <div class="field-grid" data-role="expense-fields"></div>
            `
        },
        waypoint: {
            title: editingWaypoint ? 'Редактировать точку' : 'Новая точка',
            badge: route.title,
            fields: `
                <input type="hidden" name="itemId" value="${editingWaypoint?.id || ''}">
                <div class="field"><label>Название</label><input name="title" required placeholder="Кафе, перевал, стоянка" value="${editingWaypoint?.title || ''}"></div>
                <div class="field"><label>Тип</label><select name="type">
                    <option value="viewpoint" ${editingWaypoint?.type === 'viewpoint' ? 'selected' : ''}>Смотровая точка</option>
                    <option value="stay" ${editingWaypoint?.type === 'stay' ? 'selected' : ''}>Стоянка</option>
                    <option value="food" ${editingWaypoint?.type === 'food' ? 'selected' : ''}>Еда</option>
                    <option value="city" ${editingWaypoint?.type === 'city' ? 'selected' : ''}>Город</option>
                    <option value="nature" ${editingWaypoint?.type === 'nature' ? 'selected' : ''}>Природа</option>
                </select></div>
                <div class="field"><label>Заметка</label><textarea name="note" placeholder="Зачем едем, что снять, что проверить">${editingWaypoint?.note || ''}</textarea></div>
            `
        },
        'plan-step': {
            title: editingPlanStep ? 'Редактировать шаг плана' : 'Новый шаг плана',
            badge: route.title,
            fields: `
                <input type="hidden" name="itemId" value="${editingPlanStep?.id || ''}">
                <div class="field"><label>Шаг</label><input name="title" required placeholder="Что нужно сделать по маршруту" value="${editingPlanStep?.title || ''}"></div>
                <div class="field"><label>Время</label><input name="time" placeholder="06:30" value="${editingPlanStep?.time || ''}"></div>
                <div class="field"><label>Тип</label><select name="type">
                    <option value="logistics" ${editingPlanStep?.type === 'logistics' ? 'selected' : ''}>Логистика</option>
                    <option value="shoot" ${editingPlanStep?.type === 'shoot' ? 'selected' : ''}>Съемка</option>
                    <option value="stop" ${editingPlanStep?.type === 'stop' ? 'selected' : ''}>Остановка</option>
                    <option value="content" ${editingPlanStep?.type === 'content' ? 'selected' : ''}>Контент</option>
                    <option value="meeting" ${editingPlanStep?.type === 'meeting' ? 'selected' : ''}>Встреча</option>
                </select></div>
                <div class="field"><label>Приоритет</label><select name="priority">
                    <option value="high" ${editingPlanStep?.priority === 'high' ? 'selected' : ''}>Высокий</option>
                    <option value="medium" ${editingPlanStep?.priority === 'medium' || !editingPlanStep ? 'selected' : ''}>Средний</option>
                    <option value="low" ${editingPlanStep?.priority === 'low' ? 'selected' : ''}>Низкий</option>
                </select></div>
                <div class="field"><label>Статус</label><select name="status">
                    <option value="todo" ${editingPlanStep?.status === 'todo' || !editingPlanStep ? 'selected' : ''}>Запланировано</option>
                    <option value="doing" ${editingPlanStep?.status === 'doing' ? 'selected' : ''}>В работе</option>
                    <option value="done" ${editingPlanStep?.status === 'done' ? 'selected' : ''}>Отработано</option>
                </select></div>
                <div class="field"><label>План</label><textarea name="note" placeholder="Что именно нужно сделать, проверить или снять">${editingPlanStep?.note || ''}</textarea></div>
                <div class="field"><label>Факт / отработка</label><textarea name="result" placeholder="Что реально получилось, что снято, что перенесено">${editingPlanStep?.result || ''}</textarea></div>
            `
        },
        checklist: {
            title: editingChecklist ? 'Редактировать чеклист' : 'Новый чеклист',
            badge: route.title,
            fields: `
                <input type="hidden" name="itemId" value="${editingChecklist?.id || ''}">
                <div class="field"><label>Название</label><input name="title" required placeholder="Что взять с собой или куда заехать" value="${editingChecklist?.title || ''}"></div>
                <div class="field"><label>Тип</label><select name="kind">
                    <option value="packing" ${editingChecklist?.kind === 'packing' ? 'selected' : ''}>Что взять</option>
                    <option value="detour" ${editingChecklist?.kind === 'detour' ? 'selected' : ''}>Куда заехать</option>
                    <option value="plan" ${editingChecklist?.kind === 'plan' ? 'selected' : ''}>План подготовки</option>
                    <option value="tasks" ${editingChecklist?.kind === 'tasks' ? 'selected' : ''}>Прочие задачи</option>
                </select></div>
                <div class="field"><label>Пояснение</label><textarea name="note" placeholder="Короткая заметка, что важно не забыть">${editingChecklist?.note || ''}</textarea></div>
                <div class="field"><label>Пункты</label><textarea name="items" required placeholder="Каждый пункт с новой строки">${serializeChecklistItems(editingChecklist)}</textarea></div>
            `
        },
        'expense-category': {
            title: editingCategory ? 'Редактировать категорию' : 'Новая категория расходов',
            badge: 'Расходы',
            fields: `
                <input type="hidden" name="categoryId" value="${editingCategory?.id || ''}">
                ${editingCategory ? '' : `<div class="field"><label>Ключ</label><input name="id" placeholder="например: parking"></div>`}
                <div class="field"><label>Название</label><input name="label" required placeholder="Например: Парковка" value="${editingCategory?.label || ''}"></div>
                <div class="field"><label>Иконка</label><input name="icon" placeholder="🚗" value="${editingCategory?.icon || ''}"></div>
            `
        },
        'expense-field': {
            title: 'Новое поле категории',
            badge: 'Расходы',
            fields: `
                <input type="hidden" name="categoryId" value="${meta.categoryId || ''}">
                <div class="field"><label>Ключ поля</label><input name="id" placeholder="например: parking_hours"></div>
                <div class="field"><label>Название</label><input name="label" required placeholder="Например: Часов"></div>
                <div class="field"><label>Тип</label><select name="type"><option value="text">Текст</option><option value="number">Число</option><option value="select">Список</option></select></div>
                <div class="field"><label>Подсказка</label><input name="placeholder" placeholder="Подсказка для ввода"></div>
                <div class="field"><label>Опции для select</label><input name="options" placeholder="через запятую, если тип = select"></div>
            `
        }
    };

    return `
        <div class="section-header">
            <h3 class="section-title">${content[type].title}</h3>
            <span class="soft-pill">${content[type].badge}</span>
        </div>
        <form class="field-grid">
            ${content[type].fields}
            <div class="button-row">
                <button type="button" class="btn btn-secondary" data-action="cancel-modal">Отмена</button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
            </div>
        </form>
    `;
}

function buildExport(route, state) {
    const highlights = route.moments.slice(0, 3).map(moment => `- ${moment.title}: ${moment.content}`).join('\n');
    const expenseLines = route.expenses.length
        ? route.expenses.map(item => {
            const summary = summarizeExpense(item, state);
            return `- ${getExpenseDisplayTitle(item, state)}: ${formatCurrency(item.amount)} (${summary.label}${summary.details ? ` / ${summary.details}` : ''})`;
        }).join('\n')
        : '- Пока пусто';
    const checklistLines = route.checklists.length
        ? route.checklists.map(checklist => {
            const progress = getChecklistProgress(checklist);
            return `- ${checklist.title} (${progress.done}/${progress.total})`;
        }).join('\n')
        : '- Пока нет чеклистов';
    const planLines = route.planSteps.length
        ? route.planSteps.map(step => `- ${step.time || '--:--'} · ${step.title} [${getPlanStepStatusLabel(step.status)}]`).join('\n')
        : '- Пока нет шагов плана';

    return `# ${route.title}\n\nСтатус: ${getStatusLabel(route.status)}\nРегион: ${route.region}\nДаты: ${route.dateRange}\n\n## Хуки\n${highlights || '- Пока нет собранных моментов'}\n\n## План\n${planLines}\n\n## Бюджет\n${expenseLines}\n\n## Чеклисты\n${checklistLines}`;
}

function getStatusLabel(status) {
    return {
        planned: 'План',
        active: 'В пути',
        spontaneous: 'Спонтанно'
    }[status] || status;
}

function getMomentIcon(category) {
    return {
        insight: '✦',
        food: '◌',
        location: '⌘'
    }[category] || '•';
}

function getHistoryIcon(kind) {
    return {
        moment: '✦',
        expense: '₽',
        plan: '✓',
        checklist: '☑'
    }[kind] || '•';
}

function getTabLabel(tab) {
    return {
        timeline: 'Таймлайн',
        plan: 'План',
        budget: 'Бюджет',
        export: 'Экспорт'
    }[tab] || tab;
}

function bindMainEvents(state) {
    const route = getSelectedRoute(state);

    mainEl.querySelectorAll('[data-route-id]').forEach(button => {
        button.addEventListener('click', () => store.selectRoute(button.dataset.routeId));
    });

    mainEl.querySelectorAll('[data-capture]').forEach(button => {
        button.addEventListener('click', () => store.openCapture(button.dataset.capture));
    });

    mainEl.querySelectorAll('[data-route-tab]').forEach(button => {
        button.addEventListener('click', () => store.setRouteTab(button.dataset.routeTab));
    });

    mainEl.querySelectorAll('[data-action="go-library"]').forEach(button => {
        button.addEventListener('click', () => store.navigate('library'));
    });

    mainEl.querySelectorAll('[data-action="reset-demo"]').forEach(button => {
        button.addEventListener('click', () => store.reset());
    });

    mainEl.querySelectorAll('[data-action="open-expense-settings"]').forEach(button => {
        button.addEventListener('click', () => store.navigate('settings'));
    });

    mainEl.querySelectorAll('[data-action="new-expense-category"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('expense-category'));
    });

    mainEl.querySelectorAll('[data-action="edit-expense-category"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('expense-category', { categoryId: button.dataset.categoryId }));
    });

    mainEl.querySelectorAll('[data-action="new-expense-field"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('expense-field', { categoryId: button.dataset.categoryId }));
    });

    mainEl.querySelectorAll('[data-action="remove-expense-field"]').forEach(button => {
        button.addEventListener('click', () => store.removeExpenseField(button.dataset.categoryId, button.dataset.fieldId));
    });

    mainEl.querySelectorAll('[data-action="delete-expense-category"]').forEach(button => {
        button.addEventListener('click', () => store.deleteExpenseCategory(button.dataset.categoryId));
    });

    mainEl.querySelectorAll('[data-action="edit-route"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('route', { routeId: button.dataset.routeId }));
    });

    mainEl.querySelectorAll('[data-action="delete-route"]').forEach(button => {
        button.addEventListener('click', () => store.deleteRoute(button.dataset.routeId));
    });

    mainEl.querySelectorAll('[data-action="edit-moment"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('moment', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-moment"]').forEach(button => {
        button.addEventListener('click', () => store.deleteMoment(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="edit-expense"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('expense', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-expense"]').forEach(button => {
        button.addEventListener('click', () => store.deleteExpense(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="edit-waypoint"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('waypoint', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-waypoint"]').forEach(button => {
        button.addEventListener('click', () => store.deleteWaypoint(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="edit-plan-step"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('plan-step', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-plan-step"]').forEach(button => {
        button.addEventListener('click', () => store.deletePlanStep(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="cycle-plan-step"]').forEach(button => {
        button.addEventListener('click', () => store.cyclePlanStepStatus(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="edit-checklist"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('checklist', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-checklist"]').forEach(button => {
        button.addEventListener('click', () => store.deleteChecklist(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="toggle-checklist-item"]').forEach(button => {
        button.addEventListener('click', () => store.toggleChecklistItem(route.id, button.dataset.checklistId, button.dataset.checklistItemId));
    });
}

function render(state) {
    buildHeader(state);

    if (state.ui.screen === 'dashboard') {
        mainEl.innerHTML = renderDashboard(state);
    } else if (state.ui.screen === 'route') {
        mainEl.innerHTML = renderRoute(state);
    } else if (state.ui.screen === 'library') {
        mainEl.innerHTML = renderLibrary(state);
    } else {
        mainEl.innerHTML = renderSettings(state);
    }

    bindMainEvents(state);
    renderBottomNav(state);
    renderModal(state);
}

store.subscribe(render);
render(store.getState());
