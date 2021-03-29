<template>
  <div v-if="overlay"><slot /></div>
</template>

<script>
import { Overlay } from 'ol'
export default {
  name: 'Overlay',
  inject: ['getMapInstance'],
  props: {
    offset: {
      type: Array,
      required: false,
      default: undefined,
      validator(val) {
        for (const x of val) {
          if (isNaN(x)) return false
        }
        return true
      },
    },
    position: {
      type: Array,
      required: false,
      default: undefined,
      validator(val) {
        for (const x of val) {
          if (isNaN(x)) return false
        }
        return true
      },
    },
    positioning: {
      type: String,
      required: true,
      validator(val) {
        return [
          'bottom-left',
          'bottom-center',
          'bottom-right',
          'center-left',
          'center-center',
          'center-right',
          'top-left',
          'top-center',
          'top-right',
        ].includes(val)
      },
    },
    insertFirst: {
      type: Boolean,
      required: false,
      default: undefined,
    },
    stopEvent: {
      type: Boolean,
      required: false,
      default: undefined,
    },
  },
  data() {
    return {
      overlay: null,
    }
  },
  watch: {
    offset(val) {
      this.overlay.setOffset(val)
    },
    position(val) {
      this.overlay.setPosition(val)
    },
    positioning(val) {
      this.overlay.setPositioning(val)
    },
  },
  mounted() {
    this.overlay = new Overlay({
      element: this.$el,
      offset: this.offset,
      position: this.position,
      positioning: this.positioning,
      insertFirst: this.insertFirst,
      stopEvent: this.stopEvent,
    })
    this.getMapInstance().addOverlay(this.overlay)
  },
  beforeDestroy() {
    this.getMapInstance().removeOverlay(this.overlay)
  },
}
</script>

<style></style>
