<template>
  <v-app>
    <ApolloQuery
      :query="
        (gql) =>
          gql`
            query getGardens {
              gardens {
                name
                id
              }
              me {
                id
                username
                preferences @client {
                  selectedGarden {
                    name
                    id
                  }
                }
              }
            }
          `
      "
    >
      <template v-slot="{ result: { error, data } }">
        {{ error }}
        <v-navigation-drawer
          v-if="data"
          id="mainDrawer"
          :mini-variant.sync="miniVariant"
          app
          permanent
          expand-on-hover
        >
          <v-list>
            <garden-selector
              v-model="data.me.preferences.selectedGarden"
              :gardens="data.gardens"
            />

            <v-divider></v-divider>
            <v-list-item-group>
              <v-list-item
                v-for="(item, i) in items"
                :key="i"
                :to="item.to"
                router
                exact
              >
                <v-list-item-action>
                  <v-icon>{{ item.icon }}</v-icon>
                </v-list-item-action>
                <v-list-item-content>
                  <v-list-item-title v-text="item.title" />
                </v-list-item-content>
              </v-list-item>
            </v-list-item-group>
          </v-list>
        </v-navigation-drawer>
        <v-app-bar v-if="data" app>
          <v-toolbar-title>
            <garden-name-editor :garden="data.me.preferences.selectedGarden" />
          </v-toolbar-title>
          <v-spacer />
          <account-menu :me="data.me" />
        </v-app-bar>
      </template>
    </ApolloQuery>
    <v-main>
      <v-container>
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AccountMenu from '~/components/default_layout/AccountMenu.vue'
import GardenNameEditor from '~/components/default_layout/GardenNameEditor.vue'
import GardenSelector from '~/components/default_layout/GardenSelector.vue'
export default {
  components: {
    AccountMenu,
    GardenNameEditor,
    GardenSelector,
  },
  data() {
    return {
      items: [
        {
          title: 'Dashboard',
          icon: 'mdi-view-dashboard',
          to: 'dashboard',
        },
        {
          title: 'Parcelles',
          icon: 'mdi-map',
          to: 'parcels',
        },
        {
          title: 'Planning',
          icon: 'mdi-calendar-text',
          to: 'planning',
        },
      ],
      miniVariant: true,
      title: 'Lauzplan',
      gadenMenu: false,
      selectedItem: 1,
    }
  },
}
</script>
<style></style>
