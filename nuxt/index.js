import { addComponent, createResolver, defineNuxtModule } from '@nuxt/kit';

export default defineNuxtModule({
	setup() {
		const { resolve } = createResolver(import.meta.url);
		addComponent({
			filePath: resolve('../vue/index.js'),
			global: true,
			name: 'PixelperfectTool',
		});
	},
});
