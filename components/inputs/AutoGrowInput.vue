<template>
  <span role="input" contenteditable></span>
</template>

<script>
export default {
  name: 'AutoGrowInput',
  props: {
    value: {
      type: String,
      required: false,
      default: '',
    },
  },
  watch: {
    value: 'setText',
  },
  mounted() {
    this.setText(this.value)
    this.$el.addEventListener('focus', ({ target }) => {
      if (document.body.createTextRange) {
        const range = document.body.createTextRange()
        range.moveToElementText(target)
        range.select()
      } else if (window.getSelection) {
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(target)
        selection.removeAllRanges()
        selection.addRange(range)
      }
    })
    this.$el.addEventListener('keyup', ({ keyCode, target }) => {
      const text = target.textContent.replace(/\n/g, '')
      if (keyCode === 13) {
        target.textContent = text
        target.blur()
        this.$emit('validate', text)
      }
      this.$emit('input', text)
    })
  },
  methods: {
    setText(text) {
      this.$el.textContent = text.replace(/\n/g, '') || ''
    },
  },
}
</script>

<style></style>
