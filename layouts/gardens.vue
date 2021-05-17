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
      <template v-slot="{ result: { data, error } }">
        <v-navigation-drawer
          v-if="data"
          id="navigation-drawer"
          v-model="drawer"
          :mini-variant.sync="mini"
          permanent
          app
        >
          <v-btn
            v-if="!mini"
            class="close-btn rounded-l-xl"
            absolute
            x-small
            fab
            @click="mini = true"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <v-list>
            <garden-selector
              :value="data.me.preferences.selectedGarden"
              :gardens="data.gardens"
            />
            <v-divider></v-divider>
            <v-list-item-group>
              <v-list-item
                v-for="(item, i) in items"
                :key="i"
                :to="{ name: item.to }"
                exact
                nuxt
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
        <v-main v-if="data">
          <v-container>
            {{ error }}
            <nuxt keep-alive />
          </v-container>
        </v-main>
      </template>
    </ApolloQuery>
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
          to: 'gardens-id-dashboard',
        },
        {
          title: 'Parcelles',
          icon: 'mdi-map',
          to: 'gardens-id-parcels',
        },
        {
          title: 'Planning',
          icon: 'mdi-calendar-text',
          to: 'gardens-id-planning',
        },
      ],
      title: 'Lauzplan',
      gadenMenu: false,
      mini: true,
      drawer: true,
    }
  },
}
</script>
<style>
.close-btn {
  bottom: 20px;
  right: 0px;
  border-radius: 0;
}
</style>
