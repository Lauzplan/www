<script>
import Fill from 'ol/style/Fill'
export default {
  name: 'FillStyle',
  inject: ['getStyleInstance'],
  data() {
    return {
      fillStyle: new Fill({ color: this.$attrs.color }),
    }
  },
  mounted() {
    this.getStyleInstance().setFill(this.fillStyle)
  },
  beforeDestroy() {
    this.getStyleInstance().setFill(undefined)
  },
  render() {
    return null
  },
}
</script>

<style></style>
