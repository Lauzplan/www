<script>
import Style from 'ol/style/Style'
import mixinMaker from './mixin'

export default {
  name: 'FeatureStyle',
  mixins: [
    mixinMaker(Style, [
      { name: 'fill', hasSetter: true, slot: true },
      { name: 'image', hasSetter: true, slot: true },
      { name: 'stroke', hasSetter: true, slot: true },
      { name: 'text', hasSetter: true, slot: true },
      { name: 'geometry', hasSetter: true, slot: true },
    ]),
  ],
  watch: {
    style: {
      handler(value, oldValue) {
        if (oldValue) this.$parent.$emit('remove', oldValue)
        if (value) this.$parent.$emit('add', value)
      },
      immediate: true,
    },
  },
  beforeDestroy() {
    this.$parent.$emit('remove', this.style)
  },
}
</script>

<style></style>
