<template>
  <ApolloMutation
    :mutation="
      (gql) => gql`
        mutation selectGarden($garden: GardenType!) {
          selectGarden(garden: $garden) @client
        }
      `
    "
  >
    <template v-slot="{ mutate, error }">
      <v-menu v-model="menu" offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-list-item class="px-2" v-bind="attrs" v-on="on">
            <v-list-item-avatar>
              <v-avatar color="grey lighten-1">
                <span class="white--text headline">{{
                  value.name[0].toUpperCase()
                }}</span>
              </v-avatar>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title class="title">
                {{ value.name }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-icon>
              <v-icon>mdi-swap-horizontal</v-icon>
            </v-list-item-icon>
            <div v-if="error" class="error apollo">An error occurred</div>
          </v-list-item>
        </template>
        <v-list nav>
          <v-list-item-group
            :value="gardens.findIndex((g) => g.id == value.id)"
            color="primary"
          >
            <v-list-item
              v-for="garden in gardens"
              :key="garden.id"
              @click="mutate({ variables: { garden } })"
            >
              <v-list-item-title>{{ garden.name }}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
        <v-btn left block elevation="0" tile color="success">
          <v-icon>mdi-plus</v-icon>
          Créer
        </v-btn>
      </v-menu>
    </template>
  </ApolloMutation>
</template>

<script>
export default {
  name: 'GardenSelector',
  props: {
    gardens: {
      type: Array,
      required: true,
    },
    value: {
      type: Object,
      required: true,
    },
  },
  data(vm) {
    return {
      menu: false,
    }
  },
}
</script>

<style></style>
