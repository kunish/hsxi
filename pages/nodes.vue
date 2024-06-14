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

import { NodeColumnActionsDropdownMenu } from '~/components/NodeColumnActions'
import { Badge } from '~/components/ui/badge'
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

const { $api } = useNuxtApp()
const rootStore = useRootStore()
const { fetchNodes } = rootStore
const { nodesData, usersData } = storeToRefs(rootStore)

const dataTableRef =
  ref<ComponentExposed<typeof DataTable<apiTypes.Node, apiTypes.Node>>>()

const columnHelper = createColumnHelper<apiTypes.Node>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<apiTypes.Node, any>[] = [
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
  columnHelper.display({
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(NodeColumnActionsDropdownMenu, {
        row: row.original,
      }),
  }),
  columnHelper.accessor('id', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('createdAt', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
    cell: ({ row }) => format(row.original.createdAt, 'yyyy-MM-dd HH:mm:ss'),
  }),
  columnHelper.accessor('lastSeen', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
    cell: ({ row }) => format(row.original.lastSeen, 'yyyy-MM-dd HH:mm:ss'),
  }),
  columnHelper.accessor('givenName', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('name', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('ipAddresses', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
    cell: ({ row }) =>
      h(
        'div',
        {
          class: 'flex items-center gap-2',
        },
        row.original.ipAddresses.map((ipAddress) =>
          h(
            Badge,
            {
              onClick: async () =>
                await navigator.clipboard.writeText(ipAddress),
              class: 'cursor-pointer',
            },
            () => ipAddress,
          ),
        ),
      ),
  }),
  columnHelper.accessor('online', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
    cell: ({ row }) =>
      row.original.online
        ? h('div', { class: 'size-3 bg-green-500 rounded-full' })
        : h('div', { class: 'size-3 bg-red-500 rounded-full' }),
  }),
  columnHelper.accessor('user.name', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('registerMethod', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('expiry', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('machineKey', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('nodeKey', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('discoKey', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('validTags', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('invalidTags', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('forcedTags', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
]

const selectedRows = computed(
  () => dataTableRef.value?.table.getSelectedRowModel().rows || [],
)

const schema = shallowRef(
  z.object({
    user: z.enum(
      usersData.value.users.map((user) => user.name) as [string, ...string[]],
    ),
    key: z.string().min(1),
  }),
)

const form = useForm<z.infer<typeof schema.value>>({
  get validationSchema() {
    return toTypedSchema(schema.value)
  },
})

const isRegisterNodeDialogOpen = ref(false)

const onRegisterNodeDialogFormSubmit = form.handleSubmit(async () => {
  try {
    const { values } = await form.validate()

    if (values) {
      const { user, key } = values

      await $api('/api/v1/node/register', {
        method: 'post',
        body: JSON.stringify({ user, key }),
      })

      await fetchNodes()

      isRegisterNodeDialogOpen.value = false
    }
  } catch (err) {
    toast.error((err as Error).name, {
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
        $api(`/api/v1/node/${row.original.id}`, {
          method: 'delete',
        }),
      ) || [],
    )

    await fetchNodes()
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
              :open="isRegisterNodeDialogOpen"
              @update:open="(open) => (isRegisterNodeDialogOpen = open)"
            >
              <DialogTrigger as-child>
                <Button size="sm" variant="secondary">
                  <PlusIcon class="mr-2 size-4" />

                  Register
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Register Node</DialogTitle>
                </DialogHeader>

                <AutoForm
                  class="space-y-6"
                  :form
                  :schema
                  @submit="() => onRegisterNodeDialogFormSubmit()"
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
            validTags: false,
            invalidTags: false,
            forcedTags: false,
            nodeKey: false,
            discoKey: false,
            registerMethod: false,
            machineKey: false,
          }"
          :data="nodesData?.nodes || []"
          :columns
        />
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>
