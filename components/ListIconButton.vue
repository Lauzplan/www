<template>
  <v-tooltip right :disabled="!tooltip" open-delay="200">
    <template v-slot:activator="{ on, attrs }">
      <v-list-item
        v-bind="{ ...attrs, ...$attrs }"
        v-on="{ ...$listeners, ...on }"
      >
        <v-icon><slot /></v-icon>
      </v-list-item>
    </template>
    {{ tooltip }}
  </v-tooltip>
</template>

<script>
export default {
  name: 'ListIconButton',
  props: {
    tooltip: { type: String, default: null },
  },
}
</script>

<style></style>
