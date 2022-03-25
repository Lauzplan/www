<script>
import { MultiPoint } from 'ol/geom'
export default {
  name: 'PolygonVertices',
  mounted() {
    this.$parent.$emit('input', (feature) => {
      if (!feature.getGeometry().getType() === 'Polygon') return null
      const coordinates = feature.getGeometry().getCoordinates()[0]
      return new MultiPoint(coordinates)
    })
  },
  render() {
    return null
  },
}
</script>

<style></style>
