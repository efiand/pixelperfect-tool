#!/usr/bin/env node
/// <reference path="../types/index.d.ts" />

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const SKIP_DIRS = new Set(['dist', 'node_modules', 'test', 'tmp']);

/** @type {(filePath: string, root: string) => FunctionSpacingViolation[]} */
function checkFileFunctionBlankLines(filePath, root) {
	const absolutePath = path.join(root, filePath);
	const source = fs.readFileSync(absolutePath, 'utf8');
	const functions = getTopLevelFunctions(source);

	if (functions.length < 2) {
		return [];
	}

	/** @type {FunctionSpacingViolation[]} */
	const violations = [];

	for (let index = 0; index < functions.length - 1; index++) {
		const { bodyEnd, name: before } = functions[index];
		const { blockStart, name: after } = functions[index + 1];

		if (blockStart <= bodyEnd) {
			continue;
		}

		const between = source.slice(bodyEnd, blockStart);

		if (!hasBlankLineBetweenFunctions(between)) {
			violations.push({ after, before, file: filePath });
		}
	}

	return violations;
}

/** @type {(filePath: string, root: string) => FunctionOrderViolation | null} */
function checkFileFunctionOrder(filePath, root) {
	const absolutePath = path.join(root, filePath);
	const names = getTopLevelFunctionNames(fs.readFileSync(absolutePath, 'utf8'));

	if (names.length < 2) {
		return null;
	}

	const expected = [...names].sort((left, right) => left.localeCompare(right));

	if (names.join(',') === expected.join(',')) {
		return null;
	}

	return { expected, file: filePath, names };
}

/** @type {(filePath: string, root: string) => JsdocFormattingViolation[]} */
function checkFileJsdocFormatting(filePath, root) {
	const absolutePath = path.join(root, filePath);
	const lines = fs.readFileSync(absolutePath, 'utf8').split(/\r?\n/u);
	/** @type {JsdocFormattingViolation[]} */
	const violations = [];

	for (let index = 0; index < lines.length; index++) {
		const line = lines[index];
		const nextLine = lines[index + 1];
		const lineAfterNext = lines[index + 2];

		if (/^\/\*\* @type/u.test(line) && !/\*\/\s*$/u.test(line) && nextLine === ' */') {
			violations.push({
				file: filePath,
				line: index + 1,
				message: 'JSDoc @type must close on the same line ( */ ), not on the next line',
			});
		}

		if (/^ \* @/u.test(line) && nextLine === '' && lineAfterNext === ' */') {
			violations.push({
				file: filePath,
				line: index + 2,
				message: 'Remove the blank line before */ inside JSDoc',
			});
		}
	}

	return violations;
}

/** @type {(root?: string) => FunctionSpacingViolation[]} */
function checkFunctionBlankLines(root = process.cwd()) {
	const resolvedRoot = path.resolve(root);
	/** @type {FunctionSpacingViolation[]} */
	const violations = [];

	for (const filePath of collectJsFiles(resolvedRoot, resolvedRoot).sort()) {
		violations.push(...checkFileFunctionBlankLines(filePath, resolvedRoot));
	}

	return violations;
}

/** @type {(root?: string) => FunctionOrderViolation[]} */
function checkFunctionOrder(root = process.cwd()) {
	const resolvedRoot = path.resolve(root);
	/** @type {FunctionOrderViolation[]} */
	const violations = [];

	for (const filePath of collectJsFiles(resolvedRoot, resolvedRoot).sort()) {
		const violation = checkFileFunctionOrder(filePath, resolvedRoot);

		if (violation) {
			violations.push(violation);
		}
	}

	return violations;
}

/** @type {(root?: string) => JsdocFormattingViolation[]} */
function checkJsdocFormatting(root = process.cwd()) {
	const resolvedRoot = path.resolve(root);
	/** @type {JsdocFormattingViolation[]} */
	const violations = [];

	for (const filePath of collectJsFiles(resolvedRoot, resolvedRoot).sort()) {
		violations.push(...checkFileJsdocFormatting(filePath, resolvedRoot));
	}

	return violations;
}

/** @type {(dir: string, root: string, out?: string[]) => string[]} */
function collectJsFiles(dir, root, out = []) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		if (SKIP_DIRS.has(entry.name)) {
			continue;
		}

		const filePath = path.join(dir, entry.name);

		if (entry.isDirectory()) {
			collectJsFiles(filePath, root, out);
		} else if (entry.isFile() && entry.name.endsWith('.js')) {
			out.push(path.relative(root, filePath));
		}
	}

	return out;
}

