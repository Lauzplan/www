<script>
import { Control } from 'ol/control'
export default {
  name: 'Control',
  props: {
    target: {
      type: HTMLDivElement,
      required: false,
      default: null,
    },
  },
  inject: ['getMapInstance'],
  data() {
    return {
      control: null,
    }
  },
  watch: {
    target(value) {
      this.control.setTarget(value)
    },
  },
  mounted() {
    this.control = new Control({
      element: this.$el,
      target: this.target,
    })
    this.getMapInstance().addControl(this.control)
  },
  beforeDestroy() {
    this.getMapInstance().removeControl(this.control)
  },
  render() {
    return this.$slots.default
  },
}
</script>

<style></style>
