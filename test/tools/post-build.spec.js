import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { after, before, describe, test } from 'node:test';

import { runPostBuild } from '../../tools/post-build.js';

describe('tools/post-build', () => {
	/** @type {string} */
	let tempRoot;

	before(() => {
		tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'pixelperfect-post-build-'));
		fs.writeFileSync(path.join(tempRoot, 'README.md'), '# test readme\n');
		fs.writeFileSync(path.join(tempRoot, 'CHANGELOG.md'), '# Changelog\n');
	});

	after(() => {
		fs.rmSync(tempRoot, { force: true, recursive: true });
	});

	test('готовит dist для GitHub Pages', async () => {
		await runPostBuild({ root: tempRoot });

		assert.equal(fs.existsSync(path.join(tempRoot, 'dist', 'README.md')), false);

		const changelog = fs.readFileSync(path.join(tempRoot, 'dist', 'CHANGELOG.md'), 'utf8');
		assert.equal(changelog, '# Changelog\n');

		const indexMd = fs.readFileSync(path.join(tempRoot, 'dist', 'index.md'), 'utf8');
		assert.match(indexMd, /^---\n/);
		assert.match(indexMd, /theme: jekyll-theme-cayman/);
		assert.match(indexMd, /# test readme/);

		const config = fs.readFileSync(path.join(tempRoot, 'dist', '_config.yml'), 'utf8');
		assert.match(config, /theme: jekyll-theme-cayman/);
	});
});
