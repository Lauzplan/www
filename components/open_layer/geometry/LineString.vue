<template>
  <div></div>
</template>

<script>
import LineString from 'ol/geom/LineString'
export default {
  name: 'LineString',
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
    this.geometry = new LineString(this.coordinates)
    this.getFeatureInstance().setGeometry(this.geometry)
  },
  beforeDestroy() {
    this.getFeatureInstance().setGeometry(undefined)
  },
}
</script>

<style></style>
