<script>
import { createDefaultStyle } from 'ol/style/Style'
export default {
  name: 'DefaultStyle',
  data() {
    return { styles: createDefaultStyle() }
  },
  mounted() {
    for (const style of this.styles) {
      this.$parent.$emit('add', style)
    }
  },
  beforeDestroy() {
    for (const style of this.styles) {
      this.$parent.$emit('remove', style)
    }
  },
  render() {
    return null
  },
}
</script>

<style></style>
