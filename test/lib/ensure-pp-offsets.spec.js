/// <reference path="../../types/index.d.ts" />

import assert from 'node:assert/strict';
import { afterEach, beforeEach, describe, test } from 'node:test';
import { Window } from 'happy-dom';

import { ensureValidPpOffsets } from '../../lib/ensure-pp-offsets.js';

describe('lib/ensure-pp-offsets', () => {
	beforeEach(() => {
		globalThis.localStorage = /** @type {Storage} */ (new Window().localStorage);
	});

	afterEach(() => {
		globalThis.localStorage.clear();
	});

	test('записывает {} при отсутствии ppOffsets', () => {
		ensureValidPpOffsets();
		assert.equal(localStorage.getItem('ppOffsets'), '{}');
	});

	test('сбрасывает битый JSON в {}', () => {
		localStorage.setItem('ppOffsets', 'not-json');
		ensureValidPpOffsets();
		assert.equal(localStorage.getItem('ppOffsets'), '{}');
	});

	test('не меняет валидный JSON', () => {
		const valid = '{"index":{"320":[0,0]}}';
		localStorage.setItem('ppOffsets', valid);
		ensureValidPpOffsets();
		assert.equal(localStorage.getItem('ppOffsets'), valid);
	});
});
