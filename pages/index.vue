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
  data() {
    return {
      selectedSpecies: null,
      selectedVariety: null,
      bedRange: [0, 1],
      species: [
        {
          id: 0,
          name: 'Carotte',
          varieties: [{ id: 0, name: 'Bello' }],
        },
      ],
      beds: [
        {
          id: 0,
          cutivableArea: 10,
        },
        {
          id: 1,
          cutivableArea: 10,
        },
        {
          id: 2,
          cutivableArea: 10,
        },
        {
          id: 3,
          cutivableArea: 10,
        },
        {
          id: 4,
          cutivableArea: 10,
        },
        {
          id: 5,
          cutivableArea: 10,
        },
        {
          id: 6,
          cutivableArea: 10,
        },
      ],
      area: 0,
    }
  },
}
</script>
