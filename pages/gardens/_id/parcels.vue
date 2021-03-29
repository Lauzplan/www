<template>
  <div>
    <error-manager :error.sync="error" />
    <!-- <v-row>
      <v-spacer />
      <v-col>
        <file-upload-button />
      </v-col>
    </v-row> -->
    <div class="d-flex justify-end">
      <v-btn class="mb-2 mr-5" color="success" rounded>
        <v-icon left>mdi-download</v-icon>
        Export
      </v-btn>
      <file-upload-button />
    </div>
    <v-card>
      <v-row no-gutters>
        <!-- <v-col sm="10"> -->
        <v-col>
          <v-map v-if="garden">
            <tile-layer>
              <tile-arc-gis
                :url="'https://geoservices.wallonie.be/arcgis/rest/services/IMAGERIE/ORTHO_LAST/MapServer'"
              />
            </tile-layer>
            <tile-layer>
              <tile-arc-gis
                :url="'https://geoservices.wallonie.be/arcgis/rest/services/DONNEES_BASE/FDC_SPW_ANNOTATIONS/MapServer'"
              />
            </tile-layer>
            <vector-layer
              :options="{
                minZoom: 12,
              }"
            >
              <vector-source>
                <feature v-for="bed in beds" :key="bed.id">
                  <geo-json-geometry :geojson="bed.geometry" />
                  <feature-style>
                    <stroke-style color="black" width="1" />
                  </feature-style>
                </feature>
              </vector-source>
            </vector-layer>
            <vector-layer :properties="{ name: 'parcelLayer' }">
              <vector-source>
                <template #feature="{ feature }">
                  <feature-with-loading :feature="feature" />
                  <synced-parcel
                    :key="feature.ol_uid"
                    :feature="feature"
                    :sync="syncParcels"
                    :parcels="garden.parcelSet"
                    @error="error = 'Impossible de sauver cette parcelle.'"
                  />
                </template>
                <snap-guide-interaction>
                  <template #segment="{ segment, projection, resolution }">
                    <snap-guide v-if="isDrawing" :vector="segment" />
                    <snap-guide
                      v-if="isDrawing"
                      :vector="offsetSegment(segment, projection, resolution)"
                    />
                  </template>
                </snap-guide-interaction>
                <zoom-to-extent />

                <parcel-loader
                  :parcels="garden.parcelSet"
                  @loadEnd="parcelsLoaded = true"
                />
                <edit-bar
                  @changeDraw="isDrawing = $event"
                  @changeModify="isDrawing = $event"
                >
                  <toggle :class-name="'ol-info'" :title="'Informations'">
                    <mouse-tooltip v-slot="{ coordinate }">
                      <parcel-info-tooltip
                        :coordinate="coordinate"
                        :parcels="garden.parcelSet"
                      />
                    </mouse-tooltip>
                  </toggle>
                  <toggle :title="'Orientation'" :html="'O'">
                    <orientation />
                  </toggle>
                </edit-bar>
              </vector-source>
            </vector-layer>

            <controls>
              <full-screen />
              <control v-if="isDrawing" class="snap-guides-control">
                <v-text-field
                  v-model="snapOffset"
                  label="Ecart guides"
                  type="number"
                  style="width: 70px"
                  hide-details
                  suffix="m"
                  dir="rtl"
                ></v-text-field>
              </control>
            </controls>
            <interactions> </interactions>
            <drawing-tooltip />
          </v-map>
        </v-col>
      </v-row>
    </v-card>
    <v-expansion-panels v-if="garden" v-model="open" class="mt-5">
      <parcel-detail-panel
        v-for="parcel in garden.parcelSet"
        :key="parcel.id"
        :parcel="parcel"
      />
    </v-expansion-panels>
  </div>
</template>
<script>
import 'ol/ol.css'
import { createEmpty } from 'ol/extent'
import LineString from 'ol/geom/LineString'
import { getPointResolution } from 'ol/proj'
import VMap from '~/components/open_layer/VMap.vue'
import TileLayer from '~/components/open_layer/layers/TileLayer.vue'
import Controls from '~/components/open_layer/controls/Controls.vue'
import FullScreen from '~/components/open_layer/controls/FullScreen.vue'
import ZoomToExtent from '~/components/open_layer/controls/ZoomToExtent.vue'
import EditBar from '~/components/open_layer/controls/EditBar.vue'
import Interactions from '~/components/open_layer/interactions/Interactions.vue'
import VectorLayer from '~/components/open_layer/layers/VectorLayer.vue'
import VectorSource from '~/components/open_layer/sources/VectorSource.vue'
// import SnapGuideInteraction from '~/components/open_layer/interactions/SnapGuideInteraction.vue'
// import SnapGuide from '~/components/open_layer/interactions/SnapGuide.vue'
import { parcelsFromGardenId } from '~/graphql/parcel.gql'
// import ContextMenu from '~/components/ContextMenu.vue'

