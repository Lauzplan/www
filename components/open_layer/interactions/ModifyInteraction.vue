<template>
  <div v-if="interaction">
    <slot />
    <style-list-slot-wrapper v-model="pointerStyle">
      <slot name="pointerStyle" />
    </style-list-slot-wrapper>
  </div>
</template>

<script>
import { Modify } from 'ol/interaction'

import StyleListSlotWrapper from '../StyleListSlotWrapper.vue'
import interaction from './mixin'

export default {
  name: 'ModifyInteraction',
  components: { StyleListSlotWrapper },
  mixins: [interaction],
  inject: ['getSourceInstance'],
  data() {
    return { pointerStyle: [] }
  },
  watch: {
    pointerStyle: 'renderInteraction',
    $attrs: 'renderInteraction',
  },
  mounted() {
    this.renderInteraction()
  },
  methods: {
    renderInteraction() {
      if (this.interaction) {
        this.map.removeInteraction(this.interaction)
      }
      this.interaction = new Modify({
        source: this.getSourceInstance(),
        deleteCondition: this.$attrs['delete-condition'],
        insertVertexCondition: this.$attrs['insert-vertex-condition'],
        condition: this.$attrs.condition,
        style: this.pointerStyle.length > 0 ? this.pointerStyle : undefined,
      })

      this.map.addInteraction(this.interaction)
      this.interaction.setActive(this.active)
    },
  },
}
</script>

<style></style>
