import { addComponent, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
	async setup() {
		const { resolve } = createResolver(import.meta.url);
		await addComponent({
			filePath: resolve('../vue/index.js'),
			global: true,
			name: 'PixelperfectTool',
		});
		addPlugin({
			mode: 'client',
			src: resolve('./runtime/pixelperfect-storage.client.js'),
		});
	},
});
