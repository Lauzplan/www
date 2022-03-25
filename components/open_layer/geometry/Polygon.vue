<template>
  <div></div>
</template>

<script>
import { Polygon } from 'ol/geom'
export default {
  name: 'PolygonGeometry',
  props: {
    coordinates: {
      type: Array,
      required: true,
    },
  },
  inject: ['getFeatureInstance'],
  data() {
    return { geometry: null }
  },
  watch: {
    coordinates(value) {
      this.geometry.setCoordinates(value)
    },
  },
  mounted() {
    this.geometry = new Polygon(this.coordinates)
    this.getFeatureInstance().setGeometry(this.geometry)
  },
  beforeDestroy() {
    this.getFeatureInstance().setGeometry(undefined)
  },
}
</script>

<style></style>
