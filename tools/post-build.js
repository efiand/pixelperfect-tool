import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const GITHUB_PAGES_CONFIG = `title: pixelperfect-tool
description: Pixel perfect tool for development mode
theme: jekyll-theme-cayman
`;

/** @param {{ root?: string }} [options] */
async function runPostBuild({ root = path.resolve(import.meta.dirname, '..') } = {}) {
	const distDir = path.join(root, 'dist');
	const readmePath = path.join(root, 'README.md');
	const changelogPath = path.join(root, 'CHANGELOG.md');
	const readme = await readFile(readmePath, 'utf8');

	await mkdir(distDir, { recursive: true });
	await copyFile(changelogPath, path.join(distDir, 'CHANGELOG.md'));
	await writeFile(path.join(distDir, '_config.yml'), GITHUB_PAGES_CONFIG);
	await writeFile(path.join(distDir, 'index.md'), `---\n${GITHUB_PAGES_CONFIG}---\n\n${readme}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	await runPostBuild();
}

export { runPostBuild };
