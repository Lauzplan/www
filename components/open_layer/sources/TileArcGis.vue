<script>
import { TileArcGISRest } from 'ol/source'

export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  inject: ['getLayerInstance'],
  data() {
    return {
      bingMap: null,
    }
  },
  beforeMount() {
    this.bingMap = new TileArcGISRest({
      url: this.url,
    })
    this.getLayerInstance().setSource(this.bingMap)
  },
  render() {
    return null
  },
}
</script>