/** @type {(source: string, functionLineStart: number) => number} */
function findFunctionBlockStart(source, functionLineStart) {
	const lookback = source.slice(Math.max(0, functionLineStart - 4096), functionLineStart);
	const jsdocMatches = [...lookback.matchAll(/\/\*\*[\s\S]*?\*\//gu)];

	for (let index = jsdocMatches.length - 1; index >= 0; index--) {
		const match = jsdocMatches[index];

		if (match.index === undefined) {
			continue;
		}

		const afterComment = lookback.slice(match.index + match[0].length);

		if (/^\s*$/u.test(afterComment)) {
			return functionLineStart - lookback.length + match.index;
		}
	}

	return functionLineStart;
}

/** @type {(source: string, functionLineStart: number) => number} */
function findFunctionBodyEnd(source, functionLineStart) {
	const parameterListEnd = findParameterListEnd(source, functionLineStart);

	if (parameterListEnd === -1) {
		return -1;
	}

	let index = parameterListEnd + 1;
	/** @type {string | null} */
	let inString = null;
	let isEscaped = false;

	while (index < source.length && /\s/u.test(source[index])) {
		index++;
	}

	if (source[index] !== '{') {
		return -1;
	}

	let depth = 0;

	for (; index < source.length; index++) {
		const character = source[index];

		if (inString) {
			if (isEscaped) {
				isEscaped = false;
				continue;
			}

			if (character === '\\') {
				isEscaped = true;
				continue;
			}

			if (character === inString) {
				inString = null;
			}

			continue;
		}

		if (character === '"' || character === "'" || character === '`') {
			inString = character;
			continue;
		}

		if (character === '{') {
			depth++;
		} else if (character === '}') {
			depth--;

			if (depth === 0) {
				return index + 1;
			}
		}
	}

	return -1;
}

/** @type {(source: string, fromIndex: number) => number} */
function findParameterListEnd(source, fromIndex) {
	let index = fromIndex;
	/** @type {string | null} */
	let inString = null;
	let isEscaped = false;

	while (index < source.length && source[index] !== '(') {
		if (inString) {
			if (isEscaped) {
				isEscaped = false;
			} else if (source[index] === '\\') {
				isEscaped = true;
			} else if (source[index] === inString) {
				inString = null;
			}

			index++;
			continue;
		}

		if (source[index] === '"' || source[index] === "'" || source[index] === '`') {
			inString = source[index];
		}

		index++;
	}

	if (index >= source.length) {
		return -1;
	}

	let parenDepth = 0;

	for (; index < source.length; index++) {
		const character = source[index];

		if (inString) {
			if (isEscaped) {
				isEscaped = false;
				continue;
			}

			if (character === '\\') {
				isEscaped = true;
				continue;
			}

			if (character === inString) {
				inString = null;
			}

			continue;
		}

		if (character === '"' || character === "'" || character === '`') {
			inString = character;
			continue;
		}

		if (character === '(') {
			parenDepth++;
		} else if (character === ')') {
			parenDepth--;

			if (parenDepth === 0) {
				return index;
			}
		}
	}

	return -1;
}

/** @type {(orderViolations: FunctionOrderViolation[], spacingViolations: FunctionSpacingViolation[], jsdocViolations: JsdocFormattingViolation[]) => string} */
function formatViolations(orderViolations, spacingViolations, jsdocViolations) {
	/** @type {string[]} */
	const lines = [];

	if (orderViolations.length) {
		lines.push(`Top-level functions must be in alphabetical order (${orderViolations.length} file(s)):`);

		for (const { expected, file, names } of orderViolations) {
			lines.push('', file, `  current:  ${names.join(', ')}`, `  expected: ${expected.join(', ')}`);
		}
	}

	if (spacingViolations.length) {
		if (lines.length) {
			lines.push('');
		}

		lines.push(`Add a blank line between top-level functions (${spacingViolations.length} file(s)):`);

		for (const { after, before, file } of spacingViolations) {
			lines.push('', file, `  between: ${before} → ${after}`);
		}
	}

	if (jsdocViolations.length) {
		if (lines.length) {
			lines.push('');
		}

		lines.push(`Fix JSDoc formatting (${jsdocViolations.length} issue(s)):`);

		for (const { file, line, message } of jsdocViolations) {
			lines.push('', file, `  line ${line}: ${message}`);
		}
	}

	return lines.join('\n');
}

/** @type {(source: string) => string[]} */
function getTopLevelFunctionNames(source) {
	return getTopLevelFunctions(source).map(({ name }) => name);
}

/** @type {(source: string) => TopLevelFunction[]} */
function getTopLevelFunctions(source) {
	/** @type {TopLevelFunction[]} */
	const functions = [];
	/** @type {string | null} */
	let inString = null;
	let isEscaped = false;
	let lineStart = 0;

	for (let index = 0; index <= source.length; index++) {
		const character = source[index];

		if (index === source.length || character === '\n') {
			if (!inString) {
				const line = source.slice(lineStart, index);
				const match = line.match(/^(async )?function (\w+)/);

				if (match) {
					const blockStart = findFunctionBlockStart(source, lineStart);
					const bodyEnd = findFunctionBodyEnd(source, lineStart);

					if (bodyEnd !== -1) {
						functions.push({ blockStart, bodyEnd, name: match[2] });
					}
				}
			}

			lineStart = index + 1;
			isEscaped = false;
			continue;
		}

		if (inString) {
			if (isEscaped) {
				isEscaped = false;
				continue;
			}

			if (character === '\\') {
				isEscaped = true;
				continue;
			}

			if (character === inString) {
				inString = null;
			}

			continue;
		}

		if (character === '"' || character === "'" || character === '`') {
			inString = character;
		}
	}

	return functions;
}

/** @type {(between: string) => boolean} */
function hasBlankLineBetweenFunctions(between) {
	return (between.match(/\r?\n/g) ?? []).length >= 2;
}

/** @type {(cwd?: string) => void} */
function runFunctionOrderCheck(cwd = process.cwd()) {
	const orderViolations = checkFunctionOrder(cwd);
	const spacingViolations = checkFunctionBlankLines(cwd);
	const jsdocViolations = checkJsdocFormatting(cwd);

	if (orderViolations.length || spacingViolations.length || jsdocViolations.length) {
		console.error(formatViolations(orderViolations, spacingViolations, jsdocViolations));
		process.exit(1);
	}
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
	runFunctionOrderCheck(process.cwd());
}

export {
	checkFileFunctionBlankLines,
	checkFileFunctionOrder,
	checkFileJsdocFormatting,
	checkFunctionBlankLines,
	checkFunctionOrder,
	checkJsdocFormatting,
	collectJsFiles,
	findFunctionBlockStart,
	findFunctionBodyEnd,
	findParameterListEnd,
	formatViolations,
	getTopLevelFunctionNames,
	getTopLevelFunctions,
	hasBlankLineBetweenFunctions,
	runFunctionOrderCheck,
};
