<template>
  <prop-manager @add="add" @remove="remove">
    <slot />
  </prop-manager>
</template>
<script>
export default {
  name: 'StyleListSlotWrapper',
  props: {
    value: {
      type: Array,
      required: true,
    },
  },
  methods: {
    add(styleToAdd) {
      this.$emit('input', [...this.value, styleToAdd])
    },
    remove(styleToRemove) {
      const newVal = this.value.filter((style) => style !== styleToRemove)

      this.$emit('input', newVal)
    },
  },
}
</script>

<style></style>
