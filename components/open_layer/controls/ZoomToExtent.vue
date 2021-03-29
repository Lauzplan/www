<template>
  <div><slot v-if="control" /></div>
</template>

<script>
import { ZoomToExtent } from 'ol/control'
import fitExtent from '~/mixins/fit'

export default {
  name: 'ZoomToExtentControl',
  mixins: [fitExtent],
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

        this.control = new ZoomToExtent({
          extent: this.extentToFit,
          ...val,
        })

        // this.getSourceInstance()
        //   .getFeaturesCollection()
        //   .on('change:length', () => {
        //     const newExtent = this.getSourceInstance().getExtent()

        //     this.extent[0] = newExtent[0]
        //     this.extent[1] = newExtent[1]
        //     this.extent[2] = newExtent[2]
        //     this.extent[3] = newExtent[3]
        //   })
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
