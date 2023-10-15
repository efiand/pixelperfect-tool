<template />

<script setup>
import loadPixelperfect from '../';
import { onMounted } from 'vue';

const props = defineProps(['options']);

onMounted(() => {
  loadPixelperfect(props.options);
});
</script>
