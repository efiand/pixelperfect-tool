/// <reference path="../../types/index.d.ts" />

import assert from 'node:assert/strict';
import { afterEach, describe, mock, test } from 'node:test';

import { createHappyDomWindow, installVueGlobals, uninstallVueGlobals } from '../helpers/happy-dom.js';

const loadPixelperfectMock = mock.fn();

mock.module('../../index.js', {
	namedExports: {
		loadPixelperfect: loadPixelperfectMock,
	},
});

describe('vue/PixelperfectTool', () => {
	afterEach(() => {
		uninstallVueGlobals();
	});

	test('рендерит содержимое слота', async () => {
		installVueGlobals(createHappyDomWindow());
		const { mount } = await import('@vue/test-utils');
		const { default: PixelperfectTool } = await import('../../vue/index.js');
		const wrapper = mount(PixelperfectTool, {
			slots: {
				default: '<span class="child">content</span>',
			},
		});
		assert.ok(wrapper.find('.child').exists());
	});

	test('не вызывает loadPixelperfect когда import.meta.dev ложен', async () => {
		installVueGlobals(createHappyDomWindow());
		loadPixelperfectMock.mock.resetCalls();
		const { mount } = await import('@vue/test-utils');
		const { default: PixelperfectTool } = await import('../../vue/index.js');
		mount(PixelperfectTool, {
			props: { options: { folder: 'pp' } },
		});
		assert.equal(loadPixelperfectMock.mock.callCount(), 0);
	});

	test('вызывает loadPixelperfect на mount в dev-окружении', async () => {
		mock.module('../../lib/is-dev-environment.js', {
			namedExports: {
				isDevEnvironment: () => true,
			},
		});
		installVueGlobals(createHappyDomWindow());
		loadPixelperfectMock.mock.resetCalls();
		const { mount } = await import('@vue/test-utils');
		const { default: PixelperfectTool } = await import(`../../vue/index.js?dev=${Date.now()}`);
		mount(PixelperfectTool, {
			props: { options: { folder: 'pp' } },
		});
		assert.equal(loadPixelperfectMock.mock.callCount(), 1);
		const callArgs = /** @type {unknown[]} */ (loadPixelperfectMock.mock.calls[0].arguments);
		assert.deepEqual(callArgs[0], { folder: 'pp' });
	});

	test('имеет имя PixelperfectTool', async () => {
		installVueGlobals(createHappyDomWindow());
		const { mount } = await import('@vue/test-utils');
		const { default: PixelperfectTool } = await import('../../vue/index.js');
		const { defineComponent } = await import('vue');
		const wrapper = mount(
			defineComponent({
				components: { PixelperfectTool },
				template: '<PixelperfectTool />',
			}),
		);
		assert.equal(wrapper.findComponent(PixelperfectTool).vm.$options.name, 'PixelperfectTool');
	});
});
