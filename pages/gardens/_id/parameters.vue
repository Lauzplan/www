<template>
  <v-container>
    <v-card>
      <v-card-title>Paramètres du jardin</v-card-title>
      <v-card-subtitle>Accès</v-card-subtitle>
      <v-card-text>
        <v-text-field
          v-model="email"
          label="Email à ajouter"
          placeholder="email"
          type="email"
        >
          <template #append-outer>
            <ApolloMutation
              v-slot="{ mutate, isLoading }"
              :mutation="addInvitation"
              :variables="{ gardenId: $route.params.id, email }"
              :update="
                () => {
                  email = ''
                }
              "
            >
              <v-btn
                :disabled="!email"
                :loading="isLoading"
                color="primary"
                @click="mutate"
              >
                <v-icon left>mdi-plus</v-icon>
                Ajouter
              </v-btn>
            </ApolloMutation>
          </template>
        </v-text-field>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import addInvitation from '~/graphql/addInvitation.gql'
export default {
  data() {
    return { email: null, addInvitation }
  },
}
</script>

<style></style>
