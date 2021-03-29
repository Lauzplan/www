<template>
  <div><slot v-if="control" /></div>
</template>

<script>
import Toggle from 'ol-ext/control/Toggle'

export default {
  name: 'FeatureInfoControl',
  inject: ['getControlBarInstance'],
  props: {
    className: {
      type: String,
      required: false,
      default: undefined,
    },
    title: {
      type: String,
      requierd: false,
      default: undefined,
    },
    html: {
      type: String,
      requierd: false,
      default: undefined,
    },
    active: {
      type: Boolean,
      required: false,
    },
    disable: {
      type: Boolean,
      required: false,
    },
    autoActive: {
      type: Boolean,
      required: false,
    },
    onToggle: {
      type: Function,
      required: false,
      default: undefined,
    },
  },
  provide() {
    return {
      getControlInstance: () => this.control,
    }
  },
  data() {
    return { control: null }
  },
  watch: {
    active(value) {
      this.control.setActive(value)
    },
    disable(value) {
      this.control.setDisable(value)
    },
    html(value) {
      this.control.setHtml(value)
    },
    title(value) {
      this.control.setTitle(value)
    },
  },
  mounted() {
    this.control = new Toggle({
      className: this.className,
      title: this.title,
      html: this.html,
      active: this.active,
      disable: this.disable,
      autoActive: this.autoActive,
      onToggle: this.onToggle,
    })

    this.getControlBarInstance().addControl(this.control)
  },
  beforeDestroy() {
    this.getControlBarInstance().removeControl(this.control)
  },
}
</script>

<style></style>
