import { createStore } from '../core/store.js';

const store = createStore();
const headerEl = document.getElementById('app-header');
const mainEl = document.getElementById('app-main');
const navEl = document.getElementById('bottom-nav');
const modalRoot = document.getElementById('modal-root');
const INTRO_NOTICE_KEY = 'kovalsky_v_puti_intro_notice_seen';

const screenMeta = {
    dashboard: {
        eyebrow: 'Ковальский в пути',
        title: 'Маршруты, контент и ритм поездки',
        subtitle: 'Новая версия собирает маршрут, идеи и работу с контентом в один мобильный поток.'
    },
    route: {
        eyebrow: 'Ковальский в пути',
        title: 'Рабочее пространство маршрута',
        subtitle: 'Таймлайн поездки, захват записей, расходы и экспорт без переключения между экранами.'
    },
    library: {
        eyebrow: 'Ковальский в пути',
        title: 'Материалы и быстрый экспорт',
        subtitle: 'Собранные записи, заготовки и шаблон публикации для следующего поста.'
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

function canOpenWithoutRoute(captureType) {
    return ['route', 'expense-category', 'expense-field', 'confirm-delete'].includes(captureType);
}

function askDeleteConfirmation(meta) {
    store.openCapture('confirm-delete', meta);
}

function runDeleteAction(meta) {
    if (!meta?.action) {
        store.closeCapture();
        return;
    }

    store.closeCapture();

    if (meta.action === 'clear-demo') store.clearDemoContent();
    if (meta.action === 'remove-expense-field') store.removeExpenseField(meta.categoryId, meta.fieldId);
    if (meta.action === 'delete-expense-category') store.deleteExpenseCategory(meta.categoryId);
    if (meta.action === 'delete-route') store.deleteRoute(meta.routeId);
    if (meta.action === 'delete-moment') store.deleteMoment(meta.routeId, meta.itemId);
    if (meta.action === 'delete-expense') store.deleteExpense(meta.routeId, meta.itemId);
    if (meta.action === 'delete-waypoint') store.deleteWaypoint(meta.routeId, meta.itemId);
    if (meta.action === 'delete-plan-step') store.deletePlanStep(meta.routeId, meta.itemId);
    if (meta.action === 'delete-checklist') store.deleteChecklist(meta.routeId, meta.itemId);
}

function getDeleteModalContent(meta) {
    const content = {
        'clear-demo': {
            title: 'Удалить ознакомительные данные',
            badge: 'Система',
            message: 'Ознакомительные маршруты, записи, расходы, шаги плана и чеклисты будут удалены. Категории расходов и их поля сохранятся.',
            confirmLabel: 'Удалить данные'
        },
        'remove-expense-field': {
            title: 'Удалить поле категории',
            badge: 'Расходы',
            message: `Поле «${meta.fieldLabel || 'Без названия'}» будет удалено из категории расходов.`,
            confirmLabel: 'Удалить поле'
        },
        'delete-expense-category': {
            title: 'Удалить категорию расходов',
            badge: 'Расходы',
            message: `Категория «${meta.categoryLabel || 'Без названия'}» будет удалена вместе со своей схемой полей.`,
            confirmLabel: 'Удалить категорию'
        },
        'delete-route': {
            title: 'Удалить маршрут',
            badge: 'Маршруты',
            message: `Маршрут «${meta.title || 'Без названия'}» будет удалён со всеми записями, расходами, планом и чеклистами.`,
            confirmLabel: 'Удалить маршрут'
        },
        'delete-moment': {
            title: 'Удалить запись',
            badge: 'Маршрут',
            message: `Запись «${meta.title || 'Без названия'}» будет удалена из маршрута.`,
            confirmLabel: 'Удалить запись'
        },
        'delete-expense': {
            title: 'Удалить расход',
            badge: 'Маршрут',
            message: `Расход «${meta.title || 'Без названия'}» будет удалён из бюджета маршрута.`,
            confirmLabel: 'Удалить расход'
        },
        'delete-waypoint': {
            title: 'Удалить точку',
            badge: 'Маршрут',
            message: `Точка «${meta.title || 'Без названия'}» будет удалена из маршрута.`,
            confirmLabel: 'Удалить точку'
        },
        'delete-plan-step': {
            title: 'Удалить шаг плана',
            badge: 'План',
            message: `Шаг «${meta.title || 'Без названия'}» будет удалён из плана маршрута.`,
            confirmLabel: 'Удалить шаг'
        },
        'delete-checklist': {
            title: 'Удалить чеклист',
            badge: 'План',
            message: `Чеклист «${meta.title || 'Без названия'}» будет удалён вместе со всеми пунктами.`,
            confirmLabel: 'Удалить чеклист'
        }
    };

    return content[meta?.action] || {
        title: 'Подтвердить удаление',
        badge: 'Система',
        message: 'Это действие удалит выбранные данные.',
        confirmLabel: 'Удалить'
    };
}

function renderNoRoutesState() {
    return `
        <section class="screen-section">
            <article class="list-card">
                <h3 class="section-title" style="margin-bottom: 8px;">Маршрутов пока нет</h3>
                <p class="muted-copy">Ознакомительные данные очищены. Создай свой первый маршрут и начинай вести поездку уже на своих данных.</p>
                <div class="button-row">
                    <button class="btn btn-primary" data-capture="route">Создать маршрут</button>
                </div>
            </article>
        </section>
    `;
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
    if (state.ui.screen === 'dashboard' || state.ui.screen === 'route') {
        headerEl.innerHTML = '';
        return;
    }

    const meta = screenMeta[state.ui.screen];
    const selectedRoute = getSelectedRoute(state);

    headerEl.innerHTML = `
        <div class="eyebrow">${meta.eyebrow}</div>
        <div class="title-row">
            <div>
                <h1 class="page-title">${meta.title}</h1>
                <p class="page-subtitle">${state.ui.screen === 'route' && selectedRoute ? selectedRoute.title : meta.subtitle}</p>
            </div>
            ${state.ui.screen === 'library' ? '<button class="header-action" data-action="header-action">+</button>' : ''}
        </div>
    `;

    const headerAction = headerEl.querySelector('[data-action="header-action"]');
    if (headerAction) {
        headerAction.addEventListener('click', () => {
            store.openCapture('route');
        });
    }
}

function renderDashboard(state) {
    if (!state.routes.length) {
        return `
            <section class="screen-section">
                <article class="hero-card">
                    <span class="hero-kicker">Ковальский в пути / маршрутная система</span>
                    <h2 class="hero-title">Начни с первого маршрута.</h2>
                </article>
            </section>
            ${renderNoRoutesState()}
        `;
    }

    const metrics = [
        { label: 'Маршрутов', value: state.routes.length },
        { label: 'Записей', value: countAllMoments(state.routes) },
        { label: 'Бюджет', value: formatCurrency(countAllExpenses(state.routes)) }
    ];

    const recentMoments = state.routes
        .flatMap(route => route.moments.map(moment => ({ ...moment, routeId: route.id, routeTitle: route.title })))
        .slice(0, 4);

    return `
        <section class="screen-section">
            <article class="hero-card">
                <span class="hero-kicker">Ковальский в пути / маршрутная система</span>
                <div class="hero-stats">
                    ${metrics.map(metric => `
                        <div class="hero-stat">
                            <div class="hero-stat-value">${metric.value}</div>
                            <div class="hero-stat-label">${metric.label}</div>
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
                    <p class="action-card-copy">Создать новую поездку и задать ей режим работы.</p>
                </button>
                <button class="action-card secondary" data-capture="moment">
                    <p class="action-card-title">Новая запись</p>
                    <p class="action-card-copy">Зафиксировать идею, наблюдение или заметку по дороге.</p>
                </button>
            </div>
        </section>
        <section class="screen-section">
            <div class="section-header">
                <h3 class="section-title">Маршруты</h3>
                <span class="muted-copy">План / В пути / Спонтанно</span>
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
                                    <span class="metric-label">Записи</span>
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
                            ${state.routes.length > 1 ? `<button class="mini-action danger-link" data-action="delete-route" data-route-id="${route.id}" data-title="${route.title}">Удалить</button>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </section>
        <section class="screen-section">
            <div class="section-header">
                <h3 class="section-title">Последние записи</h3>
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
                        <div class="item-actions">
                            <button class="mini-action" data-action="edit-moment" data-route-id="${moment.routeId}" data-item-id="${moment.id}">Ред.</button>
                            <button class="mini-action danger-link" data-action="delete-moment" data-route-id="${moment.routeId}" data-item-id="${moment.id}" data-title="${moment.title}">Удалить</button>
                        </div>
                    </div>
                `).join('')}
            </article>
        </section>
    `;
}

function renderRoute(state) {
    const route = getSelectedRoute(state);
    if (!route) {
        return renderNoRoutesState();
    }
    const totalExpenses = route.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    return `
        <section class="screen-section">
            <article class="hero-card">
                <div class="route-hero-shell">
                    <h2 class="hero-title route-hero-title">${route.title}</h2>
                    <div class="route-hero-meta-row">
                        <span class="route-status status-${route.status}">${getStatusLabel(route.status)}</span>
                        <span class="soft-pill route-hero-pill">${route.region}</span>
                        <span class="soft-pill route-hero-pill">${route.dateRange}</span>
                    </div>
                    <div class="hero-stats route-hero-stats">
                        <div class="hero-stat">
                            <div class="hero-stat-value">${route.moments.length}</div>
                            <div class="hero-stat-label">Записей</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-value">${route.planSteps.length}</div>
                            <div class="hero-stat-label">Шагов</div>
                        </div>
                        <div class="hero-stat">
                            <div class="hero-stat-value">${formatCurrency(totalExpenses)}</div>
                            <div class="hero-stat-label">Бюджет</div>
                        </div>
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
                        <button class="section-link" data-capture="moment">+ Запись</button>
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
                        `).join('') : `<p class="muted-copy">История пока пустая. Добавь запись, шаг, расход или работу по чеклисту, и событие появится здесь.</p>`}
                    </div>
                </div>
            </div>
        `;
    }

    if (tab === 'plan') {
        return `
            <div class="cards-stack">
                <div class="sheet-card">
                    <div class="section-header">
                        <h3 class="section-title">План маршрута и отработка</h3>
                        <button class="section-link" data-capture="plan-step">+ Шаг</button>
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
                                        <button class="mini-action danger-link" data-action="delete-plan-step" data-item-id="${step.id}" data-title="${step.title}">Удалить</button>
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
                                            <button class="mini-action danger-link" data-action="delete-checklist" data-item-id="${checklist.id}" data-title="${checklist.title}">Удалить</button>
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
                                <button class="mini-action danger-link" data-action="delete-expense" data-item-id="${expense.id}" data-title="${getExpenseDisplayTitle(expense, state)}">Удалить</button>
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
    if (!route) {
        return renderNoRoutesState();
    }

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
                <h3 class="section-title">Архив записей</h3>
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
                        <div class="item-actions item-actions-inline">
                            <button class="mini-action" data-action="edit-moment" data-route-id="${routeItem.id}" data-item-id="${moment.id}">Ред.</button>
                            <button class="mini-action danger-link" data-action="delete-moment" data-route-id="${routeItem.id}" data-item-id="${moment.id}" data-title="${moment.title}">Удалить</button>
                        </div>
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
                                    ${state.expenseCategories.length > 1 ? `<button class="section-link danger-link" data-action="delete-expense-category" data-category-id="${category.id}" data-category-label="${category.label}">Удалить</button>` : ''}
                                </div>
                            </div>
                            <div class="field-chip-list">
                                ${category.fields.map(field => `
                                    <span class="field-chip">
                                        ${field.label}
                                        <button type="button" class="chip-remove" data-action="remove-expense-field" data-category-id="${category.id}" data-field-id="${field.id}" data-field-label="${field.label}">×</button>
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="button-row">
                    <button class="btn btn-secondary" data-action="clear-demo">Удалить ознакомительные данные</button>
                </div>
            </div>
        </section>
    `;
}

function renderBottomNav(state) {
    const items = [
        ['dashboard', '⌂', 'Дашборд'],
        ['library', '▣', 'Материалы'],
        ['settings', '☰', 'Система']
    ];
    const activeScreen = state.ui.screen === 'route' ? 'dashboard' : state.ui.screen;

    navEl.innerHTML = items.map(([screen, icon, label]) => `
        <button class="nav-button ${activeScreen === screen ? 'active' : ''}" data-screen="${screen}">
            <span class="nav-icon">${icon}</span>
            <span class="nav-label">${label}</span>
        </button>
    `).join('');

    navEl.querySelectorAll('[data-screen]').forEach(button => {
        button.addEventListener('click', () => {
            const screen = button.dataset.screen;
            store.navigate(screen);
        });
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

    const route = state.ui.captureMeta?.routeId
        ? state.routes.find(item => item.id === state.ui.captureMeta.routeId)
        : getSelectedRoute(state);
    if (!route && !canOpenWithoutRoute(type)) {
        store.closeCapture();
        window.alert('Сначала создай маршрут, чтобы добавлять записи, шаги плана, расходы и чеклисты.');
        return;
    }
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

    if (type === 'confirm-delete') {
        modalRoot.querySelector('[data-action="confirm-delete"]').addEventListener('click', () => {
            runDeleteAction(state.ui.captureMeta);
        });
        return;
    }

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
    if (type === 'confirm-delete') {
        const content = getDeleteModalContent(meta);

        return `
            <div class="section-header">
                <h3 class="section-title">${content.title}</h3>
                <span class="soft-pill">${content.badge}</span>
            </div>
            <p class="muted-copy" style="font-size: 13px; line-height: 1.45; margin-top: 10px;">${content.message}</p>
            <div class="button-row">
                <button type="button" class="btn btn-secondary" data-action="cancel-modal">Отмена</button>
                <button type="button" class="btn btn-primary danger-button" data-action="confirm-delete">${content.confirmLabel}</button>
            </div>
        `;
    }

    const routeContext = route || {
        title: 'Маршрут',
        region: '',
        moments: [],
        expenses: [],
        waypoints: [],
        planSteps: [],
        checklists: []
    };
    const editingRoute = meta.routeId ? state.routes.find(item => item.id === meta.routeId) : null;
    const editingMoment = meta.itemId ? routeContext.moments.find(item => item.id === meta.itemId) : null;
    const editingExpense = meta.itemId ? routeContext.expenses.find(item => item.id === meta.itemId) : null;
    const editingWaypoint = meta.itemId ? routeContext.waypoints.find(item => item.id === meta.itemId) : null;
    const editingPlanStep = meta.itemId ? routeContext.planSteps.find(item => item.id === meta.itemId) : null;
    const editingChecklist = meta.itemId ? routeContext.checklists.find(item => item.id === meta.itemId) : null;
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
            title: editingMoment ? 'Редактировать запись' : 'Новая запись',
            badge: routeContext.title,
            fields: `
                <input type="hidden" name="routeId" value="${routeContext.id || ''}">
                <input type="hidden" name="itemId" value="${editingMoment?.id || ''}">
                <div class="field"><label>Заголовок</label><input name="title" required placeholder="Что произошло или зацепило?" value="${editingMoment?.title || ''}"></div>
                <div class="field"><label>Категория</label><select name="category">
                    <option value="insight" ${editingMoment?.category === 'insight' ? 'selected' : ''}>Инсайт</option>
                    <option value="food" ${editingMoment?.category === 'food' ? 'selected' : ''}>Еда</option>
                    <option value="location" ${editingMoment?.category === 'location' ? 'selected' : ''}>Локация</option>
                </select></div>
                <div class="field"><label>Локация</label><input name="location" placeholder="${routeContext.region}" value="${editingMoment?.location || ''}"></div>
                <div class="field"><label>Текст</label><textarea name="content" required placeholder="Короткая мысль, эмоция, идея для поста или гида">${editingMoment?.content || ''}</textarea></div>
            `
        },
        expense: {
            title: editingExpense ? 'Редактировать расход' : 'Новый расход',
            badge: routeContext.title,
            fields: `
                <input type="hidden" name="itemId" value="${editingExpense?.id || ''}">
                <div class="field"><label>Категория</label><select name="category">${expenseCategoryOptions}</select></div>
                <div class="field"><label>Сумма</label><input name="amount" type="number" required placeholder="0" value="${editingExpense?.amount || ''}"></div>
                <div class="field-grid" data-role="expense-fields"></div>
            `
        },
        waypoint: {
            title: editingWaypoint ? 'Редактировать точку' : 'Новая точка',
            badge: routeContext.title,
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
            badge: routeContext.title,
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
            badge: routeContext.title,
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

    return `# ${route.title}\n\nСтатус: ${getStatusLabel(route.status)}\nРегион: ${route.region}\nДаты: ${route.dateRange}\n\n## Записи\n${highlights || '- Пока нет собранных записей'}\n\n## План\n${planLines}\n\n## Бюджет\n${expenseLines}\n\n## Чеклисты\n${checklistLines}`;
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
    const stopRouteOpen = event => {
        event.preventDefault();
        event.stopPropagation();
    };

    mainEl.querySelectorAll('.route-open[data-route-id]').forEach(button => {
        button.addEventListener('click', () => store.selectRoute(button.dataset.routeId));
    });

    mainEl.querySelectorAll('[data-capture]').forEach(button => {
        button.addEventListener('click', () => {
            const captureType = button.dataset.capture;
            if (!state.routes.length && !canOpenWithoutRoute(captureType)) {
                store.openCapture('route');
                return;
            }
            store.openCapture(captureType);
        });
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

    mainEl.querySelectorAll('[data-action="clear-demo"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'clear-demo'
        }));
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
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'remove-expense-field',
            categoryId: button.dataset.categoryId,
            fieldId: button.dataset.fieldId,
            fieldLabel: button.dataset.fieldLabel
        }));
    });

    mainEl.querySelectorAll('[data-action="delete-expense-category"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'delete-expense-category',
            categoryId: button.dataset.categoryId,
            categoryLabel: button.dataset.categoryLabel
        }));
    });

    mainEl.querySelectorAll('[data-action="edit-route"]').forEach(button => {
        button.addEventListener('click', event => {
            stopRouteOpen(event);
            store.openCapture('route', { routeId: button.dataset.routeId });
        });
    });

    mainEl.querySelectorAll('[data-action="delete-route"]').forEach(button => {
        button.addEventListener('click', event => {
            stopRouteOpen(event);
            askDeleteConfirmation({
                action: 'delete-route',
                routeId: button.dataset.routeId,
                title: button.dataset.title
            });
        });
    });

    mainEl.querySelectorAll('[data-action="edit-moment"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('moment', { routeId: button.dataset.routeId || route?.id, itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-moment"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'delete-moment',
            routeId: button.dataset.routeId || route?.id,
            itemId: button.dataset.itemId,
            title: button.dataset.title
        }));
    });

    mainEl.querySelectorAll('[data-action="edit-expense"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('expense', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-expense"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'delete-expense',
            routeId: route.id,
            itemId: button.dataset.itemId,
            title: button.dataset.title
        }));
    });

    mainEl.querySelectorAll('[data-action="edit-waypoint"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('waypoint', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-waypoint"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'delete-waypoint',
            routeId: route.id,
            itemId: button.dataset.itemId,
            title: button.dataset.title
        }));
    });

    mainEl.querySelectorAll('[data-action="edit-plan-step"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('plan-step', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-plan-step"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'delete-plan-step',
            routeId: route.id,
            itemId: button.dataset.itemId,
            title: button.dataset.title
        }));
    });

    mainEl.querySelectorAll('[data-action="cycle-plan-step"]').forEach(button => {
        button.addEventListener('click', () => store.cyclePlanStepStatus(route.id, button.dataset.itemId));
    });

    mainEl.querySelectorAll('[data-action="edit-checklist"]').forEach(button => {
        button.addEventListener('click', () => store.openCapture('checklist', { itemId: button.dataset.itemId }));
    });

    mainEl.querySelectorAll('[data-action="delete-checklist"]').forEach(button => {
        button.addEventListener('click', () => askDeleteConfirmation({
            action: 'delete-checklist',
            routeId: route.id,
            itemId: button.dataset.itemId,
            title: button.dataset.title
        }));
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

function maybeShowIntroNotice() {
    if (localStorage.getItem(INTRO_NOTICE_KEY)) {
        return;
    }

    window.alert('В приложении добавлены ознакомительные маршруты, записи и расходы. Их можно удалить в разделе "Система" кнопкой "Удалить ознакомительные данные". Категории расходов и их поля при этом сохранятся.');
    localStorage.setItem(INTRO_NOTICE_KEY, '1');
}

store.subscribe(render);
render(store.getState());
maybeShowIntroNotice();
