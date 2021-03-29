<template>
  <div></div>
</template>

<script>
import { Feature } from 'ol'
import fitMixin from '~/mixins/fit'

export default {
  name: 'ParcelLoader',
  mixins: [fitMixin],
  props: {
    parcels: {
      type: Array,
      required: true,
    },
  },
  inject: ['getSourceInstance', 'getMapInstance'],
  mounted() {
    const source = this.getSourceInstance()
    for (const parcel of this.parcels) {
      const feature = new Feature(
        source.getFormat().readGeometry(parcel.geometry)
      )
      feature.setId(parcel.id)
      source.addFeature(feature)
    }
    this.fitToSource()

    this.$nextTick().then(() => this.$emit('loadEnd', true))
  },
}
</script>

<style></style>
