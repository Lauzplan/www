<template>
  <v-app>
    <v-app-bar app>
      <v-toolbar-title> {{ title }} </v-toolbar-title>
      <v-spacer />
      <account-menu />
    </v-app-bar>
    <v-main>
      <v-container
        class="fill-height d-flex justify-center align-center mb-6"
        fluid
      >
        <nuxt />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AccountMenu from '~/components/default_layout/AccountMenu.vue'
export default {
  components: {
    AccountMenu,
  },
  data() {
    return {
      title: 'Lauzplan',
    }
  },
}
</script>
<style></style>
