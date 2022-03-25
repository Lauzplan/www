<template>
  <v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
      <v-btn icon v-bind="attrs" v-on="on">
        <v-badge
          :value="invitations.length > 0"
          :content="invitations.length"
          color="red"
          overlap
        >
          <v-icon>mdi-bell</v-icon>
        </v-badge>
      </v-btn>
    </template>
    <ApolloMutation
      v-slot="{ mutate }"
      :refetchQueries="['getGardens']"
      :mutation="answerInvitation"
      :tag="null"
    >
      <v-list>
        <v-list-item v-if="invitations.length == 0">
          <v-list-item-title>Vous n'avez aucune notification</v-list-item-title>
        </v-list-item>
        <v-list-item v-for="invite of invitations" :key="invite.id">
          <v-list-item-title
            >Vous avez reçu une invitation pour rejoindre le jardin "{{
              invite.garden.name
            }}"</v-list-item-title
          >
          <v-list-item-action>
            <div class="d-flex">
              <v-btn
                color="error"
                icon
                @click="
                  mutate({
                    variables: {
                      invitationId: invite.id,
                      accept: false,
                    },
                  })
                "
              >
                <v-icon>mdi-close</v-icon>
              </v-btn>
              <v-btn
                color="success"
                icon
                @click="
                  mutate({
                    variables: {
                      invitationId: invite.id,
                      accept: true,
                    },
                  })
                "
              >
                <v-icon>mdi-check</v-icon>
              </v-btn>
            </div>
          </v-list-item-action>
        </v-list-item>
      </v-list>
    </ApolloMutation>
  </v-menu>
</template>

<script>
import answerInvitation from '~/graphql/answerInvitation.gql'
export default {
  name: 'NotificationMenu',
  props: {
    invitations: {
      type: Object,
    },
  },
  data() {
    return {
      answerInvitation,
    }
  },
}
</script>

<style></style>
