<script>
import Circle from 'ol/style/Circle'

import mixinMaker from './mixin'

export default {
  name: 'CircleStyle',
  mixins: [
    mixinMaker(Circle, [
      { name: 'fill', hasSetter: false, slot: true },
      { name: 'radius', hasSetter: true, type: Number },
      { name: 'stroke', hasSetter: false, slot: true },
      { name: 'displacement', haseSetter: false, type: Array },
      { name: 'scale', hasSetter: true, type: [Number, Array] },
      { name: 'rotation', hasSetter: true, type: Number },
      { name: 'rotateWithView', hasSetter: true, type: Boolean },
    ]),
  ],
}
</script>

<style></style>
