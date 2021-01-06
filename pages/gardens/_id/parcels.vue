<template>
  <div>
    <v-card>
      <v-row no-gutters>
        <v-col sm="10">
          <v-map v-if="garden" :fit="fit">
            <tile-layer>
              <bing-map
                :api-key="apiKey"
                :imagery-set="'AerialWithLabelsOnDemand'"
              >
              </bing-map>
            </tile-layer>
            <vector-layer>
              <vector-source
                :features="features"
                @addfeature="addFeature"
                @removefeature="deleteFeature"
                @changefeature="updateExtent"
              >
                <edit-bar />
              </vector-source>
              <zoom-to-extent />
            </vector-layer>
            <controls>
              <full-screen />
              <zoom-to-extent :extent="extent" />
            </controls>
            <interactions> </interactions>
          </v-map>
        </v-col>
        <v-col>
          <v-list v-if="garden">
            <v-list-item-group v-model="selectedParcel" color="primary">
              <v-list-item
                v-for="parcel in garden.parcelSet"
                :key="parcel.id"
                :value="parcel"
              >
                <v-list-item-content>{{ parcel.name }}</v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>
<script>
import { fromEventPattern, from, Subscription } from 'rxjs'
import { debounceTime, mapTo, mergeMap } from 'rxjs/operators'
import 'ol/ol.css'
import GeoJSON from 'ol/format/GeoJSON'
import { createEmpty, extend } from 'ol/extent'
import VMap from '~/components/open_layer/VMap.vue'
import TileLayer from '~/components/open_layer/layers/TileLayer.vue'
import BingMap from '~/components/open_layer/sources/BingMap.vue'
import Controls from '~/components/open_layer/controls/Controls.vue'
import FullScreen from '~/components/open_layer/controls/FullScreen.vue'
import ZoomToExtent from '~/components/open_layer/controls/ZoomToExtent.vue'
import EditBar from '~/components/open_layer/controls/EditBar.vue'
import Interactions from '~/components/open_layer/interactions/Interactions.vue'
import VectorLayer from '~/components/open_layer/layers/VectorLayer.vue'
import VectorSource from '~/components/open_layer/sources/VectorSource.vue'
import { gardenById } from '~/graphql/garden.gql'
import {
  deleteParcel,
  parcelsFromGardenId,
  createParcel,
  updateParcel,
} from '~/graphql/parcel.gql'

export default {
  components: {
    VMap,
    TileLayer,
    BingMap,
    Controls,
    FullScreen,
    Interactions,
    VectorLayer,
    VectorSource,
    EditBar,
    ZoomToExtent,
  },
  data() {
    return {
      sub: new Subscription(),
      apiKey: process.env.BING_MAP_KEY,
      selectedParcel: {},
      controlsOption: { zoom: false },
      geoJSON: new GeoJSON(),
      extent: createEmpty(),
    }
  },
  apollo: {
    garden: {
      query: gardenById,
      variables() {
        return {
          id: this.$route.params.id,
        }
      },
    },
  },
  computed: {
    features() {
      return this.garden?.parcelSet.map((p) => p.feature) || []
    },
    fit() {
      return (
        this.selectedParcel?.feature?.getGeometry().getExtent() || this.extent
      )
    },
  },
  watch: {
    features: {
      deep: false,
      handler() {
        this.updateExtent()
        this.sub?.unsubscribe()

        this.sub = from(this.garden.parcelSet)
          .pipe(
            mergeMap((parcel) =>
              fromEventPattern(
                (h) => parcel.feature.getGeometry().on('change', h),
                (h) => parcel.feature.getGeometry().un('change', h)
              ).pipe(debounceTime(500), mapTo(parcel))
            )
          )
          .subscribe((parcel) => this.changeFeature(parcel))
      },
    },
  },
  beforeDestroy() {
    this.sub?.unsubscribe()
  },
  methods: {
    deleteFeature(feature) {
      const parcelId = feature.getProperties().parcel_id
      const id = this.$route.params.id
      this.$apollo.mutate({
        mutation: deleteParcel,
        variables: {
          id: parcelId,
        },
        update(store, { data: { deleteParcel } }) {
          if (deleteParcel.ok === true) {
            const query = parcelsFromGardenId
            const data = store.readQuery({
              query,
              variables: { id },
            })
            data.garden.parcelSet = data.garden.parcelSet.filter(
              (p) => p.id !== feature.getProperties().parcel_id
            )
            store.writeQuery({ query, data })
          }
        },
      })
    },
    addFeature(feature) {
      const id = this.$route.params.id
      this.$apollo.mutate({
        mutation: createParcel,
        variables: {
          name: `Parcel ${this.garden.parcelSet.length + 1}`,
          geometry: this.geoJSON.writeGeometry(feature.getGeometry()),
          gardenId: this.$route.params.id,
        },
        update(store, { data: { createParcel } }) {
          createParcel.feature = feature
          const query = parcelsFromGardenId
          const data = store.readQuery({
            query,
            variables: { id },
          })
          createParcel.feature.setProperties({ parcel_id: createParcel.id })
          data.garden.parcelSet.push(createParcel)
          store.writeQuery({ query, data })
        },
      })
    },
    changeFeature(parcel) {
      this.$apollo.mutate({
        mutation: updateParcel,
        variables: {
          geometry: this.geoJSON.writeGeometry(parcel.feature.getGeometry()),
          id: parcel.id,
        },
      })
    },
    updateExtent() {
      this.extent[0] = Infinity
      this.extent[1] = Infinity
      this.extent[2] = -Infinity
      this.extent[3] = -Infinity
      this.features.forEach((f) =>
        extend(this.extent, f.getGeometry().getExtent())
      )
    },
  },
}
</script>
