<template>
  <div>
    <slot name="zoomIn" :on="{ click: zoomIn }" />
    <slot name="zoomOut" :on="{ click: zoomOut }" />
    <div ref="originalControl" hidden></div>
  </div>
</template>

<script>
import { Zoom } from 'ol/control'
export default {
  name: 'ZoomControl',
  inject: ['getMapInstance'],
  data() {
    return { control: null }
  },
  computed: {
    zoomInButton() {
      return this.$refs.originalControl.querySelector('.ol-zoom-in')
    },
    zoomOutButton() {
      return this.$refs.originalControl.querySelector('.ol-zoom-out')
    },
  },
  mounted() {
    this.control = new Zoom({
      target: this.$refs.originalControl,
    })
    this.getMapInstance()?.addControl(this.control)
  },
  beforeDestroy() {
    this.getMapInstance()?.removeControl(this.control)
  },
  methods: {
    zoomIn() {
      this.zoomInButton.click()
    },
    zoomOut() {
      this.zoomOutButton.click()
    },
  },
}
</script>

<style></style>
