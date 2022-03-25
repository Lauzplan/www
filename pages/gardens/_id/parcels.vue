<template>
  <v-container fluid fill-height class="pa-0">
    <error-manager :error="error" />
    <v-fade-transition>
      <ApolloMutation
        v-if="
          selectedDrawingTool === 'plant' &&
          species &&
          selectedParcel &&
          maxArea > 0
        "
        id="plantation-card"
        v-slot="{ mutate }"
        :mutation="addPlantation"
        :update="updatePlantation"
      >
        <v-card>
          <validation-observer v-slot="{ invalid, handleSubmit }">
            <v-card-text>
              <v-select
                v-model="selectedSpeciesWithDefault"
                item-text="name"
                :items="species"
                return-object
                label="Espèce"
              />
              <validation-provider
                v-slot="{ errors }"
                name="Variété"
                rules="requiredField:id"
              >
                <v-select
                  v-model="selectedVariety"
                  item-text="name"
                  :items="selectedSpeciesWithDefault.varieties"
                  :error-messages="errors"
                  label="Variété"
                  return-object
                />
              </validation-provider>
              <v-range-slider
                v-model="bedRange"
                :max="selectedParcel.beds.length"
                label="Planches"
              />
              <v-text-field
                v-model="selectedArea"
                :min="1"
                :max="maxArea"
                label="Aire cultivable"
                flat
                suffix="m2"
                type="number"
              />
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                small
                :disabled="invalid"
                @click="
                  handleSubmit(() =>
                    mutate({
                      variables: {
                        varietyId: selectedVariety.id,
                        area: selectedArea,
                        startBedId: selectedParcel.beds[bedSelectionStart].id,
                      },
                    })
                  )
                "
              >
                <v-icon left>mdi-plus</v-icon>
                plantation
              </v-btn>
            </v-card-actions>
          </validation-observer>
        </v-card>
      </ApolloMutation>
    </v-fade-transition>
    <v-map v-if="garden" :fit="mapFit" style="height: 100%">
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
        :properties="{ name: 'parcels' }"
        :options="{
          minZoom: 9,
        }"
      >
        <template #style>
          <default-style />
          <feature-style v-if="selectedDrawingTool == 'deleteVertex'">
            <template #image>
              <circle-style :radius="5">
                <template #fill>
                  <fill-style color="orange"> </fill-style>
                </template>
              </circle-style>
            </template>
            <template #geometry>
              <polygon-vertices />
            </template>
          </feature-style>
        </template>
        <vector-source ref="parcelLayer" :extent.sync="parcelsExtent">
          <!-- <template #feature="{ feature }">
                <feature-with-loading :feature="feature" />
                <synced-parcel
                  :key="feature.ol_uid"
                  :feature="feature"
                  :sync="syncParcels"
                  :parcels="garden.parcels"
                  @error="
                    error = {
                      message: 'Impossible de sauver cette parcelle.',
                    }
                  "
                />
              </template> -->
          <snap-guide-interaction>
            <template
              v-if="selectedDrawingTool === 'edit'"
              #segment="{ segment, projection, resolution }"
            >
              <snap-guide :vector="segment" />
              <snap-guide
                :vector="offsetSegment(segment, projection, resolution)"
              />
            </template>
          </snap-guide-interaction>

          <parcel-loader
            :parcels="garden.parcels"
            @loadEnd="parcelsLoaded = true"
          />
          <draw-interaction
            :type="'Polygon'"
            :active="selectedDrawingTool === 'draw'"
          />
          <modify-interaction
            :active="['edit', 'deleteVertex'].includes(selectedDrawingTool)"
            :delete-condition="
              selectedDrawingTool == 'deleteVertex' ? primaryAction : undefined
            "
            :insert-vertex-condition="
              selectedDrawingTool == 'deleteVertex' ? never : undefined
            "
          >
            <template
              v-if="selectedDrawingTool == 'deleteVertex'"
              #pointerStyle
            >
              <feature-style>
                <template #text>
                  <text-style :font="mdiFont">
                    <template>&#xF0156;</template>
                    <template #fill>
                      <fill-style color="red" />
                    </template>
                  </text-style>
                </template>
              </feature-style>
            </template>
          </modify-interaction>
        </vector-source>
      </vector-layer>
      <vector-layer
        :options="{
          maxZoom: 9,
        }"
      >
        <template #style>
          <feature-style>
            <template #geometry>
              <polygon-centroid />
            </template>
            <template #image>
              <circle-style :radius="5">
                <template #fill>
                  <fill-style color="orange" />
                </template>
              </circle-style>
            </template>
          </feature-style>
        </template>
        <vector-source>
          <feature v-for="parcel in garden.parcels" :key="parcel.id">
            <geo-json-geometry :geojson="parcel.geometry" />
          </feature>
        </vector-source>
      </vector-layer>
      <vector-layer
        :options="{
          minZoom: 12,
        }"
      >
        <vector-source>
          <feature v-for="bed in beds" :key="bed.id" :properties="{ bed }">
            <geo-json-geometry :geojson="bed.geometry" />
            <template #style>
              <template
                v-if="selectedParcel && bed.parcel.id == selectedParcel.id"
              >
                <!-- GREY -->
                <feature-style v-if="bed.totalPlantedArea == bed.area">
                  <template #stroke>
                    <stroke-style :color="colors.grey.darken3" :width="1" />
                  </template>
                  <template #fill>
                    <fill-style :color="colors.grey.darken1" />
                  </template>
                </feature-style>

                <!-- GREEN -->
                <feature-style
                  v-else-if="bed.totalPlantedArea + bed.areaToAdd == bed.area"
                >
                  <template #stroke>
                    <stroke-style :color="colors.green.lighten4" :width="1" />
                  </template>
                  <template #fill>
                    <fill-style :color="colors.green.base" />
                  </template>
                  <template #text>
                    <text-style
                      v-if="bed.totalPlantedArea"
                      :overflow="true"
                      placement="line"
                      text-baseline="ideographic"
                      font="24px sans-serif"
                      >{{ bed.areaToAdd }}&nbsp;m<sup>2</sup></text-style
                    >
                  </template>
                </feature-style>

                <!-- PLANTING -->
                <feature-style
                  v-else-if="additionnalArea && nextBed.id == bed.id"
                >
                  <template #stroke>
                    <stroke-style :color="colors.green.base" :width="2" />
                  </template>
                  <template #fill>
                    <fill-style
                      :color="`rgba(205, 220, 57,${
                        additionnalArea / (bed.area - bed.totalPlantedArea)
                      })`"
                    />
                  </template>
                  <template #text>
                    <text-style
                      :overflow="true"
                      placement="line"
                      text-baseline="ideographic"
                      font="24px sans-serif"
                      >{{ additionnalArea }}&nbsp;/&nbsp;{{
                        bed.area - bed.totalPlantedArea
                      }}&nbsp;m<sup>2</sup></text-style
                    >
                  </template>
                </feature-style>

                <!-- EMPTY -->
                <feature-style v-else>
                  <template #stroke>
                    <stroke-style :color="colors.green.darken3" :width="1" />
                  </template>
                  <template #fill>
                    <fill-style :color="[0, 0, 0, 0]" />
                  </template>
                </feature-style>
              </template>
              <template v-else>
                <!-- PLANTED -->
                <feature-style
                  v-if="bed.totalPlantedArea && bed.totalPlantedArea < bed.area"
                >
                  <template #fill>
                    <fill-style
                      :color="`rgba(205, 220, 57,${
                        bed.totalPlantedArea / bed.area
                      })`"
                    />
                  </template>
                  <template #text>
                    <text-style
                      :overflow="true"
                      placement="line"
                      text-baseline="ideographic"
                      font="24px sans-serif"
                      >{{ bed.totalPlantedArea }}&nbsp;/&nbsp;{{
                        bed.area
                      }}&nbsp;m<sup>2</sup></text-style
                    >
                  </template>
                </feature-style>

                <!-- GREEN -->
                <feature-style v-else-if="bed.totalPlantedArea == bed.area">
                  <template #stroke>
                    <stroke-style :color="colors.green.lighten4" :width="1" />
                  </template>
                  <template #fill>
                    <fill-style :color="colors.green.base" />
                  </template>
                </feature-style>

                <!-- EMPTY -->
                <feature-style v-else>
                  <template #stroke>
                    <stroke-style :color="colors.grey.darken3" :width="1" />
                  </template>
                  <template #fill>
                    <fill-style :color="[0, 0, 0, 0]" />
                  </template>
                </feature-style>
              </template>
            </template>
          </feature>
        </vector-source>
      </vector-layer>

      <controls>
        <control
          v-if="selectedDrawingTool === 'draw'"
          class="snap-guides-control ol-control"
        >
          <v-card>
            <v-text-field
              v-model="snapOffset"
              label="Ecart guides"
              type="number"
              style="width: 70px"
              hide-details
              suffix="m"
            ></v-text-field>
          </v-card>
        </control>

        <control>
          <v-hover v-model="toolbarHovered">
            <v-card class="toolbar mt-2 ml-2">
              <v-list dense outlined>
                <zoom>
                  <template #zoomIn="{ on }">
                    <list-icon-button tooltip="Zoomer" v-on="on">
                      mdi-plus
                    </list-icon-button>
                  </template>
                  <template #zoomOut="{ on }">
                    <list-icon-button tooltip="Dézoomer" v-on="on">
                      mdi-minus
                    </list-icon-button>
                  </template>
                </zoom>
                <v-divider />
                <zoom-to-extent #default="{ on }" :extent="parcelsExtent">
                  <list-icon-button tooltip="Centrer sur le jardin" v-on="on">
                    mdi-image-filter-center-focus-strong-outline
                  </list-icon-button>
                </zoom-to-extent>
                <v-divider />
                <v-list-item-group v-model="selectedDrawingTool">
                  <list-icon-button
                    tooltip="Dessiner une parcelle"
                    value="draw"
                    link
                  >
                    <!-- TODO: use the one from the mdi CDN when it is updated -->
                    {{ mdiVectorSquarePlus }}
                  </list-icon-button>
                  <div
                    :class="{
                      'grey lighten-3': showEditGroup,
                    }"
                  >
                    <list-icon-button
                      :tooltip="
                        showEditGroup
                          ? 'Editer une parcelle'
                          : 'Editer ou supprimer une parcelle'
                      "
                      link
                      value="edit"
                    >
                      <!-- TODO: use the one from the mdi CDN when it is updated -->
                      {{ mdiVectorSquareEdit }}
                    </list-icon-button>
                    <v-expand-transition>
                      <div v-show="showEditGroup">
                        <list-icon-button
                          tooltip="Supprimer un coin"
                          link
                          value="deleteVertex"
                        >
                          {{ mdiVectorSquareRemove }}
                        </list-icon-button>
                        <list-icon-button
                          tooltip="Déplacer une parcelle"
                          value="move"
                          link
                        >
                          mdi-arrow-all
                        </list-icon-button>
                        <list-icon-button
                          tooltip="Supprimer une parcelle"
                          value="delete"
                          link
                        >
                          mdi-delete-outline
                        </list-icon-button>
                      </div>
                    </v-expand-transition>
                  </div>
                  <list-icon-button
                    tooltip="Information détailée sur une parcelle"
                    value="info"
                    link
                  >
                    mdi-information-outline
                  </list-icon-button>
                  <list-icon-button
                    tooltip="Générer les plances"
                    value="generateBed"
                    link
                  >
                    mdi-cogs
                  </list-icon-button>
                  <list-icon-button
                    tooltip="Gérer les platation"
                    value="plant"
                    link
                  >
                    mdi-sprout
                  </list-icon-button>
                </v-list-item-group>
              </v-list>
            </v-card>
          </v-hover>
        </control>
        <v-slide-y-reverse-transition mode="out-in">
          <delete-features
            v-show="
              selectedDrawingTool == 'delete' && selectedFeatures.length > 0
            "
            :features="selectedFeatures"
            :layers="(layer) => layer.get('name') === 'parcels'"
          />
        </v-slide-y-reverse-transition>
      </controls>
      <interactions>
        <Select
          :active="['plant', 'delete'].includes(selectedDrawingTool)"
          :features.sync="selectedFeatures"
          :toggle-condition="selectedDrawingTool == 'plant' ? never : undefined"
          :layers="(layer) => layer.get('name') === 'parcels'"
        />
        <mouse-tooltip
          v-slot="{ coordinate, on }"
          :active="!!selectedDrawingTool && !toolbarHovered"
          :hint="toolHint"
        >
          <parcel-info-tooltip
            v-if="selectedDrawingTool == 'info'"
            :coordinate="coordinate"
            :parcels="garden.parcels"
            v-on="on"
          />
        </mouse-tooltip>
        <orientation :active="selectedDrawingTool == 'generateBed'" />
      </interactions>
      <drawing-tooltip />
    </v-map>

    <v-expansion-panels v-if="garden" class="mt-5" v-show="false">
      <parcel-detail-panel
        v-for="parcel in garden.parcels"
        :key="parcel.id"
        :parcel="parcel"
        @fit="fitParcel(parcel)"
      />
    </v-expansion-panels>
  </v-container>
</template>
<script>
import 'ol/ol.css'
import { createEmpty, extend } from 'ol/extent'
import LineString from 'ol/geom/LineString'
import { getPointResolution } from 'ol/proj'
import { never, singleClick, primaryAction } from 'ol/events/condition'
import throttle from 'lodash/throttle'
import colors from 'vuetify/lib/util/colors'
import { ValidationObserver, ValidationProvider } from 'vee-validate'

import VMap from '~/components/open_layer/VMap.vue'
import TileLayer from '~/components/open_layer/layers/TileLayer.vue'
import Controls from '~/components/open_layer/controls/Controls.vue'
import ZoomToExtent from '~/components/open_layer/controls/ZoomToExtent.vue'
// import EditBar from '~/components/open_layer/controls/EditBar.vue'
import Interactions from '~/components/open_layer/interactions/Interactions.vue'
import VectorLayer from '~/components/open_layer/layers/VectorLayer.vue'
import VectorSource from '~/components/open_layer/sources/VectorSource.vue'
import SnapGuideInteraction from '~/components/open_layer/interactions/SnapGuideInteraction.vue'
import SnapGuide from '~/components/open_layer/interactions/SnapGuide.vue'
import { parcelsFromGardenId } from '~/graphql/parcel.gql'
// import ContextMenu from '~/components/ContextMenu.vue'

// import MouseTooltip from '~/components/open_layer/interactions/MouseTooltip.vue'
import ParcelInfoTooltip from '~/components/open_layer/ParcelInfoTooltip.vue'
import DrawingTooltip from '~/components/open_layer/interactions/DrawingTooltip.vue'
// import Toggle from '~/components/open_layer/controls/Toggle.vue'
// import Orientation from '~/components/open_layer/interactions/Orientation.vue'
import ParcelLoader from '~/components/open_layer/ParcelLoader.vue'
import TileArcGis from '~/components/open_layer/sources/TileArcGis.vue'
import ErrorManager from '~/components/ErrorManager.vue'
// import FileUploadButton from '~/components/FileUploadButton.vue'
import Feature from '~/components/open_layer/Feature.vue'
import GeoJsonGeometry from '~/components/open_layer/geometry/GeoJsonGeometry.vue'
import FeatureStyle from '~/components/open_layer/styles/FeatureStyle.vue'
import StrokeStyle from '~/components/open_layer/styles/StrokeStyle.vue'
import ParcelDetailPanel from '~/components/ParcelDetailPanel.vue'
// import FeatureStyleApplier from '~/components/open_layer/styles/FeatureStyleApplier.vue'
import FillStyle from '~/components/open_layer/styles/FillStyle.vue'

import getSpecies from '~/graphql/getSpeciesAndVarieties.gql'
import TextStyle from '~/components/open_layer/styles/TextStyle.vue'
import getPlantations from '~/graphql/getPlantations.gql'
import addPlantation from '~/graphql/addPlantation.gql'
import Control from '~/components/open_layer/controls/Control.vue'
import Zoom from '~/components/open_layer/controls/Zoom.vue'
import ListIconButton from '~/components/ListIconButton.vue'
import DrawInteraction from '~/components/open_layer/interactions/DrawInteraction.vue'
import Select from '~/components/open_layer/interactions/Select.vue'
import ModifyInteraction from '~/components/open_layer/interactions/ModifyInteraction.vue'
import CircleStyle from '~/components/open_layer/styles/CircleStyle.vue'
import PolygonVertices from '~/components/open_layer/geometry/PolygonVertices.vue'
import PolygonCentroid from '~/components/open_layer/geometry/PolygonCentroid.vue'
import MouseTooltip from '~/components/open_layer/interactions/MouseTooltip.vue'
import Orientation from '~/components/open_layer/interactions/Orientation.vue'

export default {
  components: {
    VMap,
    TileLayer,
    Controls,
    Interactions,
    VectorLayer,
    VectorSource,
    // EditBar,
    ZoomToExtent,
    SnapGuideInteraction,
    SnapGuide,
    // ContextMenu,
    // MouseTooltip,
    ParcelInfoTooltip,
    DrawingTooltip,
    // Toggle,
    // Orientation,
    ParcelLoader,
    TileArcGis,
    ErrorManager,
    // FileUploadButton,
    Feature,
    GeoJsonGeometry,
    FeatureStyle,
    StrokeStyle,
    ParcelDetailPanel,
    // FeatureStyleApplier,
    FillStyle,
    TextStyle,
    ValidationObserver,
    ValidationProvider,
    Control,
    Zoom,
    ListIconButton,
    DrawInteraction,
    Select,
    ModifyInteraction,
    CircleStyle,
    PolygonVertices,
    PolygonCentroid,
    MouseTooltip,
    Orientation,
  },
  data(vm) {
    return {
      colors,
      never,
      singleClick,
      primaryAction,
      mdiFont: 'normal normal normal 24px/1 "Material Design Icons"',
      selectedFeatures: [],
      toolbarHovered: false,
      extent: createEmpty(),
      snapOffset: 1,
      syncParcels: false,
      parcelsLoaded: false,
      error: { message: '' },
      selectedSpecies: null,
      selectedVariety: null,
      selectedArea: vm.maxArea,
      bedSelectionStart: 0,
      addPlantation,
      mapFit: null,
      parcelsExtent: null,
      selectedDrawingTool: null,
      mdiVectorSquarePlus:
        'M13 19C13 18.7 13 18.3 13.1 18H8V16H6V8H8V6H16V8H18V13.1C18.3 13 18.7 13 19 13C19.3 13 19.7 13 20 13.1V8H22V2H16V4H8V2H2V8H4V16H2V22H8V20H13.1C13 19.7 13 19.3 13 19M18 4H20V6H18V4M4 4H6V6H4V4M6 20H4V18H6V20M20 15V18H23V20H20V23H18V20H15V18H18V15H20Z',
      mdiVectorSquareEdit:
        'M22.7 14.4L21.7 15.4L19.6 13.3L20.6 12.3C20.8 12.1 21.2 12.1 21.4 12.3L22.7 13.6C22.9 13.8 22.9 14.1 22.7 14.4M13 19.9L19.1 13.8L21.2 15.9L15.1 22H13V19.9M11 19.9V19.1L11.6 18.5L12.1 18H8V16H6V8H8V6H16V8H18V12.1L19.1 11L19.3 10.8C19.5 10.6 19.8 10.4 20.1 10.3V8H22.1V2H16.1V4H8V2H2V8H4V16H2V22H8V20L11 19.9M18 4H20V6H18V4M4 4H6V6H4V4M6 20H4V18H6V20Z',
      mdiVectorSquareRemove:
        'M13 19C13 18.7 13 18.3 13.1 18H8V16H6V8H8V6H16V8H18V13.1C18.3 13 18.7 13 19 13C19.3 13 19.7 13 20 13.1V8H22V2H16V4H8V2H2V8H4V16H2V22H8V20H13.1C13 19.7 13 19.3 13 19M18 4H20V6H18V4M4 4H6V6H4V4M6 20H4V18H6V20M22.5 16.9L20.4 19L22.5 21.1L21.1 22.5L19 20.4L16.9 22.5L15.5 21.1L17.6 19L15.5 16.9L16.9 15.5L19 17.6L21.1 15.5L22.5 16.9Z',
      pressed: false,
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
    species: getSpecies,
    plantations: getPlantations,
  },
  computed: {
    toolHint() {
      switch (this.selectedDrawingTool) {
        case 'draw':
          return 'Cliquez pour dessiner'
        case 'edit':
          return 'Cliquez et glissez un coin ou un coté'
        case 'deleteVertex':
          return 'Cliquez sur un coin pour le supprimer'
        case 'move':
          return 'Sélectionnez une parcelle pour la déplacer'
        case 'delete':
          return 'Sélectionnez les parcelles a supprimer'
        case 'info':
          return 'Passez la sourris sur les parcelle et coté'
        case 'generateBed':
          return "Sélectionnez un coté d'une parcelle pour générer les planches"
        case 'plant':
          return this.selectedFeatures.length > 0
            ? null
            : 'Sélectionnez la parcelle sur la quelle vous voulez planter'
        default:
          return null
      }
    },
    selectedParcel() {
      const [feature] = this.selectedFeatures
      if (feature) {
        return this.garden.parcels.find(
          (parcel) => parcel.id === feature.getId()
        )
      } else {
        return null
      }
    },
    showEditGroup() {
      return ['edit', 'deleteVertex', 'move', 'delete'].includes(
        this.selectedDrawingTool
      )
    },
    nextBed() {
      return this.selectedParcel?.beds[this.bedRange[1]]
    },
    selectedSpeciesWithDefault: {
      get() {
        return this.selectedSpecies || this.species[0]
      },
      set(value) {
        this.selectedSpecies = value
      },
    },
    maxArea() {
      const [start] = this.bedRange
      if (!this.selectedParcel) return 0
      return this.selectedParcel.beds
        .slice(start)
        .reduce(
          (acc, { area, totalPlantedArea }) => acc + area - totalPlantedArea,
          0
        )
    },
    beds() {
      return this.garden.parcels.map((parcel) => parcel.beds).flat()
    },
    bedRange: {
      get() {
        if (!this.selectedParcel) return [0, 0]
        let area = this.selectedArea
        let end

        for (
          end = this.bedSelectionStart;
          end < this.selectedParcel.beds.length;
          end++
        ) {
          const { area: bedArea, totalPlantedArea } = this.selectedParcel.beds[
            end
          ]
          area -= bedArea - totalPlantedArea
          if (area < 0) {
            break
          }
        }

        return [this.bedSelectionStart, end]
      },
      set: throttle(
        function (range) {
          this.bedSelectionStart = range[0]
          this.selectedArea = this.getAreaFromRange(range)
        },
        100,
        { leading: false, trailing: true }
      ),
    },
    additionnalArea() {
      return this.selectedArea - this.getAreaFromRange(this.bedRange)
    },
  },
  watch: {
    selectedArea: 'updateAreaToAdd',
    bedSelectionStart: 'updateAreaToAdd',
    selectedParcel(parcel, oldParcel) {
      if (oldParcel) {
        for (const bed of oldParcel.beds) {
          bed.areaToAdd = 0
        }
      }
      this.mapFit = null
      if (!parcel) return

      this.bedRange = [0, parcel.beds.length]
      this.selectedArea = this.maxArea
      this.updateAreaToAdd()
    },
    selectedFeatures(value) {
      const extent = this.selectedFeatures.reduce(
        (acc, feature) => extend(acc, feature.getGeometry().getExtent()),
        createEmpty()
      )
      this.$nextTick().then(() => {
        this.mapFit = extent
      })
    },
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
    fitParcel({ id }) {
      this.mapFit = this.$refs.parcelLayer.vector
        .getFeatureById(id)
        .getGeometry()
        .getExtent()
    },
    updatePlantation() {
      this.selectedFeatures = []
    },
    updateAreaToAdd() {
      let area = this.selectedArea
      for (let i = 0; i < this.selectedParcel.beds.length; i++) {
        const bed = this.selectedParcel.beds[i]

        if (i < this.bedSelectionStart) {
          bed.areaToAdd = 0
          continue
        }

        const areaToAdd = bed.area - bed.totalPlantedArea
        area -= areaToAdd
        if (area < 0) {
          bed.areaToAdd = 0
        } else {
          bed.areaToAdd = areaToAdd
        }
      }
    },
    getAreaFromRange([start, end]) {
      return this.selectedParcel?.beds
        .slice(start, end)
        .reduce(
          (acc, { area, totalPlantedArea }) => acc + area - totalPlantedArea,
          0
        )
    },
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
  beforeRouteLeave(_from, _to, next) {
    this.syncParcels = false
    next()
  },
}
</script>

<style scoped>
.snap-guides-control {
  left: 0.5em;
  bottom: 0.5em;
  width: fit-content;
}
.toolbar {
  width: fit-content;
  right: 0;
}
#plantation-card {
  position: absolute;
  top: 0.5em;
  right: 0.5em;
  z-index: 1;
}
</style>
