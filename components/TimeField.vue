<template>
  <v-menu
    ref="menu"
    v-model="menu"
    :close-on-content-click="false"
    :nudge-right="40"
    :return-value.sync="time"
    transition="scale-transition"
    offset-y
    max-width="290px"
    min-width="290px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-text-field
        v-model="time"
        prepend-icon="mdi-clock-time-four-outline"
        readonly
        v-bind="{ ...attrs, ...$attrs }"
        v-on="on"
      ></v-text-field>
    </template>
    <v-time-picker
      v-if="menu"
      v-model="time"
      scrollable
      format="24hr"
      v-bind="$attrs"
    >
      <v-spacer></v-spacer>
      <v-btn text color="primary" @click="menu = false"> Cancel </v-btn>
      <v-btn text color="primary" @click="$refs.menu.save(time)"> OK </v-btn>
    </v-time-picker>
  </v-menu>
</template>

<script>
import { DateTime } from 'luxon'
import datetimeInput from '@/mixins/datetimeInput'

export default {
  name: 'TimeField',
  mixins: [datetimeInput],
  computed: {
    time: {
      get() {
        return this.innerValue.toFormat('HH:mm')
      },
      set(value) {
        const { hour, minute } = DateTime.fromISO(value).toObject()

        this.innerValue = this.innerValue.set({ hour, minute })
      },
    },
  },
}
</script>

<style></style>
