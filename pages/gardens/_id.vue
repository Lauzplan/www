<template>
  <nuxt-child keep-alive />
</template>

<script>
import gql from 'graphql-tag'

export default {
  data() {
    return { currentTab: 'gardens-id-dashboard' }
  },
  watch: {
    $route: {
      handler(to) {
        if (!this._inactive && to.name !== 'gardens-id') {
          this.currentTab = to.name
        }
        this.$apollo.mutate({
          mutation: gql`
            mutation selectGarden($garden: GardenType) {
              selectGarden(garden: $garden) @client
            }
          `,
          variables: {
            garden: { id: to.params.id },
          },
        })
      },
      immediate: true,
    },
  },
  activated() {
    this.$router.push({ ...this.$route, name: this.currentTab })
  },
  layout: 'gardens',
}
</script>

<style></style>
