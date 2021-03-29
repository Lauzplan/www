<template>
  <div>
    <slot />
  </div>
</template>

<script>
import { length } from '~/utils/vectors'
export default {
  name: 'SnapGuide',
  props: {
    vector: {
      type: Array,
      required: true,
    },
  },
  inject: ['getInteraction'],
  data() {
    return {
      guide: null,
    }
  },
  watch: {
    vector: {
      immediate: true,
      handler(val) {
        if (!val) return
        if (this.guide) this.remove()
        this.$nextTick().then(() => {
          const interaction = this.getInteraction()
          if (!interaction || length(val) === 0) return
          this.guide = interaction.addGuide(val)
        })
      },
    },
  },
  beforeDestroy() {
    this.remove()
  },
  methods: {
    remove() {
      this.getInteraction().clearGuides(this.guide)
    },
  },
}
</script>

<style></style>
