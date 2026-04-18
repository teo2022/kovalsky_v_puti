export const defaultExpenseCategories = [
    {
        id: 'food',
        label: 'Еда',
        icon: '🍽️',
        fields: [
            { id: 'place', label: 'Заведение', type: 'text', placeholder: 'Название кафе' },
            { id: 'cuisine', label: 'Кухня', type: 'text', placeholder: 'Локальная, грузинская, итальянская' },
            { id: 'dish', label: 'Блюдо', type: 'text', placeholder: 'Что заказали' },
            { id: 'rating', label: 'Оценка (1-5)', type: 'number', placeholder: '5' }
        ]
    },
    {
        id: 'transport',
        label: 'Транспорт',
        icon: '⛽',
        fields: [
            { id: 'type', label: 'Тип', type: 'select', options: ['Такси', 'Бензин', 'Автобус', 'Поезд', 'Самолет', 'Каршеринг'] },
            { id: 'mileage', label: 'Пробег (км)', type: 'number', placeholder: '0' },
            { id: 'route', label: 'Маршрут', type: 'text', placeholder: 'Откуда — куда' }
        ]
    },
    {
        id: 'accommodation',
        label: 'Жилье',
        icon: '🏨',
        fields: [
            { id: 'name', label: 'Название', type: 'text', placeholder: 'Отель или глэмпинг' },
            { id: 'nights', label: 'Ночей', type: 'number', placeholder: '1' },
            { id: 'comfort', label: 'Комфорт', type: 'select', options: ['Люкс', 'Стандарт', 'Эконом', 'Общий', 'Палатка'] }
        ]
    },
    {
        id: 'souvenirs',
        label: 'Сувениры',
        icon: '🎁',
        fields: [
            { id: 'item', label: 'Вещь', type: 'text', placeholder: 'Что купили' },
            { id: 'place', label: 'Где куплено', type: 'text', placeholder: 'Магазин или рынок' },
            { id: 'forWhom', label: 'Для кого', type: 'text', placeholder: 'Себе, маме, друзьям' }
        ]
    },
    {
        id: 'entertainment',
        label: 'Развлечения',
        icon: '🎟️',
        fields: [
            { id: 'activity', label: 'Активность', type: 'text', placeholder: 'Музей, экскурсия, подъемник' },
            { id: 'duration', label: 'Длительность', type: 'text', placeholder: '2 часа' },
            { id: 'impression', label: 'Впечатление', type: 'text', placeholder: 'Стоило ли того' }
        ]
    },
    {
        id: 'other',
        label: 'Прочее',
        icon: '📦',
        fields: [
            { id: 'comment', label: 'Комментарий', type: 'text', placeholder: 'Что это было' }
        ]
    }
];

