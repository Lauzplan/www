<template>
  <div>
    <v-row>
      <v-col align="center" justify="center">
        <img height="100px" src="~/assets/no-data.svg" />
      </v-col>
    </v-row>
    <v-row>
      <v-col align="center" justify="center">
        <div>Vous n'avez aucun jardin</div>
      </v-col>
    </v-row>
    <v-row>
      <v-col align="center" justify="center">
        <v-btn color="success" @click="create">
          <v-icon>mdi-plus</v-icon>
          Créer un jardin
        </v-btn>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import gql from 'graphql-tag'
import createGarden from '~/mixins/create_garden.js'

export default {
  async middleware({ app, redirect }) {
    const client = app.apolloProvider.defaultClient
    const {
      data: { gardens },
    } = await client.query({
      query: gql`
        query getGardenIds {
          gardens {
            id
          }
        }
      `,
    })

    if (gardens.length > 0) {
      return redirect('/gardens')
    }
  },
  mixins: [createGarden],
}
</script>

<style></style>
