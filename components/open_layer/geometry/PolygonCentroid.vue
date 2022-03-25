<script>
export default {
  name: 'PolygonCentroid',
  mounted() {
    this.$parent.$emit('input', (feature) => {
      if (!feature.getGeometry().getType() === 'Polygon') return null
      return feature.getGeometry().getInteriorPoint()
    })
  },
  render() {
    return null
  },
}
</script>

<style></style>
