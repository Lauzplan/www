<script>
import BingMaps from 'ol/source/BingMaps'

export default {
  props: {
    apiKey: {
      type: String,
      required: true,
    },
    imagerySet: {
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
    this.bingMap = new BingMaps({
      key: this.apiKey,
      imagerySet: this.imagerySet,
    })
    this.getLayerInstance().setSource(this.bingMap)
  },
  render() {
    return null
  },
}
</script>
