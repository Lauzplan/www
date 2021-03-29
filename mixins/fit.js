import { isEmpty, createEmpty } from 'ol/extent'

export default {
  inject: ['getMapInstance', 'getSourceInstance'],
  data() {
    return {
      extentToFit: createEmpty(),
    }
  },
  mounted() {
    this.calculateExtent()
    this.getSourceInstance()
      .getFeaturesCollection()
      .on('change:length', () => {
        this.calculateExtent()
      })
  },
  methods: {
    fitToSource() {
      this.getMapInstance().getView().fit(this.extentToFit)
    },
    calculateExtent() {
      const sourceExtent = this.getSourceInstance().getExtent()
      const extent = !isEmpty(sourceExtent)
        ? sourceExtent
        : [
            42000.1053417176,
            19999.916642703116,
            296000.1053417176,
            167999.91664270312,
          ]

      for (let i = 0; i < 4; i++) {
        this.extentToFit[i] = extent[i]
      }
    },
  },
}
