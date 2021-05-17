import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools'
import getcontext from '@/plugins/apollo-config'
import { graphql } from 'graphql'

let schema
let basicCachedJson
describe('Local resolvers', () => {
  beforeEach(() => {
    basicCachedJson = {
      anotherid: {
        preferences: {
          selectedGarden: { __typename: 'GardenType', id: '1' },
          __typename: 'UserPreferences',
        },
        __typename: 'UserType',
      },
      userid: {
        preferences: {
          selectedGarden: { __typename: 'GardenType', id: '2' },
          __typename: 'UserPreferences',
        },
        __typename: 'UserType',
      },
    }
    const { resolvers } = getcontext()
    resolvers.Query = {
      me: () => {
        return { id: 'userid', __typename: 'UserType' }
      },
    }
    schema = makeExecutableSchema({
      typeDefs: `
      type Query {
        me: UserType
      }
      type UserType {
        id: ID!
        preferences: UserPreferences!
      }
      type UserPreferences {
        selectedGarden: GardenType
      }
      type GardenType {
        id: ID
      }
      type Mutation {
        selectGarden(gardenId: ID!): Boolean
      }`,
      resolvers,
    })

    addMockFunctionsToSchema({
      schema,
      preserveResolvers: true,
    })
  })

  afterEach(() => {
    window.localStorage.removeItem('knownUsers')
  })

  describe('UserPreferences', () => {
    test('should return preferences for the correct user', async () => {
      window.localStorage.setItem('knownUsers', JSON.stringify(basicCachedJson))
      const query = `
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
      const client = {
        query() {
          return new Promise((resolve) =>
            resolve({ data: { garden: { id: '2' } } })
          )
        },
      }
      const result = await graphql(schema, query, null, { client })
      expect(result).toEqual({
        data: {
          me: { id: 'userid', preferences: { selectedGarden: { id: '2' } } },
        },
      })
    })
    test('Should return null if the cached data is not a valid json', async () => {
      window.localStorage.setItem('knownUsers', `[fsdfsqdfqs`)
      const query = `
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
      const client = {
        query() {
          return new Promise((resolve) =>
            resolve({ data: { garden: { id: '2' } } })
          )
        },
      }
      const result = await graphql(schema, query, null, { client })
      expect(result).toEqual({
        data: {
          me: { id: 'userid', preferences: { selectedGarden: null } },
        },
      })
    })

    test('Should return null if the cached data is not the expected json', async () => {
      window.localStorage.setItem(
        'knownUsers',
        JSON.stringify(basicCachedJson.anotherid)
      )
      const query = `
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
      const client = {
        query() {
          return new Promise((resolve) =>
            resolve({ data: { garden: { id: '2' } } })
          )
        },
      }
      const result = await graphql(schema, query, null, { client })
      expect(result).toEqual({
        data: {
          me: { id: 'userid', preferences: { selectedGarden: null } },
        },
      })
    })
    test('Should return null if the data is not cached', async () => {
      const query = `
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
      const client = {
        query() {
          return new Promise((resolve) =>
            resolve({ data: { garden: { id: '2' } } })
          )
        },
      }
      const result = await graphql(schema, query, null, { client })
      expect(result).toEqual(
        {
          data: {
            me: { id: 'userid', preferences: { selectedGarden: null } },
          },
        },
        { client: null }
      )
    })
  })

  describe('SelectGarden Mutation', () => {
    test('should cache the given garden', async () => {
      window.localStorage.setItem('knownUsers', JSON.stringify(basicCachedJson))
      const query = `
      mutation {
        selectGarden(gardenId: "1")
      }
      `
      const client = {
        query() {
          return new Promise((resolve) =>
            resolve({ data: { garden: { id: '1' }, me: { id: 'userid' } } })
          )
        },
      }
      const result = await graphql(schema, query, null, { client })
      expect(result).toEqual({ data: { selectGarden: true } })

      basicCachedJson.userid.selectGarden.id = 1

      expect(JSON.parse(window.localStorage.getItem('knownUsers'))).toEqual(
        basicCachedJson
      )
    })
    test('should cache the given garden even if the current cache a valid json', async () => {
      window.localStorage.setItem('knownUsers', `[fdsfsdf`)
      const query = `
      mutation {
        selectGarden(gardenId: "1")
      }
      `
      const client = {
        query() {
          return new Promise((resolve) =>
            resolve({ data: { garden: { id: '1' }, me: { id: 'userid' } } })
          )
        },
      }
      const result = await graphql(schema, query, null, { client })
      expect(result).toEqual({ data: { selectGarden: true } })

      expect(JSON.parse(window.localStorage.getItem('knownUsers'))).toEqual([
        {
          id: 'userid',
          preferences: {
            selectedGarden: { __typename: 'GardenType', id: '1' },
            __typename: 'UserPreferences',
          },
          __typename: 'UserType',
        },
      ])
    })
  })
})
