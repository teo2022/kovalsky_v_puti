import { demoState, defaultExpenseCategories } from '../data/demo-data.js';

const STORAGE_KEY = 'kovalsky_travel_os_v2';

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function slugify(value) {
    return String(value || '')
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]+/gi, '-')
        .replace(/^-+|-+$/g, '');
}

function createRouteShape(route = {}) {
    return {
        id: route.id || `route-${Date.now()}`,
        title: route.title || 'Новый маршрут',
        status: route.status || 'planned',
        dateRange: route.dateRange || 'Без дат',
        region: route.region || 'Новый регион',
        coverMood: route.coverMood || 'Короткое описание маршрута',
        tags: Array.isArray(route.tags) ? route.tags : [],
        waypoints: Array.isArray(route.waypoints) ? route.waypoints : [],
        moments: Array.isArray(route.moments) ? route.moments : [],
        expenses: Array.isArray(route.expenses) ? route.expenses : [],
        drafts: Array.isArray(route.drafts) ? route.drafts : [],
        checklists: Array.isArray(route.checklists) ? route.checklists : []
    };
}

function normalizeChecklistItem(item, index = 0) {
    if (typeof item === 'string') {
        return {
            id: `cli-${Date.now()}-${index}`,
            label: item,
            done: false
        };
    }

    return {
        id: item.id || `cli-${Date.now()}-${index}`,
        label: item.label || item.title || `Пункт ${index + 1}`,
        done: Boolean(item.done)
    };
}

function normalizeChecklist(checklist = {}) {
    const items = Array.isArray(checklist.items)
        ? checklist.items.map(normalizeChecklistItem)
        : Array.from({ length: Number(checklist.total || 0) }, (_, index) => normalizeChecklistItem({
            id: `legacy-${checklist.id || 'checklist'}-${index}`,
            label: `Пункт ${index + 1}`,
            done: index < Number(checklist.done || 0)
        }, index));

    return {
        id: checklist.id || `checklist-${Date.now()}`,
        title: checklist.title || 'Новый чеклист',
        kind: checklist.kind || 'packing',
        note: checklist.note || '',
        items
    };
}

function ensureStateShape(state) {
    const safeState = state || {};
    safeState.expenseCategories = Array.isArray(safeState.expenseCategories) && safeState.expenseCategories.length
        ? safeState.expenseCategories
        : clone(defaultExpenseCategories);

    safeState.routes = Array.isArray(safeState.routes) && safeState.routes.length
        ? safeState.routes.map(route => {
            const shapedRoute = createRouteShape(route);
            shapedRoute.checklists = shapedRoute.checklists.map(normalizeChecklist);
            return shapedRoute;
        })
        : clone(demoState.routes).map(route => {
            const shapedRoute = createRouteShape(route);
            shapedRoute.checklists = shapedRoute.checklists.map(normalizeChecklist);
            return shapedRoute;
        });

    safeState.ui = {
        screen: safeState.ui?.screen || 'dashboard',
        selectedRouteId: safeState.ui?.selectedRouteId || safeState.routes[0].id,
        routeTab: safeState.ui?.routeTab || 'timeline',
        captureType: safeState.ui?.captureType || null,
        captureMeta: safeState.ui?.captureMeta || null
    };

    return safeState;
}

function loadState() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            return ensureStateShape(JSON.parse(saved));
        }
    } catch (error) {
        console.error('Failed to load state', error);
    }

    return ensureStateShape(clone(demoState));
}

