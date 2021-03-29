<template>
  <div>
    <slot v-if="layer"></slot>
  </div>
</template>
<script>
import TileLayer from 'ol/layer/Tile'

export default {
  props: {},
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
  beforeMount() {
    this.layer = new TileLayer({
      preload: Infinity,
    })
    this.getMapInstance().addLayer(this.layer)
  },
  beforeDestroy() {
    this.getMapInstance().removeLayer(this.layer)
  },
  render() {
    return null
  },
}
</script>
