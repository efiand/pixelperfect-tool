# Changelog

Формат — [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версии — [SemVer](https://semver.org/lang/ru/).

## [2.0.2] - 2026-06-16

### Fixed

- [`package.json`](package.json): убран `postinstall`, который ломал `npm install` у потребителей.

## [2.0.1] - 2026-06-16

### Fixed

- [`nuxt/runtime/pixelperfect-storage.client.js`](nuxt/runtime/pixelperfect-storage.client.js): убрана зависимость от глобального `defineNuxtPlugin` (устраняет `ReferenceError` в Nuxt runtime).

## [2.0.0] - 2026-06-15

### Added

- Тесты (`node:test` + happy-dom): [`test/index.spec.js`](test/index.spec.js), [`test/lib/`](test/lib/), [`test/loader.spec.js`](test/loader.spec.js), [`test/vue/`](test/vue/), [`test/nuxt/`](test/nuxt/), [`test/tools/`](test/tools/); хелпер [`test/helpers/happy-dom.js`](test/helpers/happy-dom.js).
- [`lib/ensure-pp-offsets.js`](lib/ensure-pp-offsets.js) — миграция `ppOffsets` в `localStorage` (ядро и Nuxt).
- [`tools/check-function-order.js`](tools/check-function-order.js) — порядок top-level функций и JSDoc по образцу site-core.
- [`tools/restore-rolldown-wasm-lockfile.js`](tools/restore-rolldown-wasm-lockfile.js) — optional `@emnapi/*` для rolldown wasm не выпадают из lockfile на Windows.
- [`tools/upgrade-github-actions.js`](tools/upgrade-github-actions.js); `npm run upgrade` — devDependencies, browserslist-db, GitHub Actions.
- Скрипты `verify` и `prepublishOnly` в [`package.json`](package.json) (lint + test + build перед `npm publish`).
- Типы: [`types/pixelperfect.d.ts`](types/pixelperfect.d.ts), [`types/tools.d.ts`](types/tools.d.ts), [`types/npm.d.ts`](types/npm.d.ts), [`types/nuxt-runtime.d.ts`](types/nuxt-runtime.d.ts), [`types/import-meta.d.ts`](types/import-meta.d.ts), [`types/index.d.ts`](types/index.d.ts), colocated [`index.d.ts`](index.d.ts).
- `devDependencies`: `happy-dom`, `@vue/test-utils`, `vue`, `@nuxt/kit` (для тестов).
- README: бейджи npm, CI и тестов.

### Changed

- **Breaking:** named export `loadPixelperfect` в [`index.js`](index.js) вместо default; обновите `import { loadPixelperfect } from 'pixelperfect-tool'`.
- [`biome.json`](biome.json) — правила site-core (`noDefaultExport`, `useExportsLast`, kebab-case и др.).
- [`post-build.js`](post-build.js) → [`tools/post-build.js`](tools/post-build.js): `dist/` для GitHub Pages — `index.md` (из README), [`CHANGELOG.md`](CHANGELOG.md), `_config.yml`, `pixelperfect.min.js` (без копии `README.md` в `dist/`).
- CI [`.github/workflows/ci.yml`](.github/workflows/ci.yml): lint, test, build; deploy на GitHub Pages через официальные actions (`configure-pages`, `jekyll-build-pages`, `upload-pages-artifact`, `deploy-pages`) вместо peaceiris и ветки `gh-pages`.
- [`.editorconfig`](.editorconfig), [`.vscode/settings.json`](.vscode/settings.json), [`.vscode/extensions.json`](.vscode/extensions.json).
- `pre-commit`: `lint-format` + `test`; в `test` — `--disable-warning=ExperimentalWarning` для `mock.module`.
- Явный `exports` в [`package.json`](package.json) для `.`, `./loader.js`, `./vue`, `./nuxt`.
- JSDoc: `@type` с сигнатурой функции; без `@ts-nocheck` в исходниках и тестах.

### Fixed

- [`index.js`](index.js): `JSON.parse` для отсутствующих или сброшенных `ppOffsets` (после hotkey `R`); вызов `ensureValidPpOffsets()` при инициализации.
- [`nuxt/runtime/pixelperfect-storage.client.js`](nuxt/runtime/pixelperfect-storage.client.js) — client plugin сбрасывает битый `ppOffsets` до init.
- [`README.md`](README.md): ссылка на changelog — локальный [`CHANGELOG.md`](CHANGELOG.md) (работает на GitHub Pages).

## [1.9.4] - 2025-09-03

### Changed

- Сборка IIFE через Rolldown ([`rolldown.config.js`](rolldown.config.js)) вместо webpack.
- Biome: линт и форматирование ([`biome.json`](biome.json)).
- Type-check: JSDoc `@type` в [`index.js`](index.js), [`tsconfig.json`](tsconfig.json).

### Fixed

- Нет обрезки overlay, если высота `_ppElement` — 100%.

## [1.8.1] - 2023-11-15

### Fixed

- [`index.js`](index.js): концевой слэш убирается из имени страницы (`page`).

## [1.8.0] - 2023-11-02

### Added

- Vue-компонент отдельно от Nuxt: [`vue/index.js`](vue/index.js).

### Changed

- Повторная инициализация блокируется (`window.isPPLoaded`).

### Fixed

- Предупреждение resolve компонента в Nuxt-модуле.

## [1.7.1] - 2023-10-15

### Added

- Nuxt-модуль [`nuxt/index.js`](nuxt/index.js) и глобальный компонент `PixelperfectTool`.

## [1.6.0] - 2023-09-26

### Added

- TypeScript-декларации: [`index.d.ts`](index.d.ts).

## [1.5.0] - 2023-09-26

### Added

- Опции передаются аргументом `loadPixelperfect(options)` в [`index.js`](index.js) (раньше только `window.pixelperfect`).

## [1.4.2] - 2023-09-26

### Changed

- Обновление зависимостей в [`package.json`](package.json) — устранение уязвимостей.

## [1.4.0] - 2022-12-14

### Fixed

- [`index.js`](index.js): `this._offsets[this._page][this._currentBreakpoint] is undefined`.
- Сохранение позиции скролла, если целевой элемент изначально с `position: fixed`.

## [1.3.1] - 2022-12-09

### Changed

- Имя npm-пакета: `pixelperfect-tool` ([`package.json`](package.json), [`README.md`](README.md)).

## [1.2.1] - 2022-11-25

### Changed

- Имя пакета: `@efiand/pixelperfect`.
- CSS-класс `.pineglade-pp` → `.pixelperfect`; объект настроек `window.pinegladePP` → `window.pixelperfect` ([`index.js`](index.js)).

## [1.1.4] - 2022-04-25

### Changed

- Смещение макета: `transform` → `background-position` в [`index.js`](index.js) — без лишних скроллбаров при кастомном `selector`.

## [1.1.2] - 2022-04-25

### Added

- Опция `selector` в `window.pixelperfect` (по умолчанию `body`).
- Этот [`CHANGELOG.md`](CHANGELOG.md).

### Changed

- Дефолтный desktop-брейкпоинт: 1260 → 1240.

## [1.0.9] - 2022-03-23

### Fixed

- Значение `--pp-img` на macOS ([`index.js`](index.js)).

## [1.0.8] - 2022-03-17

### Added

- Игнорирование hotkeys при зажатых модификаторах (Ctrl/Shift/Alt/Meta).

### Changed

- Рефакторинг кода ([@fyvfyv](https://github.com/fyvfyv), [#1](https://github.com/efiand/pixelperfect-tool/pull/1)).

## [1.0.6] - 2022-03-11

### Added

- Hotkey `R`: очистка `ppOffsets` в `localStorage` и перезагрузка страницы.

### Changed

- Обновление npm-зависимостей.

## [1.0.5] - 2022-01-12

### Added

- Hotkey `I`: переключение инверсии макета (по умолчанию включена).

### Changed

- Документация hotkeys в [`README.md`](README.md); npm-shield в README.

## [1.0.0] - 2022-01-12

### Added

- Первый релиз: overlay скриншотов макетов в dev, hotkeys, `localStorage`, [`index.js`](index.js), [`loader.js`](loader.js).
