<template>
  <div v-if="style"><slot /></div>
</template>

<script>
import Style from 'ol/style/Style'
export default {
  name: 'FeatureStyleApplier',
  props: {
    feature: {
      type: Object,
      required: true,
    },
  },
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
    this.feature.setStyle(this.style)
  },
  beforeDestroy() {
    this.feature.setStyle(undefined)
  },
}
</script>

<style></style>
