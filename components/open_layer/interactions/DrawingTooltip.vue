<template>
  <div v-if="active">
    <div>
      <overlay
        v-if="area > 1e-1"
        :positioning="'center-center'"
        :position="interiorPoint"
        :stop-event="false"
      >
        <v-chip :elevation="20">{{ area | formatArea }}</v-chip>
      </overlay>
    </div>
    <div>
      <overlay
        v-if="length"
        :offset="lengthOverlayOffset"
        :positioning="'bottom-center'"
        :position="coordinate"
        :stop-event="false"
      >
        <v-chip :elevation="20">
          <auto-grow-input
            :ref="'lengthTooltip'"
            :value="length | formatLength"
            @validate="setEdgeLength"
          />
        </v-chip>
      </overlay>
    </div>
  </div>
</template>

<script>
import { Draw, Snap } from 'ol/interaction'

import { from, fromEvent, iif, merge, of } from 'rxjs'
import {
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  pluck,
  switchMap,
  take,
  withLatestFrom,
} from 'rxjs/operators'
import LineString from 'ol/geom/LineString'
import PointerInteraction from 'ol/interaction/Pointer'
import { Collection, Feature } from 'ol'
import { toLonLat } from 'ol/proj'
import { circular } from 'ol/geom/Polygon'
import Overlay from '../Overlay.vue'
import { fromOpenLayerEvent } from '~/utils/obesravble'
import AutoGrowInput from '~/components/inputs/AutoGrowInput.vue'
export default {
  name: 'DrawingTooltip',
  components: { Overlay, AutoGrowInput },
  inject: ['getMapInstance'],
  data() {
    return {
      interaction: null,
      snapI: null,
      snapFeatures: new Collection(),
      lengthOverlayOffset: [0, -15],
      area: 0,
      length: 0,
    }
  },
  observableMethods: {
    handleMoveEvent: 'handleMoveEvent$',
  },
  mounted() {
    this.interaction = new PointerInteraction({
      handleMoveEvent: this.handleMoveEvent,
    })

    const interactions = this.getMapInstance().getInteractions()
    const drawI$ = merge(
      of(interactions.getArray()),
      fromOpenLayerEvent(interactions, 'change:length').pipe(
        mapTo(interactions.getArray())
      )
    ).pipe(map((interactions) => interactions.find((i) => i instanceof Draw)))

    this.snapI = new Snap({
      features: this.snapFeatures,
      pixelTolerance: Math.max(...this.getMapInstance().getSize()),
    })

    this.getMapInstance().addInteraction(this.interaction)

    this.$subscribeTo(
      drawI$.pipe(
        filter((i) => i),
        distinctUntilChanged((x, y) => x.ol_uid === y.ol_uid)
      ),
      () => this.getMapInstance().addInteraction(this.snapI)
    )
  },
  methods: {
    setEdgeLength(value) {
      if (!value) return

      const result = value.match(/(?<length>\d+(?:\.\d+)?)\s*(?<unit>m|km)?/)

      if (!result) return

      const {
        groups: { length, unit },
      } = result

      let factor
      switch (unit) {
        case undefined:
        case 'm':
          factor = 1
          break
        case 'km':
          factor = 1000
          break
      }
      const parsedLength = Number(length) * factor

      if (isNaN(parsedLength)) return

      const coord = this.geometry.getCoordinates()[0]

      const geometry = circular(
        toLonLat(coord[coord.length - 3]),
        parsedLength,
        128
      ).transform('EPSG:4326', 'EPSG:3857')

      this.$subscribeTo(
        fromOpenLayerEvent(this.geometry, 'change').pipe(
          pluck('target'),
          filter(
            (geometry) => geometry.getCoordinates()[0].length !== coord.length
          ),
          take(1)
        ),
        () => this.snapFeatures.clear()
      )

      this.snapFeatures.clear()
      this.snapFeatures.push(new Feature(geometry))
    },
  },
  subscriptions() {
    const interactions = this.getMapInstance().getInteractions()
    const drawI$ = merge(
      from(interactions.getArray()),
      fromOpenLayerEvent(interactions, 'add').pipe(pluck('element'))
    ).pipe(filter((i) => i instanceof Draw))

    const drawStart$ = drawI$.pipe(
      switchMap((drawI) => fromOpenLayerEvent(drawI, 'drawstart'))
    )

    const feature$ = drawStart$.pipe(
      switchMap(({ feature }) =>
        fromOpenLayerEvent(feature.getGeometry(), 'change')
      ),
      pluck('target')
    )

    const active$ = drawI$.pipe(
      switchMap((drawI) =>
        iif(
          () => !drawI,
          of(false),
          fromOpenLayerEvent(drawI, 'change:active').pipe(
            map(({ target }) => target.getActive())
          )
        )
      )
    )

    const drawEndNull$ = merge(
      active$.pipe(filter((a) => !a)),
      drawI$.pipe(switchMap((drawI) => fromOpenLayerEvent(drawI, 'drawend')))
    ).pipe(mapTo(null))

    const tab$ = fromEvent(
      this.getMapInstance().getTargetElement(),
      'keyup'
    ).pipe(
      filter(({ keyCode }) => keyCode === 9),
      withLatestFrom(active$),
      filter(([e, active]) => active),
      map(([e]) => e)
    )
    this.$subscribeTo(tab$, () => {
      this.$refs.lengthTooltip?.$el.focus()
    })

    return {
      active: active$,
      coordinate: this.handleMoveEvent$.pipe(pluck('coordinate')),
      geometry: feature$,
      length: merge(
        feature$.pipe(
          map((target) => target.getCoordinates()[0]),
          map((c) => {
            const l = c.length
            if (l >= 3) {
              return new LineString([c[l - 3], c[l - 2]]).getLength()
            }
            return null
          })
        ),
        drawEndNull$
      ),
      area: merge(
        feature$.pipe(map((target) => target.getArea())),
        drawEndNull$
      ),
      interiorPoint: merge(
        feature$.pipe(
          map((target) => target.getInteriorPoint()),
          filter(({ layout }) => layout === 'XYM'),
          pluck('flatCoordinates'),
          map(([x, y, m]) => (m === Infinity ? null : [x, y]))
        ),
        drawEndNull$
      ),
    }
  },
}
</script>

<style></style>
