<template>
  <div></div>
</template>

<script>
import GeoJSON from 'ol/format/GeoJSON'
export default {
  name: 'GeoJsonGeometry',
  props: {
    geojson: {
      type: Object,
      required: true,
    },
  },
  inject: ['getFeatureInstance', 'getMapInstance'],
  data() {
    return { geometry: null }
  },
  watch: {
    geojson: {
      handler(value) {
        const featureProjection = this.getMapInstance()
          .getView()
          .getProjection()
          .getCode()
        const format = new GeoJSON({ featureProjection })
        this.geometry = format.readGeometry(value)
        this.getFeatureInstance().setGeometry(this.geometry)
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.getFeatureInstance().setGeometry(undefined)
  },
}
</script>

<style></style>
