<script setup lang="ts">
import { CheckCircledIcon, CrossCircledIcon } from '@radix-icons/vue'
import {
  createColumnHelper,
  type Column,
  type ColumnDef,
} from '@tanstack/vue-table'
import { format } from 'date-fns'
import type { ComponentExposed } from 'vue-component-type-helpers'
import { toast } from 'vue-sonner'

import { Checkbox } from '~/components/ui/checkbox'
import {
  DataTable,
  DataTableColumnHeader,
  DataTableViewOptions,
} from '~/components/ui/data-table'
import { Switch } from '~/components/ui/switch'
import type * as apiTypes from '~/typings/api'

const dataTableRef =
  ref<ComponentExposed<typeof DataTable<apiTypes.Route, apiTypes.Route>>>()

const { $api } = useNuxtApp()
const rootStore = useRootStore()
const { fetchRoutes } = rootStore
const { routesData } = storeToRefs(rootStore)

const columnHelper = createColumnHelper<apiTypes.Route>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columns: ColumnDef<apiTypes.Route, any>[] = [
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
  columnHelper.accessor('node', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
    cell: ({ row }) => row.original.node.name,
    sortingFn: (a, b) =>
      a.original.node.name.localeCompare(b.original.node.name),
  }),
  columnHelper.accessor('prefix', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
  }),
  columnHelper.accessor('enabled', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
    cell: ({ row }) =>
      h(Switch, {
        checked: row.original.enabled,
        'onUpdate:checked': async () => {
          await $api(
            `/api/v1/routes/${row.original.id}/${row.original.enabled ? 'disable' : 'enable'}`,
            {
              method: 'post',
            },
          )

          await fetchRoutes()
        },
      }),
  }),
  columnHelper.accessor('advertised', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
    cell: ({ row }) =>
      row.original.advertised
        ? h(CheckCircledIcon, { class: 'size-6' })
        : h(CrossCircledIcon, { class: 'size-6' }),
  }),
  columnHelper.accessor('isPrimary', {
    header: ({ column }) =>
      h(DataTableColumnHeader, {
        column: column as Column<unknown>,
      }),
    cell: ({ row }) =>
      row.original.isPrimary
        ? h(CheckCircledIcon, { class: 'size-6' })
        : h(CrossCircledIcon, { class: 'size-6' }),
  }),
]

const selectedRows = computed(
  () => dataTableRef.value?.table.getSelectedRowModel().rows || [],
)

const isEnabling = ref(false)

const onEnable = async () => {
  isEnabling.value = true

  try {
    await Promise.all(
      selectedRows.value
        .filter((row) => !row.original.enabled)
        .map((row) =>
          $api(`/api/v1/routes/${row.original.id}/enable`, {
            method: 'post',
          }),
        ) || [],
    )

    await fetchRoutes()
  } catch (err) {
    toast.error((err as Error).name, {
      description: (err as Error).message,
    })
  } finally {
    isEnabling.value = false
  }
}

const isDisabling = ref(false)

const onDisable = async () => {
  isDisabling.value = true

  try {
    await Promise.all(
      selectedRows.value
        .filter((row) => row.original.enabled)
        .map((row) =>
          $api(`/api/v1/routes/${row.original.id}/disable`, {
            method: 'post',
          }),
        ) || [],
    )

    await fetchRoutes()
  } catch (err) {
    toast.error((err as Error).name, {
      description: (err as Error).message,
    })
  } finally {
    isDisabling.value = false
  }
}
</script>

<template>
  <NuxtLayout name="dashboard">
    <ClientOnly>
      <div class="flex flex-1 flex-col gap-2 overflow-auto p-2">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              :disabled="!selectedRows.length || isEnabling"
              @click="onEnable"
            >
              <CheckCircledIcon
                :class="['mr-2 size-4', isEnabling && 'animate-spin']"
              />

              Enable
            </Button>

            <Button
              size="sm"
              variant="destructive"
              :disabled="!selectedRows.length || isDisabling"
              @click="onDisable"
            >
              <CrossCircledIcon
                :class="['mr-2 size-4', isDisabling && 'animate-spin']"
              />

              Disable
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
          :data="routesData?.routes || []"
          :columns
        />
      </div>
    </ClientOnly>
  </NuxtLayout>
</template>
