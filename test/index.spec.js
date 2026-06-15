/// <reference path="../types/index.d.ts" />

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { loadPixelperfect } from '../index.js';
import { createHappyDomWindow, installBrowserGlobals, uninstallBrowserGlobals } from './helpers/happy-dom.js';

/** @param {string} [pathname='/'] */
function setupWindow(pathname = '/') {
	const happyDomWindow = createHappyDomWindow(pathname);
	installBrowserGlobals(happyDomWindow);
	document.body.tabIndex = 0;
	document.body.focus();
	return happyDomWindow;
}

function dispatchKey(/** @type {string} */ code, options = {}) {
	document.dispatchEvent(
		new KeyboardEvent('keydown', {
			bubbles: true,
			cancelable: true,
			code,
			...options,
		}),
	);
}

describe('index/loadPixelperfect', () => {
	afterEach(() => {
		uninstallBrowserGlobals();
	});

	beforeEach(() => {
		setupWindow();
	});

	test('повторный вызов не инициализирует модуль снова', () => {
		loadPixelperfect();
		assert.equal(window.isPPLoaded, true);
		const styleCount = document.head.querySelectorAll('style').length;
		loadPixelperfect();
		assert.equal(document.head.querySelectorAll('style').length, styleCount);
	});

	test('добавляет стиль pixelperfect в head', () => {
		loadPixelperfect();
		const styleElement = document.head.querySelector('style');
		assert.ok(styleElement);
		assert.match(styleElement?.textContent ?? '', /\.pixelperfect/);
	});

	test('определяет страницу из pathname', () => {
		setupWindow('/about.html');
		loadPixelperfect({ breakpoints: [320] });
		dispatchKey('KeyP');
		Object.defineProperty(document.body, 'clientWidth', { configurable: true, value: 400 });
		window.dispatchEvent(new window.Event('resize'));
		const bg = document.body.style.getPropertyValue('--pp-img');
		assert.match(bg, /\/about-320\./);
	});

	test('принимает опции page, folder и breakpoints', () => {
		loadPixelperfect({
			breakpoints: [768, 320, 768],
			ext: 'png',
			folder: 'img/pp',
			page: 'home',
		});
		assert.equal(window.isPPLoaded, true);
	});

	test('не падает при отсутствующих ppOffsets', () => {
		assert.doesNotThrow(() => loadPixelperfect());
	});

	test('не падает при ppOffsets = {}', () => {
		localStorage.setItem('ppOffsets', '{}');
		assert.doesNotThrow(() => loadPixelperfect());
	});

	test('не падает при битом JSON в ppOffsets', () => {
		localStorage.setItem('ppOffsets', '{invalid');
		assert.doesNotThrow(() => loadPixelperfect());
	});

	test('KeyP переключает класс pixelperfect', () => {
		loadPixelperfect();
		assert.equal(document.body.classList.contains('pixelperfect'), false);
		dispatchKey('KeyP');
		assert.equal(document.body.classList.contains('pixelperfect'), true);
		assert.equal(localStorage.getItem('pp'), '1');
		dispatchKey('KeyP');
		assert.equal(document.body.classList.contains('pixelperfect'), false);
	});

	test('KeyI меняет инверсию только при включённом PP', () => {
		loadPixelperfect();
		dispatchKey('KeyP');
		const filterBefore = document.body.style.getPropertyValue('--pp-filter');
		dispatchKey('KeyI');
		const filterAfter = document.body.style.getPropertyValue('--pp-filter');
		assert.notEqual(filterBefore, filterAfter);
	});

	test('стрелки смещают offset при включённом PP', () => {
		Object.defineProperty(document.body, 'clientWidth', { configurable: true, value: 400 });
		loadPixelperfect({ breakpoints: [320], page: 'index' });
		dispatchKey('KeyP');
		dispatchKey('ArrowRight');
		assert.equal(document.body.style.getPropertyValue('--pp-offset-x'), '1px');
		const stored = JSON.parse(localStorage.getItem('ppOffsets') || '{}');
		assert.equal(stored.index[320][0], 1);
	});

	test('KeyR очищает ppOffsets и вызывает reload', () => {
		loadPixelperfect();
		localStorage.setItem('ppOffsets', '{"index":{"320":[1,2]}}');
		let reloadCalled = false;
		window.location.reload = () => {
			reloadCalled = true;
		};
		dispatchKey('KeyP');
		dispatchKey('KeyR');
		assert.equal(localStorage.getItem('ppOffsets'), null);
		assert.equal(reloadCalled, true);
	});

	test('игнорирует hotkeys с зажатым Ctrl', () => {
		loadPixelperfect();
		dispatchKey('KeyP', { ctrlKey: true });
		assert.equal(document.body.classList.contains('pixelperfect'), false);
	});

	test('resize меняет background-image для breakpoint', () => {
		Object.defineProperty(document.body, 'clientWidth', { configurable: true, value: 800 });
		loadPixelperfect({
			breakpoints: [320, 768],
			ext: 'png',
			folder: 'pp',
			page: 'index',
		});
		dispatchKey('KeyP');
		window.dispatchEvent(new window.Event('resize'));
		const bg = document.body.style.getPropertyValue('--pp-img');
		assert.match(bg, /pp\/index-768\.png/);
	});
});
