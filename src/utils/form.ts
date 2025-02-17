import type { ComputedRef, Ref } from 'vue'
import { useTopicsConf } from './config'

type FormErrorMessage = { inputName: string; message: string }

const { topicsName } = useTopicsConf()

export type FormErrorMessagesMap = Map<
  FormErrorMessage['inputName'],
  FormErrorMessage['message']
>

// define error messages for all inputs here
const errorMessages = [
  {
    inputName: 'bouquetId',
    message: `Veuillez sélectionner un ${topicsName}.`
  },
  { inputName: 'group', message: `Le groupe est limité à 100 caractères.` },
  { inputName: 'title', message: 'Veuillez renseigner un libellé.' },
  {
    inputName: 'purpose',
    message: "La raison d'utilisation ne doit pas être vide."
  }
] as const

// create a union type of available input errors
export type AllowedInput = (typeof errorMessages)[number]['inputName']

export function useForm(formErrors: Ref<string[]>): {
  formErrorMessagesMap: ComputedRef<FormErrorMessagesMap>
  sortedErrors: ComputedRef<string[]>
  getErrorMessage: (inputName: AllowedInput) => string
} {
  const formErrorMessagesMap = computed(() => {
    return errorMessages.reduce(
      (acc, error) => acc.set(error.inputName, error.message),
      new Map()
    )
  })
  const sortedErrors = computed(() => {
    return Array.from(formErrorMessagesMap.value.keys()).filter((key) =>
      formErrors.value.includes(key)
    )
  })
  const getErrorMessage = (inputName: AllowedInput): string => {
    if (formErrors.value.includes(inputName))
      return formErrorMessagesMap.value.get(inputName)
    return ''
  }

  return {
    formErrorMessagesMap,
    sortedErrors,
    getErrorMessage
  }
}
