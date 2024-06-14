<script setup lang="ts">
import { DotsHorizontalIcon, PlusIcon, TrashIcon } from '@radix-icons/vue'
import {
  createColumnHelper,
  type Column,
  type ColumnDef,
} from '@tanstack/vue-table'
import { format } from 'date-fns'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { toast } from 'vue-sonner'

import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableViewOptions,
} from '~/components/ui/data-table'
import type * as apiTypes from '~/typings/api'

const { $api } = useNuxtApp()
const rootStore = useRootStore()
const { fetchApiKeys } = rootStore
const { apiKeysData } = storeToRefs(rootStore)

const columnHelper = createColumnHelper<apiTypes.ApiKey>()

const dataTableRef =
  ref<ComponentExposed<typeof DataTable<apiTypes.ApiKey, apiTypes.ApiKey>>>()

const [DefineActionsTemplate, ReuseActionsTemplate] = createReusableTemplate<{
  row: apiTypes.ApiKey
}>({
  inheritAttrs: false,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<apiTypes.ApiKey, any>[] = [
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
    id: 'Actions',
    header: 'Actions',
    cell: ({ row }) =>
      h(ReuseActionsTemplate, {
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
  columnHelper.accessor('prefix', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
  }),
  columnHelper.accessor('expiration', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown, unknown>,
      }),
    cell: ({ row }) => format(row.original.expiration, 'yyyy-MM-dd HH:mm:ss'),
  }),
]

const selectedRows = computed(
  () => dataTableRef.value?.table.getSelectedRowModel().rows || [],
)

const copyToClipboard = async (text: string) =>
  await navigator.clipboard.writeText(text)

const onExpire = async (prefix: string) => {
  await $api('/api/v1/apikey/expire', {
    method: 'post',
    body: JSON.stringify({ prefix }),
  })

  await fetchApiKeys()
}

const isDeleting = ref(false)

const onDelete = async (prefix: string) => {
  isDeleting.value = true

  try {
    await $api(`/api/v1/apikey/${prefix}`, {
      method: 'delete',
    })

    await fetchApiKeys()
  } catch (err) {
    toast({
      variant: 'destructive',
      title: (err as Error).name,
      description: (err as Error).message,
    })
  } finally {
    isDeleting.value = false
  }
}

const onDeleteSelected = async () => {
  isDeleting.value = true

  try {
    await Promise.all(
      selectedRows.value.map((row) =>
        $api(`/api/v1/apikey/${row.original.prefix}`, {
          method: 'delete',
        }),
      ) || [],
    )

    await fetchApiKeys()
  } catch (err) {
    toast.error((err as Error).name, {
      description: (err as Error).message,
    })
  } finally {
    isDeleting.value = false
  }
}

const isCreating = ref(false)

const onCreate = async () => {
  isCreating.value = true

  try {
    const { apiKey } = await $api<{
      apiKey: string
    }>('/api/v1/apikey', {
      method: 'post',
    })

    toast('Newly created apiKey has been copied to clipboard!', {
      action: {
        label: 'Copy',
        onClick: async () => {
          await navigator.clipboard.writeText(apiKey)
        },
      },
      description: h('div', { class: 'break-all' }, apiKey),
    })

    await fetchApiKeys()
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <ClientOnly>
      <DefineActionsTemplate #="{ row }">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon">
              <DotsHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem @click="copyToClipboard(row.prefix)">
              Copy Prefix
            </DropdownMenuItem>

            <DropdownMenuItem @click="onExpire(row.prefix)">
              Expire
            </DropdownMenuItem>

            <DropdownMenuItem @click="onDelete(row.prefix)">
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </DefineActionsTemplate>

      <div class="flex flex-1 flex-col gap-2 overflow-auto p-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              :disabled="isCreating"
              @click="onCreate"
            >
              <PlusIcon
                :class="['mr-2 size-4', isCreating && 'animate-spin']"
              />

              Create
            </Button>

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
          :data="apiKeysData?.apiKeys || []"
          :columns
        />
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>
