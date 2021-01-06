<template>
  <div><slot /></div>
</template>

<script>
import { ZoomToExtent } from 'ol/control'
export default {
  name: 'ZoomToExtentControl',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
    extent: {
      type: Array,
      default: null,
    },
  },
  data() {
    return { control: null }
  },
  inject: ['getMapInstance'],
  watch: {
    extent: {
      handler(val) {
        console.log(val)
      },
    },
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }
        this.control = new ZoomToExtent({
          extent: this.extent,
          ...this.options,
        })
        // needed to add the controls after default controls has been loaded
        this.$nextTick().then(() => {
          map.addControl(this.control)
        })
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    map.removeControl(this.control)
  },
}
</script>

<style></style>
