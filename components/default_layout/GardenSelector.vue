<template>
  <v-menu :value="menu" offset-y @input="$emit('update:menu', $event)">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item class="px-2" v-bind="attrs" v-on="on">
        <v-list-item-avatar>
          <v-avatar color="grey lighten-1">
            <span class="white--text headline">{{
              innerValue.name[0].toUpperCase()
            }}</span>
          </v-avatar>
        </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title class="title">
            {{ innerValue.name }}
          </v-list-item-title>
        </v-list-item-content>
        <v-list-item-icon>
          <v-icon>mdi-swap-horizontal</v-icon>
        </v-list-item-icon>
      </v-list-item>
    </template>
    <v-list nav z-index="8">
      <v-list-item-group
        v-model="innerValue"
        mandatory
        color="primary"
        @change="$emit('input', $event)"
      >
        <v-list-item
          v-for="garden in gardens"
          :key="garden.id"
          :value="garden"
          :to="{ name: 'gardens-id', params: { id: garden.id } }"
        >
          <v-list-item-title>{{ garden.name }}</v-list-item-title>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-btn left block elevation="0" tile color="success" @click="create">
      <v-icon>mdi-plus</v-icon>
      Créer
    </v-btn>
  </v-menu>
</template>

<script>
import createGarden from '~/mixins/create_garden.js'

export default {
  name: 'GardenSelector',
  mixins: [createGarden],
  props: {
    gardens: {
      type: Array,
      required: true,
    },
    value: {
      type: Object,
      default: null,
    },
    menu: {
      type: Boolean,
      default: true,
    },
  },
  data(vm) {
    return {
      innerValue: vm.gardens[0],
    }
  },
  watch: {
    value: {
      handler(newVal) {
        if (newVal) {
          this.innerValue = this.gardens.find(
            (garden) => garden.id === newVal.id
          )
        } else {
          this.$emit('input', this.innerValue)
        }
      },
      immediate: true,
      deep: true,
    },
  },
}
</script>

<style></style>
