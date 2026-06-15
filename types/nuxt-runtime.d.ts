/** Auto-import Nuxt в client plugins (`nuxt/runtime/*.client.js`). */
type NuxtPluginCallback = () => void | Promise<void>;

declare global {
	var defineNuxtPlugin: (callback: NuxtPluginCallback) => NuxtPluginCallback;
}

export {};
