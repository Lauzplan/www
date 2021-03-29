<template>
  <v-btn
    color="success"
    :disabled="disabled"
    rounded
    @click="$refs.uploader.click()"
  >
    <v-icon left>{{ icon }}</v-icon>
    {{ label }}
    <input ref="uploader" type="file" hidden="true" @change="fileChanged" />
  </v-btn>
</template>

<script>
export default {
  name: 'ImportButton',
  props: {
    label: {
      type: String,
      default: 'Import',
      required: false,
    },
    icon: {
      type: String,
      default: 'mdi-upload',
      required: false,
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    fileChanged(event) {
      this.$emit('fileSelected', event.target.files)
      this.$refs.uploader.value = ''
    },
  },
}
</script>

<style></style>
