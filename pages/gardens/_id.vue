<template>
  <nuxt-child keep-alive />
</template>

<script>
import selectGarden from '@/graphql/selectGarden.gql'
export default {
  data() {
    return { currentTab: 'gardens-id-parcels', actif: true }
  },
  watch: {
    $route: {
      handler(to) {
        if (!this.actif) return
        this.currentTab = to.name
      },
      immediate: true,
    },
  },
  activated() {
    this.actif = true
    this.$router.push({ ...this.$route, name: this.currentTab })
  },
  deactivated() {
    this.actif = false
  },
  watchQuery: ['id'],
  async validate({ params, app }) {
    const client = app.apolloProvider.defaultClient

    try {
      await client.mutate({
        mutation: selectGarden,
        variables: {
          gardenId: params.id,
        },
      })
      return true
    } catch (e) {
      return false
    }
  },
  layout: 'gardens',
}
</script>

<style></style>
