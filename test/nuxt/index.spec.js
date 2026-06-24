/// <reference path="../../types/index.d.ts" />

import assert from 'node:assert/strict';
import { before, describe, mock, test } from 'node:test';

const addComponent = mock.fn(() => {});
const resolve = mock.fn((target) => `/resolved/${target}`);

mock.module('@nuxt/kit', {
	namedExports: {
		addComponent,
		createResolver: () => ({ resolve }),
		defineNuxtModule: (/** @type {unknown} */ definition) => definition,
	},
});

describe('nuxt/index', () => {
	/** @type {{ setup: () => void }} */
	let nuxtModule;

	before(async () => {
		nuxtModule = (await import('../../nuxt/index.js')).default;
		addComponent.mock.resetCalls();
	});

	test('setup регистрирует глобальный компонент', () => {
		nuxtModule.setup();
		assert.equal(addComponent.mock.callCount(), 1);
		const componentArgs = /** @type {unknown[]} */ (addComponent.mock.calls[0].arguments);
		const componentCall = /** @type {{ name: string; global: boolean }} */ (componentArgs[0]);
		assert.equal(componentCall.name, 'PixelperfectTool');
		assert.equal(componentCall.global, true);
	});
});
