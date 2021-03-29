<template>
  <div><slot v-if="interaction" /></div>
</template>

<script>
import { Modify } from 'ol/interaction'
import { Collection } from 'ol'
export default {
  name: 'ModifyInteraction',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
    features: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return { interaction: null }
  },
  inject: ['getMapInstance'],
  watch: {
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }

        this.interaction = new Modify({
          features: new Collection(this.features),
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
