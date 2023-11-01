import loadPixelperfect from '../index.js';
import { defineComponent, onMounted } from 'vue';

export default defineComponent({
  name: 'PixelperfectTool',
  props: {
    options: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props, { slots }) {
    if (import.meta.dev) {
      onMounted(() => {
        loadPixelperfect(props.options);
      });
    }
    return () => slots.default?.();
  }
});
