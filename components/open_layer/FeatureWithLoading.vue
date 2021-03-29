<template>
  <div v-if="loading" :feature="feature">
    <feature-style-applier :feature="feature">
      <stroke-style color="grey" width="3" />
      <fill-style :color="[255, 255, 255, 0.5]" />
    </feature-style-applier>
    <overlay
      :positioning="'center-center'"
      :position="feature.getGeometry().getInteriorPoint().getCoordinates()"
      ><v-progress-circular
        indeterminate
        color="grey darken-1"
      ></v-progress-circular
    ></overlay>
  </div>
</template>

<script>
import { merge, of } from 'rxjs'
import { filter, map, pluck, switchMap } from 'rxjs/operators'
import Overlay from './Overlay.vue'
import { fromOpenLayerEvent } from '~/utils/obesravble'
export default {
  name: 'FeatureWithLoading',
  components: { Overlay },
  props: {
    feature: {
      type: Object,
      required: true,
    },
  },
  subscriptions() {
    const feature$ = this.$watchAsObservable('feature', {
      immediate: true,
    }).pipe(pluck('newValue'))

    return {
      loading: feature$
        .pipe(
          switchMap((feature) =>
            merge(
              of(feature),
              fromOpenLayerEvent(feature, 'propertychange').pipe(
                pluck('target')
              )
            )
          )
        )
        .pipe(
          filter((f) => f),
          map((feature) => feature.getProperties().loading)
        ),
    }
  },
}
</script>

<style></style>
