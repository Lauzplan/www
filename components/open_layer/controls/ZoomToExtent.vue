<template>
  <div>
    <slot :on="{ click }" />
    <div ref="originalControl" hidden></div>
  </div>
</template>

<script>
import { ZoomToExtent } from 'ol/control'

export default {
  name: 'ZoomToExtentControl',
  props: {
    extent: {
      type: Array,
      default: () => undefined,
    },
  },
  data() {
    return { control: null }
  },
  inject: ['getMapInstance'],
  watch: {
    extent: 'setupControl',
  },
  mounted() {
    this.setupControl()
  },
  beforeDestroy() {
    this.getMapInstance().removeControl(this.control)
  },
  methods: {
    click() {
      this.$refs.originalControl.querySelector('button').click()
    },
    setupControl() {
      if (this.control) this.getMapInstance().removeControl(this.control)

      this.control = new ZoomToExtent({
        extent: this.extent,
        target: this.$refs.originalControl,
      })

      this.getMapInstance().addControl(this.control)
    },
  },
}
</script>

<style></style>
