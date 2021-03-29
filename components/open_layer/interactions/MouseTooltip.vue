<template>
  <div>
    <overlay
      v-if="show"
      :offset="overlayOffset"
      :positioning="'bottom-center'"
      :position="coordinate"
    >
      <slot :coordinate="coordinate" />
    </overlay>
  </div>
</template>

<script>
import { fromEvent, merge } from 'rxjs'
import { mapTo, pluck } from 'rxjs/operators'
import PointerInteraction from 'ol/interaction/Pointer'
import Overlay from '../Overlay.vue'

export default {
  name: 'MouseTooltip',
  components: { Overlay },
  inject: ['getMapInstance', 'getControlInstance'],
  provide() {
    return {
      getOverlayInstance: () => this.tooltip,
    }
  },
  data() {
    return {
      show: false,
      coordinate: [0, 0],
      overlayOffset: [0, -10],
      interaction: null,
    }
  },
  observableMethods: {
    handleMoveEvent: 'handleMoveEvent$',
  },
  mounted() {
    this.interaction = new PointerInteraction({
      handleMoveEvent: this.handleMoveEvent,
    })

    this.$nextTick().then(() => {
      this.interaction.setActive(this.getControlInstance().getActive())
      this.getMapInstance().addInteraction(this.interaction)
      this.getControlInstance().setInteraction(this.interaction)
    })
  },
  beforeDestroy() {
    this.getMapInstance().removeInteraction(this.interaction)
  },
  subscriptions() {
    const coordinate = this.handleMoveEvent$.pipe(pluck('coordinate'))

    return {
      show: merge(
        this.handleMoveEvent$.pipe(mapTo(true)),
        fromEvent(this.getMapInstance().getTargetElement(), 'mouseout').pipe(
          mapTo(false)
        )
      ),
      coordinate,
    }
  },
}
</script>

<style></style>
