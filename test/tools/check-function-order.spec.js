import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';
import {
	checkFileFunctionBlankLines,
	checkFileFunctionOrder,
	checkFunctionOrder,
	getTopLevelFunctionNames,
} from '../../tools/check-function-order.js';

describe('tools/check-function-order', () => {
	/** @type {string} */
	let tempRoot;

	before(() => {
		tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pixelperfect-function-order-'));
	});

	after(() => {
		fs.rmSync(tempRoot, { force: true, recursive: true });
	});

	test('getTopLevelFunctionNames игнорирует вложенные function', () => {
		const names = getTopLevelFunctionNames(`
function zebra() {
	function nested() {}
}

function alpha() {}
`);

		assert.deepEqual(names, ['zebra', 'alpha']);
	});

	test('checkFileFunctionOrder null для алфавитного порядка', () => {
		const filePath = 'sorted.js';
		fs.writeFileSync(
			path.join(tempRoot, filePath),
			'function alpha() {}\n\nfunction beta() {}\n\nexport { alpha, beta };\n',
		);

		assert.strictEqual(checkFileFunctionOrder(filePath, tempRoot), null);
	});

	test('checkFileFunctionOrder ловит нарушение порядка', () => {
		const filePath = 'wrong.js';
		fs.writeFileSync(
			path.join(tempRoot, filePath),
			'function zebra() {}\n\nfunction alpha() {}\n\nexport { alpha, zebra };\n',
		);

		assert.deepEqual(checkFileFunctionOrder(filePath, tempRoot), {
			expected: ['alpha', 'zebra'],
			file: filePath,
			names: ['zebra', 'alpha'],
		});
	});

	test('checkFunctionOrder пропускает dist и test', () => {
		const scanRoot = path.join(tempRoot, 'scan');
		fs.mkdirSync(path.join(scanRoot, 'dist'), { recursive: true });
		fs.mkdirSync(path.join(scanRoot, 'test'), { recursive: true });
		fs.writeFileSync(path.join(scanRoot, 'ok.js'), 'function alpha() {}\n\nfunction beta() {}\n');
		fs.writeFileSync(path.join(scanRoot, 'dist', 'bad.js'), 'function zebra() {}\n\nfunction alpha() {}\n');
		fs.writeFileSync(path.join(scanRoot, 'test', 'bad.js'), 'function zebra() {}\n\nfunction alpha() {}\n');

		assert.deepEqual(checkFunctionOrder(scanRoot), []);
	});

	test('checkFileFunctionBlankLines ловит отсутствие пустой строки', () => {
		const filePath = 'tight.js';
		fs.writeFileSync(path.join(tempRoot, filePath), 'function alpha() {}\nfunction beta() {}\n');

		assert.deepEqual(checkFileFunctionBlankLines(filePath, tempRoot), [
			{ after: 'beta', before: 'alpha', file: filePath },
		]);
	});
});
