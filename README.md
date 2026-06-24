# pixelperfect-tool [![npm version](https://img.shields.io/npm/v/pixelperfect-tool.svg)](https://www.npmjs.com/package/pixelperfect-tool) [![CI](https://github.com/efiand/pixelperfect-tool/actions/workflows/ci.yml/badge.svg?job=lint-test)](https://github.com/efiand/pixelperfect-tool/actions/workflows/ci.yml) [![tests](https://img.shields.io/badge/tests-28%20passing-brightgreen)](https://github.com/efiand/pixelperfect-tool/actions/workflows/ci.yml)

Модуль для накладывания скриншотов макетов поверх верстаемых страниц.
Позволяет:

- автоматически переключать скриншоты для проверки pixelperfect (далее – PP) при переходе между страницами и сменами адаптивных брейкпоинтов,
- смещать скриншоты, переключать режим инверсии,
- сохранять состояние между перезагрузками страницы и сеансами перезапуска сборки.

[История версий.](CHANGELOG.md)

## Горячие клавиши

Работают, когда фокус на `<body>`. Результат настроек сохраняется в localStorage.

- `P` – переключение всей функциональности (по умолчанию выключен). При отключении остальные хоткеи не действуют.
- `I` – режим инверсии макетов. По умолчанию включен.
- `R` – при включенном модуле очищает localStorage от данных по смещениям изображений и перезагружает страницу.
- `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight` – смещают положение изображения. Настройки сохраняются для каждой страницы и каждого брейкпоинта на ней.

## Прямое подключение скрипта

```html
<script>
  window.pixelperfect = {
    breakpoints: [320, 768, 1260, 1380, 1600],
    folder: 'img/pixelperfect',
  };
</script>
<script
  src="https://efiand.github.io/pixelperfect-tool/pixelperfect.min.js"
  defer
></script>
```

Отсутствие в production-режиме изображений PP и кода подключения скрипта – настраивается разработчиком отдельно исходя из возможностей его сборки.

## Подключение модуля

Установка: `npm i -DE pixelperfect-tool`.

Модуль инициализирует библиотеку только один раз независимо от количества вызовов.

### Добавление в систему сборки как есть

```js
window.pixelperfect = {
  breakpoints: [320, 768, 1260, 1380, 1600],
  folder: 'img/pixelperfect',
};

export * from 'pixelperfect-tool/loader.js';
```

### Использование лоадера

```js
import { loadPixelperfect } from 'pixelperfect-tool';

loadPixelperfect({
  breakpoints: [320, 768, 1260, 1380, 1600],
  folder: 'img/pixelperfect',
});
```

### Vue-компонент

Renderless-компонент с возможностью добавления опций.

```html
<template>
  <pixelperfect-tool :options="pixelperfectOptions" />
</template>

<script lang="ts" setup>
  import type { PixelperfectOptions } from 'pixelperfect-tool';
  import PixelperfectTool from 'pixelperfect-tool/vue';

  const pixelperfectOptions: PixelperfectOptions = {
    breakpoints: [320, 768, 1260, 1380, 1600],
    folder: 'img/pixelperfect',
  };
</script>
```

### Nuxt-модуль

Модуль регистрирует глобальный компонент `PixelperfectTool` — renderless-обёртка, в `onMounted` вызывает `loadPixelperfect()` только в dev (`import.meta.dev`). Нормализация `localStorage.ppOffsets` выполняется внутри `loadPixelperfect()` в основной либе.

Компонент нужно **явно добавить в layout или страницу**. Рекомендуется `v-if="import.meta.dev"`.

Подключение модуля в `nuxt.config.ts`:

```ts
const dev = process.env.NODE_ENV === 'development';

export default defineNuxtConfig({
  modules: ['pixelperfect-tool/nuxt'],

  // Скриншоты только в dev; baseURL должен совпадать с `folder` (дефолт — `pixelperfect`)
  nitro: {
    publicAssets: [
      ...(dev
        ? [
            {
              baseURL: '/pixelperfect',
              dir: 'dev/pixelperfect',
            },
          ]
        : []),
    ],
  },
});
```

Пример в layout (дефолты: `folder: 'pixelperfect'`, `ext: 'jpg'`, `breakpoints: [320, 768, 1240]`):

```vue
<template>
  <div>
    <slot />
    <pixelperfect-tool v-if="isDev" />
  </div>
</template>

<script setup lang="ts">
const isDev = import.meta.dev;
</script>
```

Переопределения — через `:options` (например, другой `folder` или `ext`); значение `folder` должно совпадать с `baseURL` в `nitro.publicAssets`.

Overlay по умолчанию выключен — включите hotkey **`P`** (фокус на `<body>`).

## Настройки

Передаются через объект `window.pixelperfect`. Все настройки опциональны, и если дефолтные подходят, то необходимости создавать объект нет.

- `page` – по умолчанию это URL загруженной страницы от корня (не включая корневой слэш и концевой `.html`, если он там есть). Например, для страницы `/about.html` значение будет `'about'`. Для главной страницы (`/`) – значение по умолчанию `'index'`.
- `breakpoints` – числовой массив ширин макетов (порядок произвольный). При первичной загрузке с определенной шириной окна или при ресайзе происходит смена картинки на подходящую для текущей ширины. Значение по умолчанию – `[320, 768, 1240]`. Если текущая ширина экрана меньше минимального брейкпоинта, фоновое изображение отключается.
- `folder` – имя каталога (относительно корня проекта), где лежат изображения. Значение по умолчанию – `'pixelperfect'`.
- `ext` – расширение изображений. По умолчанию – `'jpg'`.
- `selector` – CSS-селектор элемента, с которым связан функционал. Значение по умолчанию – `'body'`.

## Изображения

Формат путей к фоновым изображениям макетов (значения Настроек) – `/<folder>/<page>-<breakpoint>.<ext>`.