export const demoState = {
    ui: {
        screen: 'dashboard',
        selectedRouteId: 'route-altai',
        routeTab: 'timeline',
        captureType: null,
        captureMeta: null
    },
    expenseCategories: defaultExpenseCategories,
    routes: [
        {
            id: 'route-altai',
            title: 'Алтай / Кату-Ярык',
            status: 'active',
            dateRange: '18–27 июля',
            region: 'Горный Алтай',
            coverMood: 'Высокие перевалы, дороги, реки, стоянки и быстрые идеи для постов.',
            tags: ['roadtrip', 'mountains', 'summer'],
            waypoints: [
                { id: 'wp-1', title: 'Перевал Кату-Ярык', type: 'viewpoint', visited: true, note: 'Главный рассвет поездки' },
                { id: 'wp-2', title: 'Стоянка у Чулышмана', type: 'stay', visited: false, note: 'Ночевка и костер' }
            ],
            moments: [
                { id: 'm-1', title: 'Утренний свет на серпантине', category: 'insight', content: 'Снять рилс с первым солнечным пятном на склоне. Добавить звук ветра без музыки.', createdAt: '08:12', location: 'Кату-Ярык' },
                { id: 'm-2', title: 'Хычины на заправке', category: 'food', content: 'Неожиданно сильная точка для гида: вкус, цена, атмосфера, дорожный вайб.', createdAt: '11:40', location: 'Акташ' }
            ],
            expenses: [
                {
                    id: 'e-1',
                    title: 'Топливо',
                    category: 'transport',
                    amount: 3400,
                    createdAt: '09:25',
                    details: {
                        type: 'Бензин',
                        mileage: '450',
                        route: 'Горно-Алтайск — Акташ'
                    }
                },
                {
                    id: 'e-2',
                    title: 'Обед в дороге',
                    category: 'food',
                    amount: 1250,
                    createdAt: '13:10',
                    details: {
                        place: 'Кафе у дороги',
                        cuisine: 'Алтайская',
                        dish: 'Хычины + чай',
                        rating: '5'
                    }
                }
            ],
            drafts: [
                { id: 'd-1', title: '5 кадров, которые продают ощущение дороги', status: 'draft' }
            ],
            planSteps: [
                {
                    id: 'plan-a1',
                    title: 'Рассвет на серпантине',
                    type: 'shoot',
                    time: '06:00',
                    priority: 'high',
                    status: 'done',
                    note: 'Подняться затемно, снять общий план и проходку по дороге.',
                    result: 'Сняты общий кадр, вертикаль и звук ветра. Можно собирать рилс.'
                },
                {
                    id: 'plan-a2',
                    title: 'Заправка и короткий food-stop',
                    type: 'stop',
                    time: '11:00',
                    priority: 'medium',
                    status: 'doing',
                    note: 'Проверить локальную еду и снять деталь дорожной атмосферы.',
                    result: 'Найдено кафе, нужно добрать крупные планы еды.'
                },
                {
                    id: 'plan-a3',
                    title: 'Доехать до стоянки у Чулышмана',
                    type: 'logistics',
                    time: '18:30',
                    priority: 'high',
                    status: 'todo',
                    note: 'Успеть заселиться до темноты и проверить точку для вечернего кадра.',
                    result: ''
                }
            ],
            checklists: [
                {
                    id: 'c-1',
                    title: 'Что взять с собой',
                    kind: 'packing',
                    note: 'Базовый набор для съемочного дня и дороги.',
                    items: [
                        { id: 'c-1-1', label: 'Камера', done: true },
                        { id: 'c-1-2', label: 'Вторая батарея', done: true },
                        { id: 'c-1-3', label: 'Петличка', done: false },
                        { id: 'c-1-4', label: 'Пауэрбанк', done: true },
                        { id: 'c-1-5', label: 'Штатив', done: false }
                    ]
                },
                {
                    id: 'c-1b',
                    title: 'Куда заехать между точками',
                    kind: 'detour',
                    note: 'Дополнительные заезды, если будет запас по свету и времени.',
                    items: [
                        { id: 'c-1b-1', label: 'Смотровая выше перевала', done: true },
                        { id: 'c-1b-2', label: 'Лавка с местным сыром', done: false },
                        { id: 'c-1b-3', label: 'Каменный берег у Чулышмана', done: false }
                    ]
                }
            ]
        },
        {
            id: 'route-karelia',
            title: 'Карелия / Ладожские шхеры',
            status: 'planned',
            dateRange: '5–12 августа',
            region: 'Карелия',
            coverMood: 'Вода, лодки, туман и спокойные editorial-кадры.',
            tags: ['north', 'water', 'calm'],
            waypoints: [
                { id: 'wp-3', title: 'Сортавала', type: 'city', visited: false, note: 'База для первого дня' },
                { id: 'wp-4', title: 'Шхеры', type: 'nature', visited: false, note: 'Понадобится катер' }
            ],
            moments: [],
            expenses: [
                {
                    id: 'e-3',
                    title: 'Бронь домика',
                    category: 'accommodation',
                    amount: 9800,
                    createdAt: '18:20',
                    details: {
                        name: 'Лесной дом у воды',
                        nights: '2',
                        comfort: 'Стандарт'
                    }
                }
            ],
            drafts: [
                { id: 'd-2', title: 'Маршрут спокойного северного уикенда', status: 'idea' }
            ],
            planSteps: [
                {
                    id: 'plan-k1',
                    title: 'Подтвердить катер по шхерам',
                    type: 'logistics',
                    time: '12:00',
                    priority: 'high',
                    status: 'doing',
                    note: 'Согласовать время выхода и запасной слот на плохую погоду.',
                    result: 'Есть два слота, жду подтверждение по утру.'
                },
                {
                    id: 'plan-k2',
                    title: 'Собрать спокойный moodboard поездки',
                    type: 'content',
                    time: '20:00',
                    priority: 'medium',
                    status: 'todo',
                    note: 'Подобрать 5 референсов под туман, лодки и воду.',
                    result: ''
                }
            ],
            checklists: [
                {
                    id: 'c-2',
                    title: 'Бронь и логистика',
                    kind: 'plan',
                    note: 'Перед выездом закрыть обязательные организационные пункты.',
                    items: [
                        { id: 'c-2-1', label: 'Подтвердить бронь домика', done: true },
                        { id: 'c-2-2', label: 'Уточнить катер по шхерам', done: true },
                        { id: 'c-2-3', label: 'Собрать дождевики', done: false },
                        { id: 'c-2-4', label: 'Проверить парковку у причала', done: false },
                        { id: 'c-2-5', label: 'Скачать офлайн-карты', done: false }
                    ]
                }
            ]
        },
        {
            id: 'route-caucasus',
            title: 'Кавказ / Спонтанный заезд',
            status: 'spontaneous',
            dateRange: 'Без жестких дат',
            region: 'Северный Кавказ',
            coverMood: 'Гибкий маршрут под неожиданные локации и быстрый контент.',
            tags: ['spontaneous', 'food', 'local'],
            waypoints: [],
            moments: [
                { id: 'm-3', title: 'Где местные едят после 22:00', category: 'food', content: 'Сделать короткий формат: 3 места без туристического лоска.', createdAt: '22:05', location: 'Нальчик' }
            ],
            expenses: [],
            drafts: [],
            planSteps: [],
            checklists: []
        }
    ]
};
