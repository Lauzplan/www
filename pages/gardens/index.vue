<script>
import gql from 'graphql-tag'

export default {
  async middleware({ app, redirect }) {
    const client = app.apolloProvider.defaultClient
    const { data } = await client.query({
      query: gql`
        query getGardenIds {
          gardens {
            id
          }
          me {
            id
            preferences @client {
              selectedGarden {
                id
              }
            }
          }
        }
      `,
    })
    const selectedGarden = data.me.preferences.selectedGarden
    if (data.gardens.length === 0) {
      return redirect('/no-garden')
    } else if (
      selectedGarden &&
      data.gardens.find((g) => g.id === selectedGarden)
    ) {
      redirect({
        name: 'gardens-id',
        params: { id: selectedGarden.id },
      })
    } else {
      redirect({
        name: 'gardens-id',
        params: { id: data.gardens[0].id },
      })
    }
  },
}
</script>
