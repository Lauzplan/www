<template>
  <v-menu v-if="routes.length > 0" eager>
    <template v-slot:activator="{ on, attrs }">
      <v-list-item class="px-2" v-bind="attrs" v-on="on">
        <slot v-if="currentRoute" :route="currentRoute">
          {{ currentRoute.title }}
        </slot>
      </v-list-item>
    </template>
    <slot name="prepend"></slot>
    <v-list nav z-index="8">
      <v-list-item-group color="primary" exact>
        <v-list-item
          v-for="route in routes"
          ref="items"
          :key="route.title"
          :to="route.to"
          :value="route"
        >
          <v-list-item-title>{{ route.title }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <slot name="append" />
  </v-menu>
</template>

<script>
export default {
  name: 'NavMenu',
  props: {
    routes: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      currentRoute: null,
    }
  },
  watch: {
    $route: {
      handler: 'updateRoute',
      immediate: true,
      deep: true,
    },
    routes: {
      handler: 'updateRoute',
      deep: true,
    },
  },
  mounted() {
    this.updateRoute()
  },
  methods: {
    async updateRoute() {
      await this.$nextTick()
      const items = this.$refs.items

      if (!items) return

      const index = items.findIndex((i) =>
        i.$el.classList.contains('v-item--active')
      )
      if (index < 0) return
      this.currentRoute = this.routes[index]
    },
  },
}
</script>

<style></style>
