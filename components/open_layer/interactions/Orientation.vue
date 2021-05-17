<template>
  <div v-if="active">
    <control class="input-control bed-space-control">
      <v-text-field
        v-model="bedSpacing"
        label="Passe pied"
        type="number"
        style="width: 70px"
        hide-details
        suffix="cm"
        dir="rtl"
      ></v-text-field>
    </control>
    <control class="input-control bed-size-control">
      <v-text-field
        v-model="bedWidth"
        label="Planche"
        type="number"
        style="width: 70px"
        hide-details
        suffix="cm"
        dir="rtl"
      ></v-text-field>
    </control>
    <vector-layer>
      <vector-source>
        <feature v-if="segment && !loading">
          <line-string :coordinates="segment" />
          <feature-style>
            <stroke-style color="#ffcc33" width="5" />
          </feature-style>
        </feature>
      </vector-source>
    </vector-layer>
  </div>
</template>

<script>
import {
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  pluck,
  switchMap,
} from 'rxjs/operators'
import { iif, of } from 'rxjs'
import gql from 'graphql-tag'

import { LineString as OlLineString } from 'ol/geom'
import PointerInteraction from 'ol/interaction/Pointer'

import GeoJSON from 'ol/format/GeoJSON'

import {
  // eslint-disable-next-line camelcase
  ol_coordinate_findSegment,
  // eslint-disable-next-line camelcase
  ol_coordinate_dist2d,
} from 'ol-ext/geom/GeomUtils'
import Polygon from 'ol/geom/Polygon'
import VectorLayer from '../layers/VectorLayer.vue'
import VectorSource from '../sources/VectorSource.vue'
import LineString from '../geometry/LineString.vue'
import Feature from '../Feature.vue'
import FeatureStyle from '../styles/FeatureStyle.vue'
import StrokeStyle from '../styles/StrokeStyle.vue'
import { fromOpenLayerEvent } from '~/utils/obesravble'
export default {
  name: 'Oriantation',
  components: {
    VectorLayer,
    VectorSource,
    LineString,
    Feature,
    StrokeStyle,
    FeatureStyle,
  },
  data() {
    return {
      bedWidth: 100,
      bedSpacing: 40,
      pointerI: null,
      loading: false,
    }
  },
  inject: ['getLayerInstance', 'getControlInstance', 'getMapInstance'],
  observableMethods: {
    handleMoveEvent: 'handleMoveEvent$',
  },
  beforeMount() {
    this.pointerI = new PointerInteraction({
      handleDownEvent: this.handleDownEvent,
      handleMoveEvent: this.handleMoveEvent,
    })

    this.$nextTick().then(() => {
      this.getControlInstance().setInteraction(this.pointerI)
      this.pointerI.setActive(this.getControlInstance().getActive())
      this.getMapInstance().addInteraction(this.pointerI)
    })
  },
  methods: {
    handleDownEvent() {
      if (!this.segment) return
      const featureProjection = this.getMapInstance()
        .getView()
        .getProjection()
        .getCode()
      const format = new GeoJSON({ featureProjection })
      const feature = this.feature
      feature.setProperties({ loading: true }, false)
      this.loading = true
      this.$apollo
        .mutate({
          mutation: gql`
            mutation selectOrientation(
              $parcelId: ID!
              $startSegment: LineStringScalar!
              $bedWidth: Int!
              $bedSpacing: Int!
            ) {
              selectOrientation(
                parcelId: $parcelId
                startSegment: $startSegment
                bedWidth: $bedWidth
                bedSpacing: $bedSpacing
              ) {
                beds {
                  id
                  geometry
                }
              }
            }
          `,
          variables: {
            parcelId: feature.getId(),
            startSegment: format.writeGeometry(new OlLineString(this.segment)),
            bedWidth: this.bedWidth,
            bedSpacing: this.bedSpacing,
          },
          update: (
            store,
            {
              data: {
                selectOrientation: { beds },
              },
            }
          ) => {
            const fragment = gql`
              fragment parcel on ParcelType {
                id
                beds {
                  id
                  geometry
                }
              }
            `
            const data = store.readFragment({
              id: `ParcelType:${feature.getId()}`,
              fragment,
            })

            data.beds = beds

            store.writeFragment({
              id: `ParcelType:${feature.getId()}`,
              fragment,
              data,
            })
          },
        })
        .then(() => {
          feature.setProperties({ loading: false }, false)
          this.loading = false
        })
    },
  },
  subscriptions() {
    const mapI = this.getMapInstance()
    const hoveredFeatureAndCoord$ = this.handleMoveEvent$.pipe(
      pluck('coordinate'),
      map((coordinate) => ({
        coordinate,
        features: mapI
          .getFeaturesAtPixel(mapI.getPixelFromCoordinate(coordinate), {
            layerFilter(layer) {
              return layer.getProperties().name === 'parcelLayer'
            },
            hitTolerance: 10,
          })
          .filter((f) => f.getGeometry() instanceof Polygon),
      })),
      map(({ coordinate, features: [feature] }) => ({ coordinate, feature }))
    )

    const segment$ = hoveredFeatureAndCoord$.pipe(
      mergeMap((value) =>
        iif(
          () => !value.feature,
          of(null),
          of(value).pipe(
            map((value) => ({
              ...value,
              closestPoint: value.feature
                .getGeometry()
                .getClosestPoint(value.coordinate),
            })),
            mergeMap((value) =>
              iif(
                () =>
                  ol_coordinate_dist2d(
                    mapI.getPixelFromCoordinate(value.closestPoint),
                    mapI.getPixelFromCoordinate(value.coordinate)
                  ) > 10,
                of(null),
                of(value).pipe(
                  map(
                    ({ closestPoint, feature }) =>
                      ol_coordinate_findSegment(
                        closestPoint,
                        feature.getGeometry().getCoordinates(false)[0]
                      ).segment
                  )
                )
              )
            )
          )
        )
      ),
      distinctUntilChanged((x, y) => JSON.stringify(x) === JSON.stringify(y))
    )
    this.$subscribeTo(segment$, (segment) => {
      mapI.getTargetElement().style.cursor =
        !!segment && !this.loading ? 'pointer' : null
    })

    return {
      segment: segment$,
      feature: hoveredFeatureAndCoord$.pipe(pluck('feature')),
      active: this.$watchAsObservable('pointerI').pipe(
        pluck('newValue'),
        filter((value) => value),
        switchMap((interaction) =>
          fromOpenLayerEvent(interaction, 'change:active').pipe(
            map(({ target }) => target.getActive())
          )
        )
      ),
    }
  },
}
</script>

<style>
.input-control {
  bottom: 0.5em;
}
.v-input__slot:before {
  width: 0 !important;
}
.bed-space-control {
  left: 0.5em;
}
.bed-size-control {
  left: 5.5em;
}
</style>
