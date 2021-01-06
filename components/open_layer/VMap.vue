<template>
  <div ref="map" style="height: 500px">
    <slot v-if="map"></slot>
  </div>
</template>
<script>
import Map from 'ol/Map'
import View from 'ol/View'
import { getArea } from 'ol/extent'

export default {
  name: 'VMap',
  props: {
    fit: {
      type: Array,
      default: null,
    },
  },
  provide() {
    return {
      getMapInstance: () => this.map,
    }
  },
  data() {
    return {
      map: null,
    }
  },
  mounted() {
    this.map = new Map({
      target: this.$refs.map,
      view: new View({
        center: [0, 0],
        zoom: 0,
      }),
    })
    this.fitHandler(this.fit)
  },
  watch: {
    fit: 'fitHandler',
  },
  methods: {
    fitHandler(val) {
      if (!val || getArea(val) === 0) return
      console.log(val)

      this.map.getView().fit(val, {
        duration: 500,
        size: this.map.getSize(),
        padding: [20, 20, 20, 20],
      })
    },
  },
}
</script>
