<template>
  <div style="height: 100%; width: 100%">
    <slot v-if="map"></slot>
  </div>
</template>
<script>
import Map from 'ol/Map'
import View from 'ol/View'
import { getArea } from 'ol/extent'
import proj4 from 'proj4'
import { register } from 'ol/proj/proj4'
import Projection from 'ol/proj/Projection'

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
      resizeObserver: new ResizeObserver(() => this.map.updateSize()),
    }
  },
  watch: {
    fit: 'fitHandler',
  },
  mounted() {
    proj4.defs(
      'EPSG:31370',
      '+proj=lcc +lat_1=51.16666723333333 +lat_2=49.8333339 +lat_0=90 +lon_0=4.367486666666666 +x_0=150000.013 +y_0=5400088.438 +ellps=intl +towgs84=-106.869,52.2978,-103.724,0.3366,-0.457,1.8422,-1.2747 +units=m +no_defs'
    )
    register(proj4)
    this.map = new Map({
      target: this.$el,
      view: new View({
        center: [0, 0],
        zoom: 0,
        projection: new Projection({
          code: 'EPSG:31370',
          extent: [
            42000.1053417176,
            19999.916642703116,
            296000.1053417176,
            167999.91664270312,
          ],
          units: 'm',
        }),
      }),
    })
    this.resizeObserver.observe(this.$el)
  },
  beforeDestroy() {
    this.resizeObserver.disconnect()
  },
  methods: {
    fitHandler(val) {
      if (!val || getArea(val) === 0) return

      this.map.getView().fit(val, {
        duration: 500,
        padding: [20, 20, 20, 20],
      })
    },
  },
}
</script>
