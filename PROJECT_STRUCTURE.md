# Project Structure

## Current layout

- `index.html`
  Главный экран с экспортом, спонтанными заметками и списком маршрутов.
- `drive.html`
  Экран активного маршрута.
- `wait.html`
  Экран планируемого маршрута.
- `moment.html`
  Дашборд и экран спонтанных моментов.
- `navigation.js`
  Общая навигация между HTML-экранами.
- `js/core/app-core.js`
  Общий domain/storage слой: ключи хранилища, миграции, нормализация маршрутов, объединение данных.

## Why this helps for React Native

Сейчас общий код вынесен из экранов в `js/core/app-core.js`. Это прямой кандидат на перенос в:

- `src/core/storage`
- `src/core/models`
- `src/core/migrations`

HTML-файлы теперь можно воспринимать как будущие `screens`, а `app-core.js` как первый общий `service layer`.

## Recommended next migration steps

1. Вынести mock/demo данные в отдельный модуль `js/core/demo-data.js`.
2. Вынести операции над маршрутами в `js/core/route-service.js`.
3. Вынести операции над ритуалами/заметками в `js/core/ritual-service.js`.
4. Свести HTML-страницы к роли view-слоя без доменной логики.
5. После этого переносить экраны в React Native по одному, сохраняя тот же core-слой.
