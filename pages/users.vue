<script setup lang="ts">
import { PlusIcon, TrashIcon } from '@radix-icons/vue'
import {
  createColumnHelper,
  type Column,
  type ColumnDef,
} from '@tanstack/vue-table'
import { toTypedSchema } from '@vee-validate/zod'
import { format } from 'date-fns'
import { Loader2Icon } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { toast } from 'vue-sonner'
import { z } from 'zod'

import { Checkbox } from '~/components/ui/checkbox'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableViewOptions,
} from '~/components/ui/data-table'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog'
import type * as apiTypes from '~/typings/api'

const dataTableRef =
  ref<ComponentExposed<typeof DataTable<apiTypes.User, apiTypes.User>>>()

const { $api } = useNuxtApp()

const rootStore = useRootStore()
const { fetchUsers } = rootStore
const { usersData } = storeToRefs(rootStore)

const columnHelper = createColumnHelper<apiTypes.User>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<apiTypes.User, any>[] = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) =>
      h(Checkbox, {
        checked:
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate'),
        'onUpdate:checked': (value) => table.toggleAllPageRowsSelected(!!value),
      }),
    cell: ({ row }) =>
      h(Checkbox, {
        disabled: !row.getCanSelect(),
        checked: row.getIsSelected(),
        'onUpdate:checked': (value) => row.toggleSelected(!!value),
      }),
  }),
  columnHelper.accessor('id', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
    cell: ({ row }) => format(row.original.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }),
  columnHelper.accessor('name', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
  }),
]

const selectedRows = computed(
  () => dataTableRef.value?.table.getSelectedRowModel().rows || [],
)

const schema = z.object({
  name: z.string().min(1),
})

const form = useForm<z.infer<typeof schema>>({
  validationSchema: toTypedSchema(schema),
})

const isCreateUserDialogOpen = ref(false)

const onCreateUserDialogFormSubmit = form.handleSubmit(async () => {
  try {
    const { values } = await form.validate()

    if (values) {
      const { name } = values

      await $api('/api/v1/user', {
        method: 'post',
        body: JSON.stringify({ name }),
      })

      await fetchUsers()

      isCreateUserDialogOpen.value = false
    }
  } catch (err) {
    toast((err as Error).name, {
      description: (err as Error).message,
    })
  }
})

const isDeleting = ref(false)

const onDeleteSelected = async () => {
  isDeleting.value = true

  try {
    await Promise.all(
      selectedRows.value.map((row) =>
        $api(`/api/v1/user/${row.original.name}`, {
          method: 'delete',
        }),
      ) || [],
    )

    await fetchUsers()
  } catch (err) {
    toast.error((err as Error).name, {
      description: (err as Error).message,
    })
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <ClientOnly>
      <div class="flex flex-1 flex-col gap-2 overflow-auto p-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Dialog
              :open="isCreateUserDialogOpen"
              @update:open="(open) => (isCreateUserDialogOpen = open)"
            >
              <DialogTrigger as-child>
                <Button size="sm" variant="secondary">
                  <PlusIcon class="mr-2 size-4" />

                  Create
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>

                <AutoForm
                  class="space-y-6"
                  :form
                  :schema
                  @submit="() => onCreateUserDialogFormSubmit()"
                >
                  <DialogFooter>
                    <Button
                      :disabled="
                        form.isSubmitting.value ||
                        Object.values(form.errors.value).length
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

            <Button
              size="sm"
              variant="destructive"
              :disabled="!selectedRows.length || isDeleting"
              @click="onDeleteSelected"
            >
              <TrashIcon
                :class="['mr-2 size-4', isDeleting && 'animate-spin']"
              />

              Delete
            </Button>
          </div>

          <DataTableViewOptions
            v-if="dataTableRef?.table"
            :table="dataTableRef.table"
          />
        </div>

        <DataTable
          ref="dataTableRef"
          :sorting="[{ id: 'createdAt', desc: false }]"
          :column-visibility="{
            id: false,
          }"
          :data="usersData?.users || []"
          :columns
        />
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>
