import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const USES_PATTERN = /uses:\s*([A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+)@([^\s#]+)/g;

/** @type {Record<string, string>} */
const releaseTagCache = {};

/** @type {(content: string) => Map<string, string>} */
function collectActions(content) {
	/** @type {Map<string, string>} */
	const actions = new Map();

	for (const match of content.matchAll(USES_PATTERN)) {
		const [, action, version] = match;

		if (!action.startsWith('./')) {
			actions.set(action, version);
		}
	}

	return actions;
}

/** @type {(owner: string, repo: string) => Promise<string>} */
async function fetchLatestReleaseTag(owner, repo) {
	const cacheKey = `${owner}/${repo}`;

	if (releaseTagCache[cacheKey]) {
		return releaseTagCache[cacheKey];
	}

	const headers = {
		Accept: 'application/vnd.github+json',
		'User-Agent': 'npm-run-upgrade',
		'X-GitHub-Api-Version': '2022-11-28',
	};
	const releaseResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/releases/latest`, { headers });

	if (releaseResponse.ok) {
		/** @type {{ tag_name: string }} */
		const release = await releaseResponse.json();
		releaseTagCache[cacheKey] = release.tag_name;

		return release.tag_name;
	}

	const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags?per_page=1`, { headers });

	if (!tagsResponse.ok) {
		throw new Error(`GitHub API: ${owner}/${repo} — HTTP ${tagsResponse.status}`);
	}

	/** @type {{ name: string }[]} */
	const tags = await tagsResponse.json();

	if (!tags.length) {
		throw new Error(`GitHub API: ${owner}/${repo} — нет релизов и тегов`);
	}

	releaseTagCache[cacheKey] = tags[0].name;

	return tags[0].name;
}

/** @type {(owner: string, tagName: string) => string} */
function formatActionVersion(owner, tagName) {
	if (owner === 'actions') {
		const majorMatch = tagName.match(/^v?(\d+)/);

		if (majorMatch) {
			return `v${majorMatch[1]}`;
		}
	}

	return tagName;
}

/** @type {(content: string, action: string, version: string) => string} */
function replaceActionVersion(content, action, version) {
	const pattern = new RegExp(`(uses:\\s*)(${action.replace('/', '\\/')})@[^\\s#]+`, 'g');

	return content.replace(pattern, `$1$2@${version}`);
}

/** @type {(workflowsDir?: string) => Promise<void>} */
async function upgradeGitHubActions(workflowsDir = path.join(process.cwd(), '.github', 'workflows')) {
	let workflowFiles = [];

	try {
		workflowFiles = readdirSync(workflowsDir).filter((fileName) => fileName.endsWith('.yml'));
	} catch {
		return;
	}

	for (const fileName of workflowFiles) {
		const filePath = path.join(workflowsDir, fileName);
		let content = readFileSync(filePath, 'utf8');
		const actions = collectActions(content);
		let isUpdated = false;

		for (const [action, currentVersion] of actions) {
			const [owner, repo] = action.split('/');
			const latestTag = await fetchLatestReleaseTag(owner, repo);
			const nextVersion = formatActionVersion(owner, latestTag);

			if (currentVersion === nextVersion) {
				continue;
			}

			content = replaceActionVersion(content, action, nextVersion);
			isUpdated = true;
			console.info(`${fileName}: ${action}@${currentVersion} → @${nextVersion}`);
		}

		if (isUpdated) {
			writeFileSync(filePath, content);
		}
	}
}

export { upgradeGitHubActions };
