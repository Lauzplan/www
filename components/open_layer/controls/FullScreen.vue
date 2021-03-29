<template>
  <div><slot v-if="control" /></div>
</template>

<script>
import { FullScreen } from 'ol/control'
export default {
  name: 'FullScreenControl',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return { control: null }
  },
  inject: ['getMapInstance'],
  watch: {
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }
        this.control = new FullScreen(val)
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
