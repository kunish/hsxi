<script setup lang="ts" generic="TData">
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-icons/vue'
import { type Table } from '@tanstack/vue-table'

import { Button } from '~/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'

defineProps<{
  table: Table<TData>
}>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div class="flex flex-wrap items-center justify-between gap-2 px-2">
    <div class="text-sm text-muted-foreground">
      {{ table.getFilteredSelectedRowModel().rows.length }} of
      {{ table.getFilteredRowModel().rows.length }} row(s) selected.
    </div>

    <div class="flex items-center gap-6 lg:gap-8">
      <div class="flex items-center gap-2">
        <p class="text-sm font-medium">Rows per page</p>

        <Select
          :model-value="`${table.getState().pagination.pageSize}`"
          @update:model-value="table.setPageSize"
        >
          <SelectTrigger class="h-8 w-24">
            <SelectValue
              :placeholder="`${table.getState().pagination.pageSize}`"
            />
          </SelectTrigger>

          <SelectContent side="top">
            <SelectItem
              v-for="pageSize in [10, 20, 30, 40, 50]"
              :key="pageSize"
              :value="`${pageSize}`"
            >
              {{ pageSize }}
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div class="flex items-center justify-center text-sm font-medium">
        Page {{ table.getState().pagination.pageIndex + 1 }} of
        {{ table.getPageCount() }}
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          class="hidden size-8 p-0 lg:flex"
          :disabled="!table.getCanPreviousPage()"
          @click="table.setPageIndex(0)"
        >
          <DoubleArrowLeftIcon class="size-4" />
        </Button>

        <Button
          variant="outline"
          class="size-8 p-0"
          :disabled="!table.getCanPreviousPage()"
          @click="table.previousPage()"
        >
          <ChevronLeftIcon class="size-4" />
        </Button>

        <Button
          variant="outline"
          class="size-8 p-0"
          :disabled="!table.getCanNextPage()"
          @click="table.nextPage()"
        >
          <ChevronRightIcon class="size-4" />
        </Button>

        <Button
          variant="outline"
          class="hidden size-8 p-0 lg:flex"
          :disabled="!table.getCanNextPage()"
          @click="table.setPageIndex(table.getPageCount() - 1)"
        >
          <DoubleArrowRightIcon class="size-4" />
        </Button>
      </div>
    </div>
  </div>
</template>
