<template>
  <div><slot v-if="interaction" /></div>
</template>

<script>
import { Draw } from 'ol/interaction'
export default {
  name: 'DrawInteraction',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      required: true,
    },
    features: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return { interaction: null }
  },
  inject: ['getMapInstance', 'getSourceInstance', 'getFeatures'],
  watch: {
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }
        // const source = this.getSourceInstance()
        // if (!source) return
        this.interaction = new Draw({
          // source,
          features: this.getFeatures(),
          type: this.type,
          ...val,
        })
        // needed to add the interaction after default controls has been loaded
        this.$nextTick().then(() => {
          map.addInteraction(this.interaction)
        })
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    map.removeInteraction(this.interaction)
  },
}
</script>

<style></style>
