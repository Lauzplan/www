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
import SnapGuides from 'ol-ext/interaction/SnapGuides'
import { VectorImage } from 'ol/layer'
import { Draw, Modify } from 'ol/interaction'
import { combineLatest, from, merge, EMPTY } from 'rxjs'
import {
  startWith,
  switchMap,
  filter,
  pluck,
  map,
  mergeMap,
  toArray,
  pairwise,
} from 'rxjs/operators'
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
        if (this.interaction) {
          this.getMapInstance().removeInteraction(this.interaction)
        }
        this.interaction = new SnapGuides({
          vectorClass: VectorImage,
          ...val,
        })
        const interactions = this.getMapInstance().getInteractions()
        const interactions$ = merge(
          from(interactions.getArray()),
          fromOpenLayerEvent(interactions, 'add').pipe(pluck('element'))
        )

        const draw$ = interactions$.pipe(filter((i) => i instanceof Draw))
        const modify$ = interactions$.pipe(filter((i) => i instanceof Modify))

        // SnapGuideInteraction have to be added after Draw and modify
        // We do not know wich one is added first. So we need to add it after each one is added
        // Making sure to delete it if already added
        this.$subscribeTo(draw$, (i) => {
          this.interaction.setDrawInteraction(i)
          this.getMapInstance().removeInteraction(this.interaction)
          this.getMapInstance().addInteraction(this.interaction)
        })
        this.$subscribeTo(modify$, (i) => {
          this.interaction.setModifyInteraction(i)
          this.getMapInstance().removeInteraction(this.interaction)
          this.getMapInstance().addInteraction(this.interaction)
        })

        // Using startWith null for when only one of Draw or Modify is used
        const active$ = combineLatest([
          draw$.pipe(startWith(null)),
          modify$.pipe(startWith(null)),
        ]).pipe(
          filter(([draw, modify]) => draw || modify),
          switchMap(([draw, modify]) =>
            merge(
              draw ? fromOpenLayerEvent(draw, 'change:active') : EMPTY,
              modify ? fromOpenLayerEvent(modify, 'change:active') : EMPTY
            ).pipe(map(() => !!(draw?.getActive() || modify?.getActive())))
          )
        )

        this.$subscribeTo(active$, (a) => {
          this.interaction.setActive(a)
          this.$emit('update:active', a)
        })
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    this.getMapInstance().removeInteraction(this.interaction)
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
