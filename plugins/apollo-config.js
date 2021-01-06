import gql from 'graphql-tag'
import { InMemoryCache } from 'apollo-cache-inmemory'
// import { ApolloLink } from 'apollo-link'
import { setContext } from 'apollo-link-context'
import GeoJSON from 'ol/format/GeoJSON'
import { Feature } from 'ol'

const cache = new InMemoryCache()

const resolvers = {
  ParcelType: {
    feature(root, _, { cache }) {
      const parcel = cache.readFragment({
        id: root.id,
        fragment: gql`
          fragment parcel on ParcelType {
            feature
          }
        `,
      })

      let feature
      if (parcel) {
        feature = parcel.feature
      } else {
        feature = new Feature(
          new GeoJSON().readGeometry(JSON.parse(root.geometry))
        )
        feature.setProperties({ parcel_id: root.id })
      }
      return feature
    },
  },
  UserType: {
    preferences(root, _, context) {
      let knownUsers = []
      try {
        knownUsers = JSON.parse(window.localStorage.getItem('knownUsers')) || []
      } catch (err) {
        if (!(err instanceof SyntaxError)) {
          throw err
        }
      }
      let preferences =
        knownUsers.find((user) => user.id === root.id)?.preferences || {}
      try {
        cache.readFragment({
          id: preferences.selectGarden.id,
          fragment: gql`
              fragment on GardenType {
                id
              }
            `,
        })
      } catch {
        preferences = {}
      }
      return {
        selectedGarden: preferences.selectedGarden || null,
        __typename: 'UserPreferences',
      }
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
          cacheData.push(user)
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
