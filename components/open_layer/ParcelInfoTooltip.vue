<template>
  <v-card v-if="feature && parcel">
    <v-card-title>{{ parcel.name }}</v-card-title>
    <v-card-text>
      <div>Aire: {{ featureArea | formatArea }}</div>
      <div v-if="closeSegment">
        Longeur du coté: {{ closeSegmentLength | formatLength }}
      </div>
    </v-card-text>
  </v-card>
  <v-chip v-else-if="showHint">Passez la souris sur une parcelle</v-chip>
</template>

<script>
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  mergeMap,
  pluck,
  throttleTime,
} from 'rxjs/operators'
import { iif, merge, of } from 'rxjs'
import {
  // eslint-disable-next-line camelcase
  ol_coordinate_findSegment,
  // eslint-disable-next-line camelcase
  ol_coordinate_dist2d,
} from 'ol-ext/geom/GeomUtils'
import LineString from 'ol/geom/LineString'
import { Draw } from 'ol/interaction'
import Polygon from 'ol/geom/Polygon'

export default {
  name: 'ParcelInfoTooltip',
  inject: ['getMapInstance'],
  props: {
    coordinate: {
      type: Array,
      default: () => [0, 0],
    },
    parcels: {
      type: Array,
      required: true,
    },
  },
  computed: {
    closeSegmentLength() {
      return new LineString(this.closeSegment).getLength()
    },
    featureArea() {
      return this.feature.getGeometry().getArea()
    },
  },
  subscriptions() {
    const mapI = this.getMapInstance()
    const data = this.$watchAsObservable('coordinate').pipe(
      throttleTime(100),
      pluck('newValue'),
      filter((_) => {
        const drawI = mapI
          .getInteractions()
          .getArray()
          .find((i) => i instanceof Draw)
        return !drawI.getActive()
      }),
      map((coordinate) => ({
        coordinate,
        features: mapI
          .getFeaturesAtPixel(mapI.getPixelFromCoordinate(coordinate), {
            hitTolerance: 10,
          })
          .filter((f) => f.getGeometry() instanceof Polygon),
      }))
    )

    const coordinate = this.$watchAsObservable('coordinate')

    const feature = data.pipe(
      map(({ features: [f] }) => f),
      distinctUntilChanged()
    )

    return {
      feature,
      parcel: feature.pipe(
        map((f) => this.parcels.find((p) => p.id === f?.getId()))
      ),
      closeSegment: data.pipe(
        map(({ coordinate, features: [feature] }) => ({ coordinate, feature })),
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
                          feature.getGeometry().getCoordinates()[0]
                        ).segment
                    )
                  )
                )
              )
            )
          )
        )
      ),
      showHint: merge(
        coordinate.pipe(mapTo(false)),
        coordinate.pipe(mapTo(true), debounceTime(200))
      ),
    }
  },
}
</script>

<style></style>
