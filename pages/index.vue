<template>
  <div justify="center" align="center">
    <h1>Bienvenue sur Lauzplan</h1>
    <h2>Ceci est une manifique landing page</h2>

    <nuxt-link :to="'gardens'">Accéder a l'application</nuxt-link>
  </div>
</template>

<script>
export default {
  components: {},
  layout: 'empty',
  auth: false,
}
</script>
