/// <reference path="../types/index.d.ts" />

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const WASM_BINDING_KEY = 'node_modules/@rolldown/binding-wasm32-wasi';

/** @type {(name: string, version: string, sourceEntry?: PackageLockEntry) => PackageLockEntry} */
function buildLockEntry(name, version, sourceEntry) {
	if (sourceEntry?.resolved && sourceEntry?.integrity) {
		return buildLockEntryFromSource(version, sourceEntry);
	}

	const meta = fetchPackageMeta(name, version);
	const { dependencies } = meta;

	/** @type {[string, unknown][]} */
	const fields = [
		['version', version],
		['resolved', meta.dist.tarball],
		['integrity', meta.dist.integrity],
		['dev', true],
		['license', meta.license || 'MIT'],
		['optional', true],
		['peer', true],
	];

	if (dependencies) {
		fields.push(['dependencies', sortDependencyRecord(dependencies)]);
	}

	return Object.fromEntries(fields);
}

/** @type {(version: string, sourceEntry: PackageLockEntry) => PackageLockEntry} */
function buildLockEntryFromSource(version, sourceEntry) {
	/** @type {[string, unknown][]} */
	const fields = [
		['version', version],
		['resolved', sourceEntry.resolved],
		['integrity', sourceEntry.integrity],
		['dev', true],
		['license', sourceEntry.license || 'MIT'],
		['optional', true],
		['peer', true],
	];

	if (sourceEntry.dependencies && typeof sourceEntry.dependencies === 'object') {
		fields.push([
			'dependencies',
			sortDependencyRecord(/** @type {Record<string, string>} */ (sourceEntry.dependencies)),
		]);
	}

	return Object.fromEntries(fields);
}

/** @type {(name: string, version: string) => NpmPackageMeta} */
function fetchPackageMeta(name, version) {
	return JSON.parse(execSync(`npm view ${name}@${version} --json`, { encoding: 'utf8' }));
}

/** @type {(packages: PackageLockPackages, key: string, entry: PackageLockEntry) => PackageLockPackages} */
function insertPackageInKeyOrder(packages, key, entry) {
	const { [key]: _removedEntry, ...rest } = packages;
	/** @type {PackageLockPackages} */
	const result = {};
	let isInserted = false;

	for (const [packageKey, packageEntry] of Object.entries(rest)) {
		if (!isInserted && packageKey > key) {
			result[key] = entry;
			isInserted = true;
		}

		result[packageKey] = packageEntry;
	}

	if (!isInserted) {
		result[key] = entry;
	}

	return result;
}

/** @type {(entry: PackageLockEntry, version: string) => boolean} */
function isCanonicalLockEntry(entry, version) {
	if (!entry || entry.version !== version || Object.keys(entry)[0] !== 'version') {
		return false;
	}

	const { dependencies } = entry;

	if (!dependencies || typeof dependencies !== 'object') {
		return !dependencies;
	}

	const dependencyKeys = Object.keys(dependencies);

	return dependencyKeys.every((key, index) => key === [...dependencyKeys].sort()[index]);
}

/**
 * npm i на текущей ОС вырезает optional wasm-зависимости rolldown (@emnapi/*) из lockfile.
 * Дописываем их по версиям из @rolldown/binding-wasm32-wasi — package.json не трогаем.
 *
 * @type {(hostCwd?: string) => void}
 */
function restoreRolldownWasmLockfile(hostCwd = process.cwd()) {
	const packageLockPath = path.join(hostCwd, 'package-lock.json');
	const lock = JSON.parse(readFileSync(packageLockPath, 'utf8'));
	const wasmBinding = lock.packages[WASM_BINDING_KEY];

	if (!wasmBinding?.dependencies) {
		return;
	}

	const { '@emnapi/core': coreVersion, '@emnapi/runtime': runtimeVersion } = wasmBinding.dependencies;

	for (const [packageName, version] of [
		['@emnapi/core', coreVersion],
		['@emnapi/runtime', runtimeVersion],
	]) {
		const key = `node_modules/${packageName}`;
		const existing = lock.packages[key];

		if (isCanonicalLockEntry(existing, version)) {
			continue;
		}

		const nested = lock.packages[`${WASM_BINDING_KEY}/node_modules/${packageName}`];
		lock.packages = insertPackageInKeyOrder(lock.packages, key, buildLockEntry(packageName, version, nested));
	}

	writeFileSync(packageLockPath, `${JSON.stringify(lock, null, '\t')}\n`);
}

/** @type {(dependencies: Record<string, string>) => Record<string, string>} */
function sortDependencyRecord(dependencies) {
	return Object.fromEntries(
		Object.keys(dependencies)
			.sort()
			.map((dependencyName) => [dependencyName, dependencies[dependencyName]]),
	);
}

export { restoreRolldownWasmLockfile };
