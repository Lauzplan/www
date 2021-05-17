<script>
export default {
  async mounted() {
    try {
      const { appState } = await this.$auth.handleRedirectCallback()
      this.$router.replace(appState)
    } catch {
      this.$router.replace('/')
    }
  },
  render() {
    return null
  },
  auth: false,
  layout: 'empty',
}
</script>
