<script>
export default {
  async mounted() {
    if ('code' in this.$route.query && 'state' in this.$route.query) {
      try {
        const { appState } = await this.$auth.handleRedirectCallback()
        this.$router.push(appState)
      } catch {
        this.$router.push('/')
      }
    } else {
      this.$router.push('/')
    }
  },
  render() {
    return null
  },
  auth: false,
  layout: 'empty',
}
</script>
