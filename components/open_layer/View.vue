<template>
  <div>
    <slot v-if="view" />
  </div>
</template>

<script>
export default {
  name: 'View',
  props: {
    extent: {
      type: Object,
      default: null,
    },
  },
  inject: ['getMapInstance'],
  data() {
    return {
      view: null,
    }
  },
  watch: {},
}
</script>

<style></style>
