<template>
  <div v-if="vector">
    <template v-for="(feature, index) in vector.getFeatures()">
      <slot name="feature" :feature="feature" :index="index" />
    </template>
    <slot />
  </div>
</template>
<script>
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Collection } from 'ol'

export default {
  props: {
    features: {
      type: Array,
      default: () => [],
    },
  },
  inject: ['getLayerInstance', 'getMapInstance'],
  provide() {
    return {
      getSourceInstance: () => this.vector,
      getFeatures: () => this.vector.getFeaturesCollection(),
    }
  },
  data() {
    return {
      vector: null,
      eventToEmit: ['addfeature', 'changefeature', 'removefeature'],
    }
  },
  mounted() {
    const featureProjection = this.getMapInstance()
      .getView()
      .getProjection()
      .getCode()
    this.vector = new VectorSource({
      format: new GeoJSON({ featureProjection }),
      features: new Collection(),
    })
    this.getLayerInstance().setSource(this.vector)
    for (const event of this.eventToEmit) {
      this.vector.on(event, this.handleVectorSourceEvent)
    }
  },
  beforeDestroy() {
    for (const event of this.eventToEmit) {
      this.vector.un(event, this.handleVectorSourceEvent)
    }
  },
  methods: {
    handleVectorSourceEvent({ type, feature }) {
      this.$emit(type, feature)
    },
  },
}
</script>