import MouseTooltip from '~/components/open_layer/interactions/MouseTooltip.vue'
import ParcelInfoTooltip from '~/components/open_layer/ParcelInfoTooltip.vue'
import DrawingTooltip from '~/components/open_layer/interactions/DrawingTooltip.vue'
import SyncedParcel from '~/components/SyncedParcel.vue'
import Toggle from '~/components/open_layer/controls/Toggle.vue'
import Orientation from '~/components/open_layer/interactions/Orientation.vue'
import ParcelLoader from '~/components/open_layer/ParcelLoader.vue'
import TileArcGis from '~/components/open_layer/sources/TileArcGis.vue'
import ErrorManager from '~/components/ErrorManager.vue'
import FileUploadButton from '~/components/FileUploadButton.vue'
import Feature from '~/components/open_layer/Feature.vue'
import GeoJsonGeometry from '~/components/open_layer/geometry/GeoJsonGeometry.vue'
import FeatureStyle from '~/components/open_layer/styles/FeatureStyle.vue'
import StrokeStyle from '~/components/open_layer/styles/StrokeStyle.vue'
import ParcelDetailPanel from '~/components/ParcelDetailPanel.vue'
// import FeatureStyleApplier from '~/components/open_layer/styles/FeatureStyleApplier.vue'
// import FillStyle from '~/components/open_layer/styles/FillStyle.vue'

export default {
  components: {
    VMap,
    TileLayer,
    Controls,
    FullScreen,
    Interactions,
    VectorLayer,
    VectorSource,
    EditBar,
    ZoomToExtent,
    // SnapGuideInteraction,
    // SnapGuide,
    // ContextMenu,
    MouseTooltip,
    ParcelInfoTooltip,
    DrawingTooltip,
    SyncedParcel,
    Toggle,
    Orientation,
    ParcelLoader,
    TileArcGis,
    ErrorManager,
    FileUploadButton,
    Feature,
    GeoJsonGeometry,
    FeatureStyle,
    StrokeStyle,
    ParcelDetailPanel,
    // FeatureStyleApplier,
    // FillStyle,
  },
  data() {
    return {
      apiKey: process.env.BING_MAP_KEY,
      selectedParcel: {},
      controlsOption: { zoom: false },
      extent: createEmpty(),
      snapOffset: 1,
      isDrawing: false,
      syncParcels: false,
      parcelsLoaded: false,
      error: '',
      open: null,
      isActive: false,
    }
  },
  apollo: {
    garden: {
      query: parcelsFromGardenId,
      variables() {
        return {
          id: this.$route.params.id,
        }
      },
    },
  },
  computed: {
    beds() {
      return this.garden.parcelSet.map((parcel) => parcel.bedSet).flat()
    },
  },
  watch: {
    parcelsLoaded(value) {
      if (value) {
        this.syncParcels = true
      }
    },
  },
  domStreams: ['syncParcelError$'],
  activated() {
    this.syncParcels = this.parcelsLoaded
  },
  deactivated() {
    this.syncParcels = false
  },

  methods: {
    offsetSegment(segment, proj) {
      const line = new LineString(segment)
      const vectorLength = line.getLength()

      const translateVector = line.clone()
      const anchor = translateVector.getFirstCoordinate()
      translateVector.rotate(Math.PI / 2, anchor)

      const PointRes = getPointResolution(proj, 1, anchor)
      const scaleFactor = this.snapOffset / (vectorLength * PointRes)
      translateVector.scale(scaleFactor, scaleFactor, anchor)
      const [[x1, y1], [x2, y2]] = translateVector.getCoordinates()

      line.translate(x2 - x1, y2 - y1)
      return line.getCoordinates()
    },
  },
  beforeRouteLeave(from, to, next) {
    this.syncParcels = false
    next()
  },
}
</script>

<style scoped>
.snap-guides-control {
  left: 0.5em;
  bottom: 0.5em;
}
</style>
