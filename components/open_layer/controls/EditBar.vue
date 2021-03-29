<template>
  <div v-if="control"><slot /></div>
</template>

<script>
import EditBar from 'ol-ext/control/EditBar'
import 'ol-ext/dist/ol-ext.css'
import { Modify } from 'ol/interaction'

export default {
  name: 'EditBarControl',
  props: {
    options: {
      type: Object,
      default: () => {},
    },
  },
  provide() {
    return {
      getControlBarInstance: () => this.control,
    }
  },
  data() {
    return { control: null }
  },
  inject: ['getMapInstance', 'getSourceInstance'],
  watch: {
    options: {
      handler() {
        const map = this.getMapInstance()
        if (this.control) {
          map.removeControl(this.control)
        }
        const source = this.getSourceInstance()

        this.control = new EditBar({
          source,
          interactions: {
            Info: false,
            DrawPoint: false,
            DrawLine: false,
            DrawHole: false,
            DrawRegular: false,
            Split: false,
            Offset: false,
            ModifySelect: false,
          },
          ...this.options,
        })

        this.control
          .getInteraction('DrawPolygon')
          .on('change:active', ({ target }) => {
            this.$emit('changeDraw', target.getActive())
          })

        const modifyi = new Modify({
          features: this.control.getInteraction('Select').getFeatures(),
        })

        modifyi.on('modifystart', () => {
          this.$emit('changeModify', true)
        })
        modifyi.on('modifyend', () => {
          this.$emit('changeModify', false)
        })

        // needed to add the controls after default controls has been loaded
        this.$nextTick().then(() => {
          map.addControl(this.control)
          map.addInteraction(modifyi)
        })
      },
      deep: true,
      immediate: true,
    },
  },
  beforeDestroy() {
    const map = this.getMapInstance()
    map.removeControl(this.control)
  },
}
</script>

<style></style>
