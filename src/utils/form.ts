import type { ComputedRef, Ref } from 'vue'

export type FormErrorMessage = { inputName: string; message: string }

export type FormErrorMessagesMap = Map<
  FormErrorMessage['inputName'],
  FormErrorMessage['message']
>

export function useForm(
  formErrorMessages: FormErrorMessage[],
  formErrors: Ref<string[]>
): {
  formErrorMessagesMap: ComputedRef<FormErrorMessagesMap>
  sortedErrors: ComputedRef<string[]>
} {
  const formErrorMessagesMap = computed(() => {
    return formErrorMessages.reduce(
      (acc, error) => acc.set(error.inputName, error.message),
      new Map()
    )
  })
  const sortedErrors = computed(() => {
    return Array.from(formErrorMessagesMap.value.keys()).filter((key) =>
      formErrors.value.includes(key)
    )
  })

  return {
    formErrorMessagesMap,
    sortedErrors
  }
}
