<template>
  <div v-if="layer">
    <slot></slot>
    <style-list-slot-wrapper v-model="style">
      <slot name="style" />
    </style-list-slot-wrapper>
  </div>
</template>
<script>
import VectorLayer from 'ol/layer/Vector'
import StyleListSlotWrapper from '../StyleListSlotWrapper.vue'

export default {
  components: { StyleListSlotWrapper },
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
      style: [],
      styleFunction: null,
    }
  },
  watch: {
    properties(val) {
      this.layer.setProperties(val)
    },
    style(val) {
      this.layer.setStyle(val)
    },
    styleFunction(val) {
      this.layer.setStyle(val)
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
