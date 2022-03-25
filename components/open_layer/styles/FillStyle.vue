<script>
import Fill from 'ol/style/Fill'
import mixinMaker from './mixin'

export default {
  name: 'FillStyle',
  mixins: [
    mixinMaker(Fill, [
      { name: 'color', hasSetter: true, type: [Array, String] },
    ]),
  ],
}
</script>

<style></style>
