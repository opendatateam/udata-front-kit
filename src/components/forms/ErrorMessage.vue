<script lang="ts">
/**
 * Use a non-null assertion operator if the prop might be null or undefined.
 * Only use this with a `v-if`
 *
 * @example
 * ```vue
 * <ErrorMessage
      v-if="!!getErrorMessage('bouquetId')"
      input-name="bouquetId"
      :error-message="getErrorMessage('bouquetId')!"
    />
  * ```
  */
export default {}
</script>
<script lang="ts" setup>
/*
To keep things simple, we can use TypeScript's non-null assertion operator (!) when calling this component and passing the 'errorMessage' prop.
We need the prop to be required so it can't be undefined but sometimes the function to get the error message from the parent might return undefined. This is mitigated with the v-ifs (on the component or here on the template) but typescript does not care.
https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#non-null-assertion-operator-postfix-
*/

export interface CustomProps {
  inputName: string
  errorMessage: string
}

defineProps<CustomProps>()
</script>

<template v-if="errorMessage">
  <p :id="`errors-${inputName}`" class="error">
    <VIconCustom name="error-fill" />
    {{ errorMessage }}
  </p>
</template>
