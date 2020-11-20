<template>
  <ApolloMutation
    :mutation="
      (gql) => gql`
        mutation updateGarden($id: ID!, $gardenName: String!) {
          updateGarden(id: $id, name: $gardenName) {
            garden {
              id
              name
            }
          }
        }
      `
    "
  >
    <template v-slot="{ mutate }">
      <v-tooltip bottom open-delay="100">
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-model="innerName"
            v-bind="attrs"
            hide-details
            v-on="on"
            @blur="
              mutate({
                variables: {
                  id: garden.id,
                  gardenName: innerName,
                },
              })
            "
          ></v-text-field>
        </template>
        <span>Renommer</span>
      </v-tooltip>
    </template>
  </ApolloMutation>
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
  data(vm) {
    return {
      innerName: vm.garden.name,
    }
  },
  watch: {
    garden(newVal) {
      this.innerName = newVal.name
    },
  },
}
</script>

<style></style>
