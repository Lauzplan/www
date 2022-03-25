<template>
  <overlay
    v-if="show"
    :offset="overlayOffset"
    :positioning="'bottom-center'"
    :position="coordinate"
  >
    <slot :coordinate="coordinate" :on="{ show: onShow }" />
    <slot name="hint">
      <v-fade-transition>
        <v-chip v-show="hint && showHint">{{ hint }}</v-chip>
      </v-fade-transition>
    </slot>
  </overlay>
</template>

<script>
import { combineLatest, fromEvent, merge } from 'rxjs'
import {
  debounceTime,
  distinctUntilChanged,
  map,
  mapTo,
  pluck,
  startWith,
} from 'rxjs/operators'
import PointerInteraction from 'ol/interaction/Pointer'
import Overlay from '../Overlay.vue'
import interaction from './mixin'

export default {
  name: 'MouseTooltip',
  components: { Overlay },
  mixins: [interaction],
  inject: ['getMapInstance'],
  provide() {
    return {
      getOverlayInstance: () => this.tooltip,
    }
  },
  props: {
    debounceTime: {
      type: Number,
      default: 500,
    },
    hint: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      show: false,
      coordinate: [0, 0],
      overlayOffset: [0, -20],
      interaction: null,
    }
  },
  observableMethods: {
    handleMoveEvent: 'handleMoveEvent$',
    onShow: 'show$',
  },
  mounted() {
    this.interaction = new PointerInteraction({
      handleMoveEvent: this.handleMoveEvent,
    })

    this.$nextTick().then(() => {
      this.interaction.setActive(this.active)
      this.getMapInstance().addInteraction(this.interaction)
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
      showHint: combineLatest([
        merge(
          this.handleMoveEvent$.pipe(mapTo(false)),
          this.handleMoveEvent$.pipe(
            mapTo(true),
            debounceTime(this.debounceTime)
          )
        ),
        this.show$.pipe(startWith(false)),
      ]).pipe(
        map(([mouseStoped, contentShow]) => !contentShow && mouseStoped),
        distinctUntilChanged()
      ),
      coordinate,
    }
  },
}
</script>

<style></style>
