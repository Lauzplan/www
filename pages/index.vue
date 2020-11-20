<template>
  <div justify="center" align="center">
    <h1>Bienvenue sur Lauzplan</h1>
    <h2>Ceci est une manifique landing page</h2>

    <nuxt-link :to="'dashboard'">Accéder a l'application</nuxt-link>
  </div>
</template>

<script>
export default {
  components: {},
  methods: {
    logout() {
      this.$auth.logout({
        returnTo: 'http://localhost:3000',
      })
    },
    async isAuth() {
      const a = await this.$auth.isAuthenticated()
      console.log(a)
      return a
    },
  },
  layout: 'empty',
  auth: false,
}
</script>
