<script>
import Text from 'ol/style/Text'
import mixinMaker from './mixin'

export default {
  name: 'TextStyle',
  mixins: [
    mixinMaker(Text, [
      { name: 'font', hasSetter: true, type: String },
      { name: 'maxAngle', hasSetter: true, type: Number },
      { name: 'offsetX', hasSetter: true, type: Number },
      { name: 'offsetY', hasSetter: true, type: Number },
      { name: 'overflow', hasSetter: true, type: Boolean },
      { name: 'placement', hasSetter: true, type: String },
      { name: 'scale', hasSetter: true, type: [Number, Array] },
      { name: 'rotateWithView', hasSetter: true, type: Boolean },
      { name: 'rotation', hasSetter: true, type: Number },
      { name: 'text', hasSetter: true, slot: 'default' },
      { name: 'textAlign', hasSetter: true, type: String },
      { name: 'textBaseline', hasSetter: true, type: String },
      { name: 'fill', hasSetter: true, slot: true },
      { name: 'stroke', hasSetter: true, slot: true },
      { name: 'backgroundFill', hasSetter: true, slot: true },
      { name: 'backgroundStroke', hasSetter: true, slot: true },
      { name: 'padding', hasSetter: true, type: Array },
    ]),
  ],
  mounted() {
    this.text = this.$el.textContent
    this.$el.addEventListener('DOMCharacterDataModified', () => {
      this.text = this.$el.textContent
    })
  },
}
</script>

<style></style>
