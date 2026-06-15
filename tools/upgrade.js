#!/usr/bin/env node

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { restoreRolldownWasmLockfile } from './restore-rolldown-wasm-lockfile.js';
import { upgradeGitHubActions } from './upgrade-github-actions.js';

const NON_REGISTRY_SPECIFIER = /^(?:git\+|git:|github:|file:|link:|workspace:|npm:|https?:)/u;

/** @type {(packages: Record<string, string>) => string[]} */
function getRegistryPackageNames(packages) {
	return Object.entries(packages)
		.filter(([, version]) => isRegistryDependency(version))
		.map(([name]) => name);
}

/** @type {(version: string) => boolean} */
function isRegistryDependency(version) {
	return typeof version === 'string' && !NON_REGISTRY_SPECIFIER.test(version.trim());
}

/** @type {(cwd?: string) => Promise<void>} */
async function runUpgrade(cwd = process.cwd()) {
	upgradeDevDependencies(cwd);
	updateBrowserslistDb(cwd);
	restoreRolldownWasmLockfile(cwd);
	await upgradeGitHubActions(path.join(cwd, '.github', 'workflows'));
}

/** @type {(cwd: string) => void} */
function updateBrowserslistDb(cwd) {
	execSync('npx update-browserslist-db@latest --yes', {
		cwd,
		env: { ...process.env, BROWSERSLIST_IGNORE_OLD_DATA: 'true' },
		stdio: 'inherit',
	});
}

/** @type {(cwd: string) => void} */
function upgradeDevDependencies(cwd) {
	const { devDependencies = {} } = JSON.parse(readFileSync(path.join(cwd, 'package.json'), 'utf8'));
	const names = getRegistryPackageNames(devDependencies);

	if (!names.length) {
		return;
	}

	execSync(`npm i -DE ${names.map((name) => `${name}@latest`).join(' ')}`, { cwd, stdio: 'inherit' });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	await runUpgrade(process.cwd());
}
