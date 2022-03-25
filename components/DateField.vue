<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :return-value.sync="date"
    transition="scale-transition"
    offset-y
    min-width="auto"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="date"
        prepend-icon="mdi-calendar"
        readonly
        v-bind="{ ...attrs, ...$attrs }"
        v-on="on"
      ></v-text-field>
    </template>
    <v-date-picker
      v-model="date"
      no-title
      scrollable
      first-day-of-week="1"
      v-bind="$attrs"
    >
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
      <v-btn text color="primary" @click="$refs.menu.save(date)"> OK </v-btn>
    </v-date-picker>
  </v-menu>
</template>

<script>
import { DateTime } from 'luxon'
import datetimeInput from '@/mixins/datetimeInput'

export default {
  name: 'DateField',
  mixins: [datetimeInput],
  computed: {
    date: {
      get() {
        return this.innerValue.toISODate()
      },
      set(value) {
        const { year, month, day } = DateTime.fromISO(value).toObject()

        this.innerValue = this.innerValue.set({ year, month, day })
      },
    },
  },
}
</script>

<style></style>
