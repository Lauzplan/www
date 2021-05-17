<script>
import gardensIdsWithPreferences from '@/graphql/gardensIdsWithPreferences.gql'

export default {
  render() {
    return null
  },
  async middleware({ app, redirect }) {
    const client = app.apolloProvider.defaultClient
    const { data } = await client.query({
      query: gardensIdsWithPreferences,
    })
    let id = data.me.preferences?.selectedGarden?.id
    if (data.gardens.length === 0) {
      return redirect('/no-garden')
    }
    if (!id) id = data.gardens[0].id
    return redirect({
      name: 'gardens-id',
      params: { id },
    })
  },
}
</script>
