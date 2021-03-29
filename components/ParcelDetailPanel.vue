<template>
  <v-expansion-panel>
    <v-expansion-panel-header> {{ parcel.name }}</v-expansion-panel-header>
    <v-expansion-panel-content>
      <v-progress-linear
        v-if="$apollo.queries.parceldetails.loading"
        indeterminate
      ></v-progress-linear>
      <!-- <div v-else-if="querryError" class="error apollo">An error occurred</div> -->
      <div v-else-if="parceldetails" class="result apollo">
        <v-row>
          <v-col>Aire total: {{ parceldetails.area }}m<sup>2</sup></v-col>
        </v-row>
        <v-row>
          <v-col
            >Aire cultivable: {{ parceldetails.cultivableArea }}m<sup
              >2</sup
            ></v-col
          >
        </v-row>
        <v-row>
          <v-col>Nombre de Planche: {{ parcel.bedSet.length }}</v-col>
        </v-row>
        <v-row>
          <v-col><b>Type de sols:</b></v-col>
        </v-row>
        <v-row v-for="type in parceldetails.soilType" :key="type.code">
          <v-col>
            {{ type.description }}:
            {{ Math.round(type.proportion * 100 * 100) / 100 }}%</v-col
          >
        </v-row>
      </div>
    </v-expansion-panel-content>
  </v-expansion-panel>
</template>

<script>
import { getParcelDetails } from '~/graphql/parcel.gql'

export default {
  props: {
    parcel: {
      type: Object,
      required: true,
    },
  },
  computed: {
    getParcelDetails() {
      return getParcelDetails
    },
  },
  watch: {
    parcel: {
      handler(val) {
        this.$apollo.queries.parceldetails.refetch()
      },
      deep: true,
    },
  },
  apollo: {
    parceldetails: {
      query: getParcelDetails,
      variables() {
        return {
          id: this.parcel.id,
        }
      },
    },
  },
}
</script>

<style></style>
