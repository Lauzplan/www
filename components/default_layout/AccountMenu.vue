<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-icon>mdi-account</v-icon>
      </v-btn>
    </template>
    <v-list>
      <v-list-item class="text-center">
        <v-list-item-title>{{ user.name }}</v-list-item-title>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item to="user-settings">
        <v-list-item-icon>
          <v-icon>mdi-cog</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Settings</v-list-item-title>
      </v-list-item>
      <v-list-item @click="logout">
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
  data() {
    return { user: {} }
  },
  async mounted() {
    this.user = await this.$auth.getUser()
  },
  methods: {
    logout() {
      this.$auth.logout({ returnTo: this.$config.baseURL })
    },
  },
}
</script>

<style></style>
