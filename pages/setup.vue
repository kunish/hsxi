<script setup lang="ts">
import { Loader2Icon } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

const isSubmitting = ref(false)

const schema = z.object({
  apiKey: z.string().min(1),
})

const apiKeyCookie = useCookie('apiKey')

const onSubmit = async (values: z.infer<typeof schema>) => {
  isSubmitting.value = true

  try {
    await $fetch('/api/v1/apikey', {
      headers: {
        Authorization: `Bearer ${values.apiKey}`,
      },
    })

    apiKeyCookie.value = values.apiKey as string

    await navigateTo('/', { replace: true })
  } catch (err) {
    toast.error((err as Error).name, {
      description: (err as Error).message,
    })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="grid size-full place-items-center">
    <Card class="w-full max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl">Setup</CardTitle>

        <CardDescription>
          Enter your headscale endpoint api key below to get started
        </CardDescription>
      </CardHeader>

      <CardContent class="grid gap-4">
        <AutoForm
          class="space-y-6"
          :schema
          :field-config="{
            apiKey: {
              inputProps: {
                type: 'password',
              },
            },
          }"
          @submit="onSubmit"
        >
          <Button class="w-full" type="submit" :disabled="isSubmitting">
            <Loader2Icon
              v-if="isSubmitting"
              class="mr-2 h-4 w-4 animate-spin"
            />

            Submit
          </Button>
        </AutoForm>
      </CardContent>
    </Card>
  </div>
</template>
