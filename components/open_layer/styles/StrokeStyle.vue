<script>
import Stroke from 'ol/style/Stroke'
import mixinMaker from './mixin'

export default {
  name: 'StrokeStyle',
  mixins: [
    mixinMaker(Stroke, [
      { name: 'color', hasStter: true, type: [Array, String] },
      { name: 'lineCap', hasStter: true, type: String },
      { name: 'lineJoin', hasStter: true, type: String },
      { name: 'lineDash', hasStter: true, type: Array },
      { name: 'lineDashOffset', hasStter: true, type: Number },
      { name: 'miterLimit', hasStter: true, type: Number },
      { name: 'width', hasStter: true, type: Number },
    ]),
  ],
}
</script>

<style></style>
