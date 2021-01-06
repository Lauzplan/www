<template>
  <div><slot /></div>
</template>

<script>
import EditBar from 'ol-ext/control/EditBar'
import 'ol-ext/dist/ol-ext.css'
export default {
  name: 'EditBarControl',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return { control: null }
  },
  inject: ['getMapInstance', 'getSourceInstance'],
  watch: {
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }
        const source = this.getSourceInstance()
        this.control = new EditBar({
          source,
          interactions: {
            Info: false,
            DrawPoint: false,
            DrawLine: false,
            DrawHole: false,
            DrawRegular: false,
            Split: false,
            Offset: false,
          },
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
