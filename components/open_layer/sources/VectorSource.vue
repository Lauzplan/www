<template>
  <div v-if="vector">
    <!-- <template
      v-for="(feature, index) in vector.getFeaturesCollection().getArray()"
    >
      <prop-manager
        :key="feature.ol_uid"
        @input="vector.getFeaturesCollection().setAt(index, $event)"
      >
        <slot name="feature" :feature="feature" :index="index" />
      </prop-manager>
    </template> -->
    <slot />
  </div>
</template>
<script>
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import { Collection } from 'ol'
import { merge } from 'rxjs'
import { debounceTime, map } from 'rxjs/operators'

import { fromOpenLayerEvent } from '~/utils/obesravble'

export default {
  name: 'VectorSource',
  props: {
    features: {
      type: Array,
      default: () => [],
    },
  },
  inject: ['getLayerInstance', 'getMapInstance'],
  provide() {
    return {
      getSourceInstance: () => this.vector,
      getFeatures: () => this.vector.getFeaturesCollection(),
    }
  },
  data() {
    return {
      vector: null,
      eventToEmit: ['addfeature', 'changefeature', 'removefeature'],
    }
  },
  mounted() {
    const featureProjection = this.getMapInstance()
      .getView()
      .getProjection()
      .getCode()
    this.vector = new VectorSource({
      format: new GeoJSON({ featureProjection }),
      features: new Collection(),
    })
    this.getLayerInstance().setSource(this.vector)
    for (const event of this.eventToEmit) {
      this.vector.on(event, this.handleVectorSourceEvent)
    }
    const featuresChange$ = merge(
      fromOpenLayerEvent(this.vector, 'addfeature'),
      fromOpenLayerEvent(this.vector, 'changefeature'),
      fromOpenLayerEvent(this.vector, 'removefeature')
    )
    const extent$ = featuresChange$.pipe(
      map(({ target }) => target.getExtent()),
      debounceTime(5000)
    )

    this.$subscribeTo(extent$, (extent) => {
      this.$emit('update:extent', extent)
    })
  },
  beforeDestroy() {
    for (const event of this.eventToEmit) {
      this.vector.un(event, this.handleVectorSourceEvent)
    }
  },
  methods: {
    handleVectorSourceEvent({ type, feature }) {
      this.$emit(type, feature)
    },
  },
}
</script>
