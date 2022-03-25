import { extend } from 'vee-validate'
import { required } from 'vee-validate/dist/rules'
import get from 'lodash/get'

extend('required', {
  ...required,
})

extend('requiredField', {
  validate(value, args) {
    return {
      required: true,
      valid: !!get(value, args.field),
    }
  },
  computesRequired: true,
  params: ['field'],
  message: 'Ce champ est requis',
})
