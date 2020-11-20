import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'

const cache = new InMemoryCache({ persist: true })

const resolvers = {
  UserType: {
    async preferences(root, _, { cache, client }) {
      const query = gql`
        {
          knownUsers {
            id
            preferences {
              selectedGarden {
                id
              }
            }
          }
        }
      `
      let data
      try {
        data = cache.readQuery({ query })
      } catch (error) {
        let knownUsers = []
        try {
          knownUsers =
            JSON.parse(window.localStorage.getItem('knownUsers')) || []
        } catch (error) {
          console.log(error)
        }
        data = { knownUsers }
      }

      let user = data.knownUsers.find((u) => u.id === root.id)
      if (!user) {
        data.knownUsers.push(root)
        user = root
      }

      user.preferences = user.preferences || { __typename: 'UserPreferences' }

      if (!user.preferences.selectedGarden) {
        const {
          data: { gardens },
        } = await client.query({
          query: gql`
            {
              gardens {
                __typename
                id
              }
            }
          `,
        })

        user.preferences.selectedGarden = gardens[0]
      }
      cache.writeQuery({ query, data })
      window.localStorage.setItem('knownUsers', JSON.stringify(data.knownUsers))
      return user.preferences
    },
  },
  Mutation: {
    selectGarden(_, { garden }, { cache }) {
      const query = gql`
        {
          me {
            id
            preferences {
              selectedGarden {
                id
              }
            }
          }
        }
      `
      const data = cache.readQuery({ query })
      data.me.preferences.selectedGarden = {
        __typename: 'GardenType',
        id: garden.id,
      }
      cache.writeQuery({ query, data })

      let cacheData
      let user
      try {
        cacheData = JSON.parse(window.localStorage.getItem('knownUsers')) || []
        user = cacheData.find((u) => u.id === data.me.id)
        if (!user) {
          user = data.me
          cacheData.push(data)
        }
      } catch {
        user = data.me
        cacheData = [user]
      }
      user.preferences = {
        ...user.preferences,
        selectedGarden: { __typename: 'GardenType', id: garden.id },
      }

      window.localStorage.setItem('knownUsers', JSON.stringify(cacheData))
      return true
    },
  },
}

const typeDefs = gql`
  extend type UserType {
    preferences: UserPreferences!
  }
  type UserPreferences {
    selectedGarden: Garden
  }
  type Mutation {
    selectGarden(user: UserType!, garden: GardenType!): Boolean
  }
`

export default (context) => {
  const authMiddleware = setContext(async (request) => {
    const token = await context.$auth.getTokenSilently()
    return {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }
  })

  return {
    cache,
    typeDefs,
    resolvers,
    httpEndpoint: 'http://127.0.0.1:8000/graphql',
    link: authMiddleware,
  }
}
