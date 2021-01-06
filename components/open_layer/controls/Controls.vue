<template>
  <div><slot /></div>
</template>

<script>
import { defaults } from 'ol/control'
export default {
  name: 'Controls',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  inject: ['getMapInstance'],
  mounted() {
    const map = this.getMapInstance()
    map.getControls().clear()
    defaults(this.options).forEach((c) => map.addControl(c))
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    defaults().forEach((c) => map.addControl(c))
  },
}
</script>

<style></style>
