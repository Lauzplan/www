<template>
  <div>
    <slot />
  </div>
</template>
<script>
import VectorSource from 'ol/source/Vector'
import { Collection } from 'ol'

export default {
  props: {
    features: {
      type: Array,
      default: () => [],
    },
  },
  inject: ['getLayerInstance'],
  provide() {
    return {
      getSourceInstance: () => this.vector,
      getFeatures: () => this.featureCollection,
    }
  },
  data() {
    return {
      vector: null,
      featureCollection: null,
    }
  },
  beforeMount() {
    this.featureCollection = new Collection(this.features)
    this.vector = new VectorSource({
      features: this.featureCollection,
    })
    this.getLayerInstance().setSource(this.vector)
    this.vector.on('addfeature', ({ feature }) => {
      this.$emit('addfeature', feature)
    })
    this.vector.on('changefeature', (data) => {
      this.$emit('changefeature', data.feature)
    })
    this.vector.on('removefeature', (data) => {
      this.$emit('removefeature', data.feature)
    })
  },
}
</script>
