<template>
  <control>
    <div class="delete-control">
      <v-card class="delete-control-card">
        <v-card-text>
          Supprimer les parcelles selectionnées ? ({{ features.length }})
          <v-btn outlined rounded text @click="deleteFeatures">Supprimer</v-btn>
        </v-card-text>
      </v-card>
    </div>
  </control>
</template>
<script>
import VectorLayer from 'ol/layer/Vector'
export default {
  name: 'DeleteFeatures',
  props: {
    features: {
      type: Array,
      required: true,
    },
    layers: {
      type: Function,
      default: () => () => true,
    },
  },
  inject: ['getMapInstance'],
  methods: {
    deleteFeatures() {
      const layers = this.getMapInstance()
        .getLayers()
        .getArray()
        .filter((layer) => layer instanceof VectorLayer)
        .filter(this.layers)

      for (const layer of layers) {
        for (const feature of this.features) {
          layer.getSource().getFeaturesCollection().remove(feature)
        }
      }
    },
  },
}
</script>

<style>
.delete-control {
  position: absolute;
  bottom: 0.5em;
  width: 100%;
}
.delete-control > .v-card {
  width: fit-content;
  margin: auto;
}
</style>
