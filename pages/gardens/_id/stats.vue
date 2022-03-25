<template>
  <v-container>
    <ApolloQuery
      v-slot="{ result: { data, error }, query }"
      :query="getPerformedOperations"
      :notify-on-network-status-change="true"
    >
      <div v-if="error">{{ error }}</div>
      <ApolloMutation :mutation="{}" v-slot="{ mutate }">
        <crud
          v-if="data && data.performedOperations"
          class="elevation-1"
          :fields="headers"
          :items="data.performedOperations"
          @refresh="query.refetch()"
          @deleteItem="
            mutate({
              variables: { id: $event.id },
              mutation: deleteHistoryItem,
            })
          "
          @addItem="
            mutate({
              variables: {
                comment: $event.comment,
                numberOfWorker: $event.numberOfWorker,
                varietyId: $event.variety.id,
                withDate: {
                  date: toISODate($event.date),
                  startTime: toISOTime($event.startTime),
                  endTime: toISOTime($event.endTime),
                },
              },
              mutation: addHistoryItem,
            })
          "
          @editItem="
            mutate({
              variables: {
                id: $event.id,
                date: toISODate($event.date),
                startTime: toISOTime($event.startTime),
                endTime: toISOTime($event.endTime),
                variety_id: $event.variety.id,
                numberOfWorker: $event.numberOfWorker,
                comment: $event.comment,
              },
              mutation: editHistoryItem,
            })
          "
        >
          <template #dialog.variety.species.name="{ text, item, errors }">
            <v-select
              v-model="item.variety.species"
              :items="data.species"
              :label="text"
              item-text="name"
              return-object
              :error-messages="errors"
            ></v-select>
          </template>
          <template #dialog.variety.name="{ text, item }">
            <v-select
              v-model="item.variety"
              :items="getVarieties(data.species, item)"
              :label="text"
              item-text="name"
              return-object
              no-data-text="Sélectionnez d'abord une espèce"
            ></v-select
          ></template>
        </crud>
      </ApolloMutation>
    </ApolloQuery>
  </v-container>
</template>

<script>
import { DateTime } from 'luxon'
import getPerformedOperations from '@/graphql/getPerformedOperations.gql'
import deleteHistoryItem from '@/graphql/deleteHistoryItem.gql'
import addHistoryItem from '@/graphql/addHistoryItem.gql'
import editHistoryItem from '@/graphql/editHistoryItem.gql'
import Crud from '@/components/CRUD.vue'

export default {
  components: { Crud },
  data() {
    return {
      getPerformedOperations,
      deleteHistoryItem,
      addHistoryItem,
      editHistoryItem,
      headers: [
        { text: 'Date', value: 'date', type: 'date', rules: 'required' },
        {
          text: 'Début',
          value: 'startTime',
          type: 'time',
          rules: 'required',
        },
        {
          text: 'Fin',
          value: 'endTime',
          type: 'time',
          rules: 'required',
        },
        {
          text: 'Espèce',
          value: 'variety.species.name',
          rules: 'requiredField:id',
        },
        { text: 'Variété', value: 'variety.name', rules: 'requiredField:id' },
        {
          text: 'Nombre de travailleur',
          value: 'numberOfWorker',
          type: 'number',
          attrs: {
            min: 1,
            max: 100,
          },
        },
        {
          text: 'Temps total de travail',
          value: 'totalWorkTime',
          readOnly: true,
          type: 'duration',
        },
        { text: 'Commentaire', value: 'comment' },
      ],
    }
  },
  methods: {
    getVarieties(species, item) {
      return (
        species.find((v) => v.id === item.variety?.species?.id)?.varieties || []
      )
    },
    toISODate(datetime) {
      return DateTime.fromISO(datetime).toISODate()
    },
    toISOTime(datetime) {
      return DateTime.fromISO(datetime).toISOTime()
    },
  },
}
</script>

<style></style>
