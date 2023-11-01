import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit';

export default defineNuxtModule({
  async setup() {
    const { resolve } = createResolver(import.meta.url);
    await addComponent({ name: 'PixelperfectTool', filePath: resolve('../vue/index.js'), global: true });
  }
});
