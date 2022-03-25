<template>
  <div><slot v-if="interaction" /></div>
</template>

<script>
import { Draw } from 'ol/interaction'
import { fromOpenLayerEvent } from '~/utils/obesravble'
export default {
  name: 'DrawInteraction',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
    type: {
      type: String,
      required: true,
    },
    features: {
      type: Array,
      default: () => [],
    },
    active: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      interaction: null,
      eventToEmit: ['drawabort', 'drawend', 'drawstart'],
    }
  },
  inject: ['getMapInstance', 'getFeatures', 'getSourceInstance'],
  watch: {
    options: {
      handler(val) {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }

        this.interaction = new Draw({
          source: this.getSourceInstance(),
          type: this.type,
          ...val,
        })

        map.addInteraction(this.interaction)
        this.interaction.setActive(this.active)
        this.$subscribeTo(
          fromOpenLayerEvent(this.interaction, 'change:active'),
          () => {
            this.$emit('update:active', this.interaction.getActive())
          }
        )
      },
      deep: true,
      immediate: true,
    },
    interaction: {
      handler(value, oldValue) {
        if (oldValue) {
          for (const event of this.eventToEmit) {
            oldValue.un(event, this.handleEvent)
          }
        }
        if (value) {
          for (const event of this.eventToEmit) {
            value.on(event, this.handleEvent)
          }
        }
      },
      immediate: true,
    },
    active: {
      handler(value) {
        this.interaction.setActive(value)
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    map.removeInteraction(this.interaction)
    for (const event of this.eventToEmit) {
      this.interaction.un(event, this.handleEvent)
    }
  },
  methods: {
    handleEvent({ type, ...rest }) {
      this.$emit(type, rest)
    },
  },
}
</script>

<style></style>
