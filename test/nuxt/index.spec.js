/// <reference path="../../types/index.d.ts" />

import assert from 'node:assert/strict';
import { before, describe, mock, test } from 'node:test';

const addComponent = mock.fn(async () => {});
const addPlugin = mock.fn();
const resolve = mock.fn((target) => `/resolved/${target}`);

mock.module('@nuxt/kit', {
	namedExports: {
		addComponent,
		addPlugin,
		createResolver: () => ({ resolve }),
		defineNuxtModule: (/** @type {unknown} */ definition) => definition,
	},
});

describe('nuxt/index', () => {
	/** @type {{ setup: () => Promise<void> }} */
	let nuxtModule;

	before(async () => {
		nuxtModule = (await import('../../nuxt/index.js')).default;
		addComponent.mock.resetCalls();
		addPlugin.mock.resetCalls();
	});

	test('setup регистрирует глобальный компонент и client plugin', async () => {
		await nuxtModule.setup();
		assert.equal(addComponent.mock.callCount(), 1);
		assert.equal(addPlugin.mock.callCount(), 1);
		const componentArgs = /** @type {unknown[]} */ (addComponent.mock.calls[0].arguments);
		const componentCall = /** @type {{ name: string; global: boolean }} */ (componentArgs[0]);
		assert.equal(componentCall.name, 'PixelperfectTool');
		assert.equal(componentCall.global, true);
		const pluginArgs = /** @type {unknown[]} */ (addPlugin.mock.calls[0].arguments);
		const pluginCall = /** @type {{ mode: string; src: string }} */ (pluginArgs[0]);
		assert.equal(pluginCall.mode, 'client');
		assert.match(pluginCall.src, /pixelperfect-storage\.client\.js$/);
	});
});
