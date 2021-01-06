<template>
  <div><slot /></div>
</template>

<script>
import { defaults } from 'ol/interaction'
export default {
  name: 'Interactions',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  inject: ['getMapInstance'],
  mounted() {
    const map = this.getMapInstance()
    map.getInteractions().clear()
    defaults(this.options).forEach((c) => map.addInteraction(c))
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    defaults().forEach((c) => map.addControl(c))
  },
}
</script>

<style></style>
