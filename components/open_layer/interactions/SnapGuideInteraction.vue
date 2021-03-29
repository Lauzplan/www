<template>
  <div v-if="interaction">
    <div v-for="(segment, i) in segments" :key="i">
      <slot
        name="segment"
        :segment="segment"
        :projection="projection"
        :resolution="resolution"
      />
    </div>
  </div>
</template>

<script>
import { filter, map, mergeMap, pairwise, pluck, toArray } from 'rxjs/operators'
import SnapGuides from 'ol-ext/interaction/SnapGuides'
import { VectorImage } from 'ol/layer'
import { Draw, Modify } from 'ol/interaction'
import ModifyFeature from 'ol-ext/interaction/ModifyFeature'
import { from, merge } from 'rxjs'
import { fromOpenLayerEvent } from '~/utils/obesravble'
export default {
  name: 'SnapGuideInteraction',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  data() {
    return { interaction: null }
  },
  provide() {
    return {
      getInteraction: () => {
        return this.interaction
      },
    }
  },
  inject: ['getMapInstance', 'getSourceInstance'],
  computed: {
    features() {
      return this.getSourceInstance().getFeatures()
    },
    projection() {
      return this.getMapInstance().getView().getProjection()
    },
    resolution() {
      return this.getMapInstance().getView().getResolution()
    },
  },
  watch: {
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.interaction) {
          map.removeInteraction(this.interaction)
        }
        this.interaction = new SnapGuides({
          vectorClass: VectorImage,
          ...val,
        })
        const interactions = map.getInteractions()
        const interactions$ = merge(
          from(interactions.getArray()),
          fromOpenLayerEvent(interactions, 'add').pipe(pluck('element'))
        )

        const draw$ = interactions$.pipe(filter((i) => i instanceof Draw))
        const modify$ = interactions$.pipe(
          filter((i) => i instanceof Modify || i instanceof ModifyFeature)
        )

        this.$subscribeTo(draw$, (i) => {
          this.interaction.setDrawInteraction(i)
        })
        this.$subscribeTo(modify$, (i) => {
          map.addInteraction(this.interaction)
          this.interaction.setModifyInteraction(i)
        })
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    map.removeInteraction(this.interaction)
  },
  subscriptions() {
    const features$ = this.$watchAsObservable('features', { deep: true }).pipe(
      pluck('newValue')
    )

    const segments$ = features$.pipe(
      mergeMap((features) =>
        from(features).pipe(
          map((f) => f.getGeometry()),
          map((geometry) => geometry.getCoordinates(false)[0]),
          mergeMap((coordinates) => from(coordinates).pipe(pairwise())),
          toArray()
        )
      )
    )

    return {
      segments: segments$,
    }
  },
}
</script>

<style></style>
