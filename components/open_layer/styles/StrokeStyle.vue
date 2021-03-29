<script>
import Stroke from 'ol/style/Stroke'
export default {
  name: 'FillStyle',
  inject: ['getStyleInstance'],
  data() {
    return {
      strokeStyle: new Stroke({
        color: this.$attrs.color,
        width: this.$attrs.width,
      }),
    }
  },
  mounted() {
    this.getStyleInstance().setStroke(this.strokeStyle)
  },
  beforeDestroy() {
    this.getStyleInstance().setStroke(undefined)
  },
  render() {
    return null
  },
}
</script>

<style></style>
