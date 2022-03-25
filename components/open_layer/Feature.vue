<template>
  <div v-if="feature">
    <slot />
    <style-list-slot-wrapper v-model="style">
      <slot name="style" />
    </style-list-slot-wrapper>
  </div>
</template>

<script>
import { Feature } from 'ol'
import StyleListSlotWrapper from './StyleListSlotWrapper.vue'
export default {
  name: 'Feature',
  components: { StyleListSlotWrapper },
  props: {
    properties: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return { feature: null, style: [] }
  },
  provide() {
    return { getFeatureInstance: () => this.feature }
  },
  inject: ['getSourceInstance'],
  watch: {
    style() {
      this.feature.setStyle(this.style)
    },
    properties(val) {
      this.feature.setProperties(val)
    },
  },
  mounted() {
    this.feature = new Feature({
      geometry: this.geometry,
      style: this.style > 0 ? this.style : undefined,
      ...this.properties,
    })
    this.getSourceInstance().addFeature(this.feature)
  },
  beforeDestroy() {
    this.getSourceInstance().removeFeature(this.feature)
  },
}
</script>

<style></style>
