/// <reference path="../../types/index.d.ts" />

import { Window } from 'happy-dom';

const BROWSER_GLOBAL_KEYS = [
	'Event',
	'HTMLElement',
	'KeyboardEvent',
	'document',
	'getComputedStyle',
	'localStorage',
	'window',
];

/** @param {string} key @param {unknown} value */
function assignTestGlobal(key, value) {
	Reflect.set(globalThis, key, value);
}

/** @param {string} [pathname='/'] */
function createHappyDomWindow(pathname = '/') {
	return new Window({ url: `https://example.com${pathname}` });
}

/** @param {import('happy-dom').Window} happyDomWindow */
function installBrowserGlobals(happyDomWindow) {
	assignTestGlobal('window', happyDomWindow);
	assignTestGlobal('document', happyDomWindow.document);
	assignTestGlobal('localStorage', happyDomWindow.localStorage);
	assignTestGlobal('HTMLElement', happyDomWindow.HTMLElement);
	assignTestGlobal('KeyboardEvent', happyDomWindow.KeyboardEvent);
	assignTestGlobal('getComputedStyle', happyDomWindow.getComputedStyle.bind(happyDomWindow));
	assignTestGlobal('Event', happyDomWindow.Event);
}

function uninstallBrowserGlobals() {
	for (const key of BROWSER_GLOBAL_KEYS) {
		Reflect.deleteProperty(globalThis, key);
	}
}

/** @param {import('happy-dom').Window} happyDomWindow */
function installDocumentGlobals(happyDomWindow) {
	assignTestGlobal('document', happyDomWindow.document);
	assignTestGlobal('localStorage', happyDomWindow.localStorage);
	assignTestGlobal('HTMLElement', happyDomWindow.HTMLElement);
	assignTestGlobal('KeyboardEvent', happyDomWindow.KeyboardEvent);
	assignTestGlobal('getComputedStyle', happyDomWindow.getComputedStyle.bind(happyDomWindow));
}

/** @param {import('happy-dom').Window} happyDomWindow */
function installVueGlobals(happyDomWindow) {
	installBrowserGlobals(happyDomWindow);
	assignTestGlobal('SVGElement', happyDomWindow.SVGElement);
	assignTestGlobal('Node', happyDomWindow.Node);
	assignTestGlobal('Text', happyDomWindow.Text);
	assignTestGlobal('Comment', happyDomWindow.Comment);
	assignTestGlobal('Element', happyDomWindow.Element);
}

const VUE_GLOBAL_KEYS = ['Comment', 'Element', 'Node', 'SVGElement', 'Text', ...BROWSER_GLOBAL_KEYS];

function uninstallVueGlobals() {
	for (const key of VUE_GLOBAL_KEYS) {
		Reflect.deleteProperty(globalThis, key);
	}
}

export {
	BROWSER_GLOBAL_KEYS,
	createHappyDomWindow,
	installBrowserGlobals,
	installDocumentGlobals,
	installVueGlobals,
	uninstallBrowserGlobals,
	uninstallVueGlobals,
};
