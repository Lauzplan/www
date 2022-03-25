<template>
  <div><slot v-if="interaction" /></div>
</template>

<script>
import { Select } from 'ol/interaction'
import { Collection } from 'ol'
import Interaction from './mixin'

export default {
  name: 'SelectInteraction',
  mixins: [Interaction],
  props: {
    toggleCondition: {
      type: Function,
      default: undefined,
    },
    features: {
      type: Array,
      default: () => [],
    },
    layers: {
      type: [Array, Function],
      default: undefined,
    },
  },
  watch: {
    toggleCondition: 'renderInteraction',
    active(value) {
      if (!value) {
        this.interaction.getFeatures().clear()
      }
    },
  },
  mounted() {
    this.renderInteraction()
  },
  methods: {
    renderInteraction() {
      if (this.interaction) {
        this.map.removeInteraction(this.interaction)
      }
      this.interaction = new Select({
        features: new Collection(this.features),
        toggleCondition: this.toggleCondition,
        layers: this.layers,
      })

      this.interaction.setActive(this.active)
      this.interaction.on('select', () =>
        this.$emit('update:features', this.interaction.getFeatures().getArray())
      )

      this.map.addInteraction(this.interaction)
    },
  },
}
</script>

<style></style>
