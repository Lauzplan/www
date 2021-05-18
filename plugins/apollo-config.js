import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import { garden } from '@/graphql/garden.gql'

const cache = new InMemoryCache()

async function doesGardenExist(gardenId, client) {
  try {
    await client.query({
      query: garden,
      variables: { id: gardenId },
    })
    return true
  } catch (e) {
    return false
  }
}

function getKnownUserFromCache() {
  let knownUsers = []
  try {
    knownUsers = JSON.parse(window.localStorage.getItem('knownUsers')) || []
  } catch (err) {
    if (!(err instanceof SyntaxError)) {
      throw err
    }
  }
  return knownUsers
}

const resolvers = {
  UserPreferences: {
    async selectedGarden({ selectedGarden }, _, { client }) {
      if (selectedGarden && (await doesGardenExist(selectedGarden.id, client)))
        return selectedGarden

      return null
    },
  },
  UserType: {
    preferences(root) {
      const knownUsers = getKnownUserFromCache()

      return (
        knownUsers[root.id]?.preferences || {
          __typename: 'UserPreferences',
        }
      )
    },
  },
  Mutation: {
    async selectGarden(root, { gardenId }, { client }) {
      if (!(await doesGardenExist(gardenId, client)))
        throw new Error(`Garden with id ${gardenId} does not exist`)

      const {
        data: { me },
      } = await client.query({
        query: gql`
          query {
            me {
              id
            }
          }
        `,
      })
      const knownUsers = getKnownUserFromCache()
      const preferences = knownUsers[me.id]?.preferences || {
        __typename: 'UserPreferences',
      }

      client.writeFragment({
        id: `$UserType:${me.id}.preferences`,
        fragment: gql`
          fragment NewPref on UserPreferences {
            selectedGarden {
              id
            }
          }
        `,
        data: {
          __typename: 'UserPreferences',
          selectedGarden: {
            __typename: 'GardenType',
            id: gardenId,
          },
        },
      })

      window.localStorage.setItem(
        'knownUsers',
        JSON.stringify({
          ...knownUsers,
          [me.id]: {
            preferences: {
              ...preferences,
              selectedGarden: { __typename: 'GardenType', id: gardenId },
            },
          },
        })
      )
      return true
    },
  },
}

const typeDefs = gql`
  extend type UserType {
    preferences: UserPreferences!
  }
  type UserPreferences {
    selectedGarden: GardenType
  }
  type Mutation {
    selectGarden(gardenId: ID!): Boolean
  }
`

export default (context) => {
  const authMiddleware = setContext(async () => {
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
    httpEndpoint: context.$config.apiURL,
    link: authMiddleware,
  }
}
