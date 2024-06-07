<script setup lang="ts" generic="TData">
import { ChevronDownIcon } from '@radix-icons/vue'
import type { Table } from '@tanstack/vue-table'
import { startCase } from 'lodash-es'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

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
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="outline">
        Columns <ChevronDownIcon class="ml-2 h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end">
      <DropdownMenuCheckboxItem
        v-for="column in table
          .getAllColumns()
          .filter((column) => column.getCanHide())"
        :key="column.id"
        :checked="column.getIsVisible()"
        @update:checked="
          (value) => {
            column.toggleVisibility(!!value)
          }
        "
      >
        {{ startCase(column.id) }}
      </DropdownMenuCheckboxItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
