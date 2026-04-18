window.AppCore = (() => {
    const STORAGE_KEY = 'kowalski_travel_diary_app_v2';
    const LEGACY_STORAGE_KEYS = [
        'kowalski_travel_diary_full_v1',
        'kowalski_travel_diary_active_v2',
        'kowalski_travel_diary_rituals_v1',
        'kowalski_travel_diary_planned_v1'
    ];

    function createEmptyState() {
        return {
            routes: [],
            spontaneousNotes: [],
            rituals: [],
            customTags: []
        };
    }

    function mergeList(primary = [], secondary = []) {
        const result = [];
        const seen = new Set();

        [...primary, ...secondary].forEach(item => {
            const signature = item && typeof item === 'object'
                ? (item.id ? `id:${item.id}` : JSON.stringify(item))
                : String(item);

            if (!seen.has(signature)) {
                seen.add(signature);
                result.push(item);
            }
        });

        return result;
    }

    function normalizeRoute(route = {}, defaultType = 'planned') {
        return {
            id: route.id || Date.now().toString(),
            title: route.title || 'Новый маршрут',
            date: route.date || new Date().toLocaleDateString('ru-RU'),
            type: route.type || defaultType,
            waypoints: Array.isArray(route.waypoints) ? route.waypoints : [],
            notes: Array.isArray(route.notes) ? route.notes : [],
            expenses: Array.isArray(route.expenses) ? route.expenses : [],
            drafts: Array.isArray(route.drafts) ? route.drafts : [],
            checklists: Array.isArray(route.checklists) ? route.checklists : [],
            routeSegments: Array.isArray(route.routeSegments) ? route.routeSegments : [],
            gpsPoints: Array.isArray(route.gpsPoints) ? route.gpsPoints : []
        };
    }

    function mergeRoutes(primary = [], secondary = []) {
        const routeMap = new Map();

        [...secondary, ...primary].forEach(route => {
            const normalized = normalizeRoute(route, route?.type || 'planned');
            const existing = routeMap.get(normalized.id);

            if (!existing) {
                routeMap.set(normalized.id, normalized);
                return;
            }

            routeMap.set(normalized.id, {
                ...existing,
                ...normalized,
                waypoints: mergeList(existing.waypoints, normalized.waypoints),
                notes: mergeList(existing.notes, normalized.notes),
                expenses: mergeList(existing.expenses, normalized.expenses),
                drafts: mergeList(existing.drafts, normalized.drafts),
                checklists: mergeList(existing.checklists, normalized.checklists),
                routeSegments: mergeList(existing.routeSegments, normalized.routeSegments),
                gpsPoints: mergeList(existing.gpsPoints, normalized.gpsPoints)
            });
        });

        return Array.from(routeMap.values());
    }

    function normalizeState(rawState = {}) {
        return {
            routes: mergeRoutes(rawState.routes || []),
            spontaneousNotes: mergeList(rawState.spontaneousNotes || []),
            rituals: mergeList(rawState.rituals || []),
            customTags: mergeList(rawState.customTags || [])
        };
    }

    function loadStateFromKeys(keys) {
        return keys.reduce((acc, key) => {
            const saved = localStorage.getItem(key);
            if (!saved) return acc;

            const parsed = normalizeState(JSON.parse(saved));
            return {
                routes: mergeRoutes(acc.routes, parsed.routes),
                spontaneousNotes: mergeList(acc.spontaneousNotes, parsed.spontaneousNotes),
                rituals: mergeList(acc.rituals, parsed.rituals),
                customTags: mergeList(acc.customTags, parsed.customTags)
            };
        }, createEmptyState());
    }

    function clearLegacyStorage() {
        LEGACY_STORAGE_KEYS.forEach(key => localStorage.removeItem(key));
    }

    return {
        STORAGE_KEY,
        LEGACY_STORAGE_KEYS,
        createEmptyState,
        mergeList,
        normalizeRoute,
        loadStateFromKeys,
        clearLegacyStorage
    };
})();