function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createStore() {
    let state = loadState();
    const listeners = new Set();

    function notify() {
        saveState(state);
        listeners.forEach(listener => listener(state));
    }

    function getSelectedRoute() {
        return state.routes.find(route => route.id === state.ui.selectedRouteId) || state.routes[0];
    }

    function getRouteById(routeId) {
        return state.routes.find(route => route.id === routeId);
    }

    function getExpenseCategory(categoryId) {
        return state.expenseCategories.find(category => category.id === categoryId) || state.expenseCategories[0];
    }

    function closeCaptureState() {
        state.ui.captureType = null;
        state.ui.captureMeta = null;
    }

    function buildExpenseDetails(payload, categoryId) {
        const category = getExpenseCategory(categoryId);
        const details = {};

        category.fields.forEach(field => {
            details[field.id] = payload[`field_${field.id}`] || '';
        });

        return details;
    }

    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        getState() {
            return state;
        },
        navigate(screen) {
            state.ui.screen = screen;
            notify();
        },
        selectRoute(routeId) {
            state.ui.selectedRouteId = routeId;
            state.ui.screen = 'route';
            notify();
        },
        setRouteTab(tab) {
            state.ui.routeTab = tab;
            notify();
        },
        openCapture(type, meta = null) {
            state.ui.captureType = type;
            state.ui.captureMeta = meta;
            notify();
        },
        closeCapture() {
            closeCaptureState();
            notify();
        },
        saveRoute(payload) {
            const editingRoute = payload.routeId ? getRouteById(payload.routeId) : null;

            if (editingRoute) {
                editingRoute.title = payload.title;
                editingRoute.status = payload.status;
                editingRoute.dateRange = payload.dateRange;
                editingRoute.region = payload.region;
                editingRoute.coverMood = payload.coverMood;
            } else {
                const newRoute = createRouteShape({
                    id: `route-${Date.now()}`,
                    title: payload.title,
                    status: payload.status,
                    dateRange: payload.dateRange,
                    region: payload.region,
                    coverMood: payload.coverMood
                });
                state.routes.unshift(newRoute);
                state.ui.selectedRouteId = newRoute.id;
                state.ui.screen = 'route';
            }

            closeCaptureState();
            notify();
        },
        deleteRoute(routeId) {
            if (state.routes.length <= 1) return;
            state.routes = state.routes.filter(route => route.id !== routeId);
            if (state.ui.selectedRouteId === routeId) {
                state.ui.selectedRouteId = state.routes[0].id;
                state.ui.screen = 'dashboard';
            }
            notify();
        },
        saveMoment(payload) {
            const route = getSelectedRoute();
            const editingMoment = payload.itemId ? route.moments.find(item => item.id === payload.itemId) : null;

            if (editingMoment) {
                editingMoment.title = payload.title;
                editingMoment.category = payload.category;
                editingMoment.location = payload.location;
                editingMoment.content = payload.content;
            } else {
                route.moments.unshift({
                    id: `m-${Date.now()}`,
                    title: payload.title,
                    category: payload.category,
                    content: payload.content,
                    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                    location: payload.location
                });
            }

            closeCaptureState();
            notify();
        },
        deleteMoment(routeId, itemId) {
            const route = getRouteById(routeId);
            if (!route) return;
            route.moments = route.moments.filter(item => item.id !== itemId);
            notify();
        },
        saveExpense(payload) {
            const route = getSelectedRoute();
            const editingExpense = payload.itemId ? route.expenses.find(item => item.id === payload.itemId) : null;
            const details = buildExpenseDetails(payload, payload.category);

            if (editingExpense) {
                editingExpense.title = payload.title;
                editingExpense.category = payload.category;
                editingExpense.amount = Number(payload.amount || 0);
                editingExpense.details = details;
            } else {
                route.expenses.unshift({
                    id: `e-${Date.now()}`,
                    title: payload.title,
                    category: payload.category,
                    amount: Number(payload.amount || 0),
                    createdAt: new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
                    details
                });
            }

            closeCaptureState();
            notify();
        },
        deleteExpense(routeId, itemId) {
            const route = getRouteById(routeId);
            if (!route) return;
            route.expenses = route.expenses.filter(item => item.id !== itemId);
            notify();
        },
        saveWaypoint(payload) {
            const route = getSelectedRoute();
            const editingWaypoint = payload.itemId ? route.waypoints.find(item => item.id === payload.itemId) : null;

            if (editingWaypoint) {
                editingWaypoint.title = payload.title;
                editingWaypoint.type = payload.type;
                editingWaypoint.note = payload.note;
            } else {
                route.waypoints.push({
                    id: `wp-${Date.now()}`,
                    title: payload.title,
                    type: payload.type,
                    visited: false,
                    note: payload.note
                });
            }

            closeCaptureState();
            notify();
        },
        deleteWaypoint(routeId, itemId) {
            const route = getRouteById(routeId);
            if (!route) return;
            route.waypoints = route.waypoints.filter(item => item.id !== itemId);
            notify();
        },
        saveChecklist(payload) {
            const route = getSelectedRoute();
            const editingChecklist = payload.itemId ? route.checklists.find(item => item.id === payload.itemId) : null;
            const items = String(payload.items || '')
                .split('\n')
                .map(item => item.trim())
                .filter(Boolean);

            if (editingChecklist) {
                const existingMap = new Map(editingChecklist.items.map(item => [item.label, item]));
                editingChecklist.title = payload.title;
                editingChecklist.kind = payload.kind;
                editingChecklist.note = payload.note || '';
                editingChecklist.items = items.map((label, index) => {
                    const existing = existingMap.get(label);
                    return {
                        id: existing?.id || `cli-${Date.now()}-${index}`,
                        label,
                        done: existing?.done || false
                    };
                });
            } else {
                route.checklists.unshift(normalizeChecklist({
                    id: `cl-${Date.now()}`,
                    title: payload.title,
                    kind: payload.kind,
                    note: payload.note,
                    items
                }));
            }

            closeCaptureState();
            notify();
        },
        deleteChecklist(routeId, itemId) {
            const route = getRouteById(routeId);
            if (!route) return;
            route.checklists = route.checklists.filter(item => item.id !== itemId);
            notify();
        },
        toggleChecklistItem(routeId, checklistId, checklistItemId) {
            const route = getRouteById(routeId);
            const checklist = route?.checklists.find(item => item.id === checklistId);
            const checklistItem = checklist?.items.find(item => item.id === checklistItemId);
            if (!checklistItem) return;
            checklistItem.done = !checklistItem.done;
            notify();
        },
        saveExpenseCategory(payload) {
            const editingId = payload.categoryId || null;
            const categoryId = editingId || slugify(payload.id || payload.label) || `category-${Date.now()}`;
            const existing = state.expenseCategories.find(category => category.id === editingId);

            if (existing) {
                existing.label = payload.label;
                existing.icon = payload.icon || existing.icon;
            } else {
                state.expenseCategories.push({
                    id: categoryId,
                    label: payload.label,
                    icon: payload.icon || '💸',
                    fields: []
                });
            }

            closeCaptureState();
            notify();
        },
        deleteExpenseCategory(categoryId) {
            if (state.expenseCategories.length <= 1) return;
            state.expenseCategories = state.expenseCategories.filter(category => category.id !== categoryId);
            notify();
        },
        addExpenseField(payload) {
            const category = getExpenseCategory(payload.categoryId);
            category.fields.push({
                id: slugify(payload.id || payload.label) || `field-${Date.now()}`,
                label: payload.label,
                type: payload.type,
                placeholder: payload.placeholder || '',
                options: payload.type === 'select'
                    ? String(payload.options || '')
                        .split(',')
                        .map(item => item.trim())
                        .filter(Boolean)
                    : undefined
            });

            closeCaptureState();
            notify();
        },
        removeExpenseField(categoryId, fieldId) {
            const category = getExpenseCategory(categoryId);
            category.fields = category.fields.filter(field => field.id !== fieldId);
            notify();
        },
        reset() {
            state = ensureStateShape(clone(demoState));
            notify();
        }
    };
}

export { createStore };
