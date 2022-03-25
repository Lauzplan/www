import Vue from 'vue'

export default Vue.extend({
  props: {
    active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return { interaction: null }
  },
  inject: ['getMapInstance'],
  computed: {
    map() {
      return this.getMapInstance()
    },
  },
  watch: {
    active: {
      handler(value) {
        this.interaction?.setActive(value)
      },
      immediate: true,
    },
  },
  mounted() {
    this.interaction?.setActive(this.active)
  },
  beforeDestroy() {
    if (this.interaction) this.map?.removeInteraction(this.interaction)
  },
})
