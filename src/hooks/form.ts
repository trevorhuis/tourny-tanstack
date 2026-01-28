import { createFormHook } from '@tanstack/react-form'

import {
  DateField,
  NumberField,
  NumberSelect,
  Select,
  SubmitButton,
  TextArea,
  TextField,
} from '../components/FormComponents'
import { fieldContext, formContext } from './form-context'

export const { useAppForm } = createFormHook({
  fieldComponents: {
    TextField,
    Select,
    TextArea,
    DateField,
    NumberField,
    NumberSelect,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
})
