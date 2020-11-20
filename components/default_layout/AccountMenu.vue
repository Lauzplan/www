<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item class="text-center">
        <v-list-item-title>{{ me.username }}</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item to="user-settings">
        <v-list-item-icon>
          <v-icon>mdi-cog</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item>
      <v-list-item
        @click="
          $auth.logout({
            returnTo: window.location.origin,
          })
        "
      >
        <v-list-item-icon>
          <v-icon>mdi-logout</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Déconnexion</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  name: 'AccountMenu',
  props: {
    me: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style></style>
