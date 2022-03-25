<template>
  <v-tooltip bottom open-delay="100">
    <template v-slot:activator="{ on, attrs }">
      <ApolloMutation
        :mutation="require('../../graphql/updateGarden.gql')"
        :variables="{
          id: garden.id,
          gardenName: innerName,
        }"
      >
        <template v-slot="{ mutate, loading, error }">
          <v-text-field
            v-model="innerName"
            v-bind="attrs"
            :loading="loading"
            :hide-details="!error"
            :error-messages="error ? 'Impossible de sauver le nom' : ''"
            v-on="on"
            @keydown.enter="save(mutate)"
            @blur="save(mutate)"
          ></v-text-field>
        </template>
      </ApolloMutation>
    </template>
    <span>Renommer</span>
  </v-tooltip>
</template>

<script>
export default {
  name: 'GardenNameEditor',
  props: {
    garden: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      innerName: null,
    }
  },
  watch: {
    garden: {
      handler(newVal) {
        this.innerName = newVal.name
      },
      immediate: true,
    },
  },
  methods: {
    save(mutate) {
      if (this.innerName !== this.garden.name) mutate()
    },
  },
}
</script>

<style></style>
