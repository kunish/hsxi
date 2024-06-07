<script setup lang="ts">
import { DotsHorizontalIcon } from '@radix-icons/vue'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2Icon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { z } from 'zod'

import { AutoForm } from '~/components/ui/auto-form'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { useToast } from '~/components/ui/toast'
import type * as apiTypes from '~/typings/api'

const props = defineProps<{
  row: apiTypes.Node
}>()

const { $api } = useNuxtApp()
const { toast } = useToast()
const { fetchNodes } = useRootStore()

const schema = z.object({
  givenName: z.string().min(1),
})

const form = useForm<z.infer<typeof schema>>({
  validationSchema: toTypedSchema(schema),
})

const isRenameDialogOpen = ref(false)

watch(isRenameDialogOpen, (isRenameDialogOpen) => {
  if (isRenameDialogOpen)
    form.resetForm({
      values: {
        givenName: props.row.givenName,
      },
    })
})

const onSubmit = form.handleSubmit(async () => {
  try {
    const { values } = await form.validate()

    if (values) {
      const { givenName } = values

      await $api(`/api/v1/node/${props.row.id}/rename/${givenName}`, {
        method: 'post',
      })

      await fetchNodes()
    }

    isRenameDialogOpen.value = false
  } catch (err) {
    toast({
      variant: 'destructive',
      title: (err as Error).name,
      description: (err as Error).message,
    })
  }
})
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" size="icon">
        <DotsHorizontalIcon />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="start">
      <DropdownMenuItem @click="isRenameDialogOpen = true">
        Rename
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>

  <Dialog
    :open="isRenameDialogOpen"
    @update:open="(open) => (isRenameDialogOpen = open)"
  >
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Rename Node</DialogTitle>
      </DialogHeader>

      <AutoForm class="space-y-6" :form :schema @submit="() => onSubmit()">
        <DialogFooter>
          <Button
            type="submit"
            :disabled="
              form.isSubmitting.value ||
              Object.values(form.errors.value).length ||
              row.name === form.values.givenName
            "
          >
            <Loader2Icon
              v-if="form.isSubmitting.value"
              class="mr-2 h-4 w-4 animate-spin"
            />

            Confirm
          </Button>
        </DialogFooter>
      </AutoForm>
    </DialogContent>
  </Dialog>
</template>
