<template>
  <v-data-table :headers="headers" :items="items" sort-by="calories">
    <template v-slot:top>
      <v-toolbar flat color="white">
        <v-spacer></v-spacer>
        <v-btn color="primary" class="mr-2" @click="exportData">
          <v-icon left>mdi-export</v-icon>
          Export
        </v-btn>
        <!-- <ImportButton
          class="mr-2"
          :disabled="disabled"
          @fileSelected="importData"
        ></ImportButton> -->
        <v-dialog v-model="dialog" max-width="500px">
          <template v-slot:activator="{ on }">
            <v-btn color="primary" class="mr-2" :disabled="disabled" v-on="on">
              <v-icon left>mdi-plus</v-icon>
              Add {{ itemName }}
            </v-btn>
          </template>
          <v-card>
            <validation-observer
              ref="observer"
              v-slot="{ invalid, handleSubmit }"
            >
              <v-card-title>
                <span class="headline">{{ formTitle }}</span>
              </v-card-title>

              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col
                      v-for="{
                        text,
                        value,
                        type,
                        attrs,
                        rules,
                      } in editableFields"
                      :key="value"
                      cols="12"
                      sm="6"
                      md="4"
                    >
                      <validation-provider
                        v-slot="{ errors }"
                        :name="text"
                        :rules="rules"
                      >
                        <slot
                          :name="`dialog.${value}`"
                          v-bind="{ item: editedItem, value, text, errors }"
                        >
                          <component
                            :is="getDialogComponent(type)"
                            v-model="editedItem[value]"
                            v-bind="{
                              ...getDialogComponentProps(type),
                              ...attrs,
                            }"
                            :label="text"
                            :error-messages="errors"
                          />
                        </slot>
                      </validation-provider>
                    </v-col>
                  </v-row>
                </v-container>
              </v-card-text>

              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text @click="close">Cancel</v-btn>
                <v-btn
                  color="blue darken-1"
                  text
                  :disabled="invalid"
                  @click="handleSubmit(save)"
                  >Save</v-btn
                >
              </v-card-actions>
            </validation-observer>
          </v-card>
        </v-dialog>
        <v-btn icon @click="$emit('refresh')"
          ><v-icon>mdi-refresh</v-icon></v-btn
        >
      </v-toolbar>
    </template>
    <template v-slot:item.actions="{ item }">
      <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
      <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
    </template>
    <!-- Pass all slots to the datatable -->
    <template v-for="(index, name) in $scopedSlots" v-slot:[name]="data">
      <slot :name="name" v-bind="data"></slot>
    </template>

    <template
      v-for="itemConfig in itemsTypeConfig"
      v-slot:[itemConfig.slot]="data"
    >
      {{ itemConfig.itemFormat(data.value) }}
    </template>
  </v-data-table>
</template>
<script>
import pick from 'lodash/pick'
import cloneDeep from 'lodash/cloneDeep'
import mapValues from 'lodash/mapValues'
import isObject from 'lodash/isObject'
import get from 'lodash/get'
import { DateTime, Duration } from 'luxon'
import { ValidationProvider, ValidationObserver } from 'vee-validate'

function nullify(obj) {
  const result = mapValues(obj, (x) => {
    if (isObject(x)) return nullify(x)
    return null
  })
  return result
}

