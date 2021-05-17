<template>
  <div><slot v-if="projection" /></div>
</template>

<script>
export default {
  props: {
    code: {
      type: String,
      required: true,
    },
    proj4def: {
      type: String,
      required: true,
    },
    extent: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      projection: null,
    }
  },
}
</script>

<style></style>
