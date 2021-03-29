<template>
  <div v-if="style"><slot /></div>
</template>

<script>
import Style from 'ol/style/Style'
export default {
  name: 'FeatureStyle',
  inject: ['getFeatureInstance'],
  data() {
    return {
      style: new Style(),
    }
  },
  provide() {
    return {
      getStyleInstance: () => this.style,
    }
  },
  mounted() {
    this.getFeatureInstance().setStyle(this.style)
  },
  beforeDestroy() {
    this.getFeatureInstance().setStyle(undefined)
  },
}
</script>

<style></style>
