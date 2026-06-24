import { defineComponent, onMounted } from 'vue';

import { loadPixelperfect } from '../index.js';
import { isDevEnvironment } from '../lib/is-dev-environment.js';

export default defineComponent({
	name: 'PixelperfectTool',
	props: {
		options: {
			default: () => ({}),
			type: Object,
		},
	},
	setup(props, { slots }) {
		if (isDevEnvironment()) {
			onMounted(() => {
				loadPixelperfect(props.options);
			});
		}
		return () => slots.default?.();
	},
});
