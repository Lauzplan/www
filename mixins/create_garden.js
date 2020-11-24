import gql from 'graphql-tag'

function update(store, { data: { createGarden } }) {
  const query = gql`
    {
      gardens {
        id
        name
      }
    }
  `

  const data = store.readQuery({ query })
  data.gardens.push(createGarden)
  store.writeQuery({ query, data })
}
export default {
  methods: {
    async create() {
      const {
        data: { createGarden },
      } = await this.$apollo.mutate({
        mutation: gql`
          mutation createGarden($name: String!) {
            createGarden(name: $name, postalCode: "1234") {
              name
              id
            }
          }
        `,
        variables: {
          name: 'Nouveau Jardin',
        },
        update,
      })
      this.$router.push({ name: 'gardens-id', params: { id: createGarden.id } })
    },
  },
}
