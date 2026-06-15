/// <reference path="../../types/index.d.ts" />

import assert from 'node:assert/strict';
import { before, describe, mock, test } from 'node:test';

import { createHappyDomWindow, installBrowserGlobals } from '../helpers/happy-dom.js';

const ensureValidPpOffsetsMock = mock.fn();

mock.module('../../lib/ensure-pp-offsets.js', {
	namedExports: {
		ensureValidPpOffsets: ensureValidPpOffsetsMock,
	},
});

globalThis.defineNuxtPlugin = (/** @type {() => void | Promise<void>} */ callback) => callback;

describe('nuxt/pixelperfect-storage.client', () => {
	before(async () => {
		ensureValidPpOffsetsMock.mock.resetCalls();
		installBrowserGlobals(createHappyDomWindow());
		const pluginModule = await import('../../nuxt/runtime/pixelperfect-storage.client.js');
		pluginModule.default();
	});

	test('плагин вызывает ensureValidPpOffsets', () => {
		assert.equal(ensureValidPpOffsetsMock.mock.callCount(), 1);
	});
});
