<template>
  <div>
    <slot v-if="feature" />
  </div>
</template>

<script>
import { Feature } from 'ol'
export default {
  name: 'Feature',
  props: {
    featureStyle: {
      type: Object,
      required: false,
      default: undefined,
    },
    geometry: {
      type: Object,
      required: false,
      default: undefined,
    },
  },
  data() {
    return { feature: null }
  },
  provide() {
    return { getFeatureInstance: () => this.feature }
  },
  inject: ['getSourceInstance'],
  watch: {
    featureStyle(value) {
      this.feature.setStyle(value)
    },
  },
  mounted() {
    this.feature = new Feature({
      geometry: this.geometry,
      style: this.featureStyle,
    })
    this.getSourceInstance().getFeaturesCollection().push(this.feature)
  },
  beforeDestroy() {
    this.getSourceInstance().getFeaturesCollection().remove(this.feature)
  },
}
</script>

<style></style>
