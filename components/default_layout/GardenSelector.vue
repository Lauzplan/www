<template>
  <nav-menu :routes="routes">
    <template #default="{ route }">
      <v-list-item-avatar>
        <v-avatar data-testid="avatar" color="grey lighten-1">
          <span class="white--text headline">{{ route.title | initials }}</span>
        </v-avatar>
      </v-list-item-avatar>
      <v-list-item-content>
        <v-list-item-title class="title">
          {{ route.title }}
        </v-list-item-title>
      </v-list-item-content>
      <v-list-item-icon>
        <v-icon>mdi-swap-horizontal</v-icon>
      </v-list-item-icon>
    </template>
    <template #append>
      <v-btn left block elevation="0" tile color="success" @click="create">
        <v-icon>mdi-plus</v-icon>
        Créer
      </v-btn>
    </template>
  </nav-menu>
</template>

<script>
import createGarden from '@/mixins/create_garden.js'
import NavMenu from '@/components/NavMenu.vue'

export default {
  name: 'GardenSelector',
  components: { NavMenu },
  filters: {
    initials(value) {
      if (!value || typeof value !== 'string') return ''
      const splitValue = value.split(' ')
      return `${splitValue[0]?.[0]}${splitValue[1]?.[0] || ''}`.toUpperCase()
    },
  },
  mixins: [createGarden],
  props: {
    gardens: {
      type: Array,
      required: true,
    },
  },
  computed: {
    routes() {
      return this.gardens.map((garden) => ({
        title: garden.name,
        to: { name: 'gardens-id', params: { id: garden.id } },
      }))
    },
  },
}
</script>

<style></style>
