import Vue from 'vue'
import PropManager from '../PropManager.vue'

export default function (Class, fields) {
  function setterName(fieldName) {
    return `set${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`
  }

  const data = fields
    .filter((f) => f.slot)
    .reduce((acc, f) => ({ ...acc, [f.name]: undefined }), {})

  const props = fields
    .filter((f) => !f.slot)
    .reduce(
      (acc, f) => ({ ...acc, [f.name]: { type: f.type, default: undefined } }),
      {}
    )

  return Vue.extend({
    components: { PropManager },
    inject: {
      getFeatureInstance: {
        from: 'getFeatureInstance',
        default: () => () => {},
      },
    },
    props,
    data() {
      return {
        style: null,
        ...data,
      }
    },
    watch: {
      ...fields.reduce(
        (acc, f) => ({
          ...acc,
          [f.name](value) {
            if (f.hasSetter) {
              this.style[setterName(f.name)](value)
              this.getFeatureInstance()?.changed()
            } else this.renderStyle()
          },
        }),
        {}
      ),
      style: {
        handler(value) {
          this.$parent.$emit('input', value)
        },
        immediate: true,
      },
    },
    mounted() {
      this.renderStyle()
    },
    beforeDestroy() {
      this.$parent.$emit('input', null)
    },
    methods: {
      renderStyle() {
        this.style = new Class({
          ...fields.reduce(
            (acc, f) => ({
              ...acc,
              [f.name]: this[f.name],
            }),
            {}
          ),
        })
      },
    },
    render(createElement) {
      const self = this

      return createElement(
        'div',
        {
          class: Class.name,
          domProps: {
            hidden: true,
          },
        },
        fields
          .filter((f) => f.slot)
          .map((f) =>
            createElement(
              PropManager,
              {
                on: {
                  input(value) {
                    self[f.name] = value
                  },
                },
              },
              [this.$slots[f.slot === true ? f.name : f.slot]]
            )
          )
      )
    },
  })
}
