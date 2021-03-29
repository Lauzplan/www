<template>
  <div><slot v-if="loaded" /></div>
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
  data() {
    return {
      loaded: false,
    }
  },
  mounted() {
    const map = this.getMapInstance()
    map.getControls().clear()
    defaults(this.options).forEach((c) => map.addControl(c))
    this.loaded = true
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    defaults().forEach((c) => map.addControl(c))
  },
}
</script>

<style></style>