export default {
  name: 'CRUD',
  components: {
    ValidationProvider,
    ValidationObserver,
  },
  model: {
    prop: 'items',
  },
  props: {
    fields: {
      type: Array,
      required: true,
    },
    itemName: {
      type: String,
      required: false,
      default: 'Item',
    },
    items: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: (vm) => ({
    valid: null,
    dialog: false,
    editedIndex: -1,
    editedItem: nullify(vm.items[0]),
    defaultItem: nullify(vm.items[0]),
    typesComponents: {
      date: {
        dialog: () => import('./DateField.vue'),
        itemFormat: (value) => DateTime.fromISO(value).toLocaleString(),
      },
      time: {
        dialog: () => import('./TimeField.vue'),
        itemFormat: (value) =>
          DateTime.fromISO(value).toLocaleString(DateTime.TIME_SIMPLE),
      },
      number: {
        dialog: 'v-text-field',
        props: { type: 'number' },
      },
      duration: {
        itemFormat: (value) => {
          const duration = Duration.fromMillis(value * 1000).shiftTo(
            'hours',
            'minutes'
          )

          const { hours, minutes } = duration.toObject()
          return duration.toFormat(
            `${hours > 0 ? "h 'h'" : ''}${hours > 0 && minutes > 0 ? ' ' : ''}${
              minutes > 0 ? "m 'min'" : ''
            }`
          )
        },
      },
      default: {
        dialog: 'v-text-field',
      },
    },
  }),
  computed: {
    formTitle() {
      return this.editedIndex === -1
        ? `New ${this.itemName}`
        : `Edit ${this.itemName}`
    },
    headers() {
      return [...this.fields, { value: 'actions', sortable: false }]
    },
    editableFields() {
      return this.fields.filter((f) => !f.readOnly)
    },
    itemsTypeConfig() {
      return this.fields
        .filter(
          (f) =>
            f.type in this.typesComponents &&
            this.typesComponents[f.type].itemFormat
        )
        .map((f) => ({
          ...f,
          ...this.typesComponents[f.type],
          slot: `item.${f.value}`,
        }))
    },
  },

  watch: {
    dialog(val) {
      val || this.close()
    },
    items() {
      this.$emit('input', this.items)
    },
  },
  methods: {
    getDialogComponent(type) {
      return (
        this.typesComponents[type]?.dialog ||
        this.typesComponents.default.dialog
      )
    },
    getDialogComponentProps(type) {
      return this.typesComponents[type]?.props
    },
    editItem(item) {
      this.editedIndex = this.items.indexOf(item)
      this.editedItem = cloneDeep(item)
      this.dialog = true
    },
    deleteItem(item) {
      const index = this.items.indexOf(item)
      const confirmation = confirm('Are you sure you want to delete this item?')
      if (!confirmation) return

      this.items.splice(index, 1)
      this.$emit('deleteItem', item)
    },
    close() {
      this.dialog = false
      this.$nextTick(() => {
        this.editedItem = cloneDeep(this.defaultItem)
        this.editedIndex = -1
      })
    },
    save() {
      if (this.editedIndex > -1) {
        Object.assign(this.items[this.editedIndex], this.editedItem)
        this.$emit('editItem', this.editedItem)
      } else {
        this.$emit('addItem', this.editedItem)
        this.items.push(this.editedItem)
      }
      this.close()
    },
    importData(files) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        /* Parse data */
        const bstr = e.target.result

        const XLSX = await import('xlsx/xlsx')
        const wb = XLSX.read(bstr, { type: 'binary' })
        /* Get first worksheet */
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        /* Convert array of arrays */

        XLSX.utils
          .sheet_to_json(ws, { defval: '' })
          .filter((row) => {
            const rowKeys = Object.keys(row)
            return this.editableFields.every((field) =>
              rowKeys.includes(field.value)
            )
          })
          .map((row) => {
            const prop = this.editableFields.map((f) => f.value.trim())
            return pick(row, prop)
          })
          .forEach((row) => {
            this.editedItem = row
            this.save()
          })
      }

      reader.readAsBinaryString(files[0])
    },
    async exportData() {
      const XLSX = await import('xlsx/xlsx')
      const toExport = []
      toExport.push(this.editableFields.map((field) => field.text))
      for (const item of this.items) {
        const row = this.editableFields.map((field) => {
          const res = get(item, field.value)
          if (field.type === 'date') {
            return new Date(res)
          }
          if (field.type === 'time') {
            return DateTime.fromISO(res).toFormat('HH:mm')
          }
          return res
        })
        toExport.push(row)
      }

      const ws = XLSX.utils.aoa_to_sheet(toExport, {
        cellDates: true,
      })
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'opérations')

      XLSX.writeFile(wb, 'export-operations-lauzplan.xlsx', { cellDates: true })
    },
  },
}
</script>
