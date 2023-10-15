import { defineNuxtModule, createResolver } from '@nuxt/kit';
import { fileURLToPath } from 'node:url';

export default defineNuxtModule({
  hooks: {
    'components:dirs': (dirs) => {
      const { resolve } = createResolver(import.meta.url);
      dirs.push({
        path: fileURLToPath(`file://${resolve('./')}`)
      });
    }
  }
});
