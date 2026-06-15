/// <reference path="../types/index.d.ts" />

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';

import { createHappyDomWindow, installBrowserGlobals, uninstallBrowserGlobals } from './helpers/happy-dom.js';

describe('loader', () => {
	beforeEach(() => {
		installBrowserGlobals(createHappyDomWindow());
	});

	afterEach(() => {
		uninstallBrowserGlobals();
	});

	test('side-effect import инициализирует модуль', async () => {
		await import('../loader.js');
		assert.equal(window.isPPLoaded, true);
	});
});
