import { DateTime } from 'luxon'

export default {
  props: {
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      menu: false,
      innerValue: null,
    }
  },
  watch: {
    value: {
      handler(value) {
        if (!value) {
          this.innerValue = DateTime.now()
          this.$emit('input', this.innerValue.toISO())
        } else {
          this.innerValue = DateTime.fromISO(value)
        }
      },
      immediate: true,
    },
    innerValue(value) {
      this.$emit('input', value.toISO())
    },
  },
}
