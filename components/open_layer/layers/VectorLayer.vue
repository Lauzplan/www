<template>
  <div>
    <slot v-if="layer"></slot>
  </div>
</template>
<script>
import VectorLayer from 'ol/layer/Vector'

export default {
  props: {
    options: {
      type: Object,
      default: () => {},
    },
    properties: {
      type: Object,
      default: () => {},
    },
  },
  provide() {
    return {
      getLayerInstance: () => this.layer,
    }
  },
  inject: ['getMapInstance'],
  data() {
    return {
      layer: null,
    }
  },
  watch: {
    properties(val) {
      this.layer.setProperties(val)
    },
  },
  beforeMount() {
    this.layer = new VectorLayer(this.options)
    this.getMapInstance().addLayer(this.layer)
    this.layer.setProperties(this.properties)
  },
  beforeDestroy() {
    this.getMapInstance().removeLayer(this.layer)
  },
  render() {
    return null
  },
}
</script>
