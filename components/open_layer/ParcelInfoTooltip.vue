<template>
  <div>
    <v-fade-transition>
      <v-card v-if="parcel && feature" class="info-card">
        <v-card-title>Parcelle</v-card-title>
        <v-card-text>
          <div>Aire: {{ parcel.area | formatArea }}</div>
          <div>Aire cultivable: {{ parcel.cultivableArea | formatArea }}</div>
          <div v-if="closeSegment">
            Longeur du coté: {{ closeSegmentLength | formatLength }}
          </div>
          <v-expand-transition>
            <ApolloQuery
              :query="getParcelDetails"
              :variables="{ id: parcel.id }"
            >
              <template v-slot="{ result: { data }, isLoading }">
                <template v-if="data.parceldetails.soilType.length > 0">
                  <div v-if="data.parceldetails.soilType.length == 1">
                    Type de sol:
                    {{ data.parceldetails.soilType[0].description }}
                  </div>
                  <div v-else>
                    Type de sol:
                    <v-simple-table dense>
                      <tbody>
                        <tr
                          v-for="type in data.parceldetails.soilType"
                          :key="type.code"
                        >
                          <td>{{ type.description }}</td>
                          <td>
                            {{ Math.round(type.proportion * 100 * 100) / 100 }}%
                          </td>
                        </tr>
                      </tbody>
                    </v-simple-table>
                  </div>
                </template>

                <v-progress-linear
                  v-if="isLoading"
                  indeterminate
                ></v-progress-linear>
              </template>
            </ApolloQuery>
          </v-expand-transition>
        </v-card-text>
        <v-divider />
        <v-expand-transition>
          <div v-if="bedInfoToDisplay">
            <v-card-title>Planche</v-card-title>
            <v-card-text>
              <div v-if="bedInfoToDisplay.totalPlantedArea == 0">
                Il n'y a aucune plantation sur cette plance
              </div>
              <template v-else-if="bedInfoToDisplay.plantations.length == 1">
                <div>
                  Aire plantée:
                  {{ bedInfoToDisplay.totalPlantedArea | formatArea }} m<sup
                    >2</sup
                  >
                </div>
                <div>
                  Variété: {{ bedInfoToDisplay.plantations[0].variety.name }}
                </div>
              </template>
              <v-simple-table v-else dense>
                <thead>
                  <tr>
                    <th class="text-left">Variété</th>
                    <th class="text-left">Aire</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="plantation in bedInfoToDisplay.plantations"
                    :key="plantation.id"
                  >
                    <td>{{ plantation.variety.name }}</td>
                    <td>{{ plantation.area }} m<sup>2</sup></td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td class="text-right font-weight-bold">
                      Aire total plantée
                    </td>
                    <td>
                      {{ bedInfoToDisplay.totalPlantedArea }} m<sup>2</sup>
                    </td>
                  </tr>
                </tfoot>
              </v-simple-table>
            </v-card-text>
          </div>
        </v-expand-transition>
      </v-card>
    </v-fade-transition>
    <vector-layer>
      <vector-source>
        <feature v-if="bed">
          <geo-json-geometry :geojson="bed.geometry" />
          <template #style>
            <feature-style>
              <template #stroke>
                <stroke-style :color="colors.blueGrey.base" :width="3" />
              </template>
            </feature-style>
          </template>
        </feature>
        <feature v-if="feature">
          <polygon-geometry
            :coordinates="feature.getGeometry().getCoordinates()"
          />
          <template #style>
            <feature-style>
              <template #stroke>
                <stroke-style :color="colors.blue.base" :width="3" />
              </template>
            </feature-style>
          </template>
        </feature>
        <feature v-if="closeSegment">
          <line-string :coordinates="closeSegment" />
          <template #style>
            <feature-style>
              <template #stroke>
                <stroke-style :color="colors.orange.base" :width="4" />
              </template>
            </feature-style>
          </template>
        </feature>
      </vector-source>
    </vector-layer>
  </div>
</template>

<script>
import {
  map,
  mergeMap,
  pluck,
  find,
  startWith,
  debounce,
  take,
} from 'rxjs/operators'
import { combineLatest, EMPTY, from, iif, interval, of } from 'rxjs'
import colors from 'vuetify/lib/util/colors'
import {
  // eslint-disable-next-line camelcase
  ol_coordinate_findSegment,
  // eslint-disable-next-line camelcase
  ol_coordinate_dist2d,
} from 'ol-ext/geom/GeomUtils'
import LineString from 'ol/geom/LineString'
import VectorLayer from './layers/VectorLayer.vue'
import VectorSource from './sources/VectorSource.vue'
import Feature from './Feature.vue'
import FeatureStyle from './styles/FeatureStyle.vue'
import LineStringComp from './geometry/LineString.vue'
import PolygonGeometry from './geometry/Polygon.vue'
import GeoJsonGeometry from './geometry/GeoJsonGeometry.vue'
import { getParcelDetails } from '~/graphql/parcel.gql'

export default {
  name: 'ParcelInfoTooltip',
  components: {
    VectorLayer,
    Feature,
    LineString: LineStringComp,
    VectorSource,
    FeatureStyle,
    PolygonGeometry,
    GeoJsonGeometry,
  },
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
  data() {
    return { colors, getParcelDetails }
  },
  computed: {
    closeSegmentLength() {
      return new LineString(this.closeSegment).getLength()
    },
    featureArea() {
      return this.feature.getGeometry().getArea()
    },
  },
  mounted() {
    this.$watch('parcel', (value) => {
      this.$emit('show', !!value)
    })
  },
  subscriptions() {
    const mapI = this.getMapInstance()
    const coordinate$ = this.$watchAsObservable('coordinate').pipe(
      pluck('newValue')
    )

    const features$ = coordinate$.pipe(
      map((coordinate) =>
        mapI.getFeaturesAtPixel(mapI.getPixelFromCoordinate(coordinate))
      )
    )

    const parcelFeature$ = features$.pipe(
      mergeMap((features) =>
        from(features).pipe(
          startWith(null),
          find((feature) => feature?.getKeys()?.includes('parcel'))
        )
      )
    )

    const bed$ = features$.pipe(
      mergeMap((features) =>
        from(features).pipe(
          startWith(null),
          find((feature) => feature?.getKeys()?.includes('bed')),
          map((feature) => feature?.get('bed'))
        )
      )
    )

    return {
      feature: parcelFeature$,
      bed: bed$,
      bedInfoToDisplay: bed$.pipe(
        debounce((bed) => iif(() => !!bed, EMPTY, interval(50).pipe(take(1))))
      ),
      parcel: parcelFeature$.pipe(map((feature) => feature?.get('parcel'))),
      closeSegment: combineLatest([coordinate$, parcelFeature$]).pipe(
        map(([coordinate, feature]) => ({
          coordinate,
          geometry: feature?.getGeometry(),
        })),
        mergeMap((value) =>
          iif(
            () => !value.geometry,
            of(null),
            of(value).pipe(
              map((value) => ({
                ...value,
                closestPoint: value.geometry.getClosestPoint(value.coordinate),
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
                      ({ closestPoint, geometry }) =>
                        ol_coordinate_findSegment(
                          closestPoint,
                          geometry.getCoordinates()[0]
                        ).segment
                    )
                  )
                )
              )
            )
          )
        )
      ),
    }
  },
}
</script>

<style>
.info-card {
  max-width: 300px;
}
</style>
