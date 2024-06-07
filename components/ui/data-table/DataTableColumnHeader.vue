<script setup lang="ts" generic="TData">
import { ArrowDownIcon, ArrowUpIcon, CaretSortIcon } from '@radix-icons/vue'
import type { Column } from '@tanstack/vue-table'
import { startCase } from 'lodash-es'

import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils'

const props = defineProps<{
  title?: string
  column: Column<TData>
}>()

const headerDisplay = computed(() => props.title || startCase(props.column.id))
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div
    v-if="column.getCanSort()"
    :class="cn('flex items-center space-x-2', $attrs.class ?? '')"
  >
    <Button
      variant="ghost"
      size="sm"
      class="-ml-3 h-8 data-[state=open]:bg-accent"
      @click="(event) => column.getToggleSortingHandler()?.(event)"
    >
      <span>{{ headerDisplay }}</span>

      <ArrowDownIcon
        v-if="column.getIsSorted() === 'desc'"
        class="ml-2 size-4"
      />

      <ArrowUpIcon
        v-else-if="column.getIsSorted() === 'asc'"
        class="ml-2 size-4"
      />

      <CaretSortIcon v-else class="ml-2 size-4" />
    </Button>
  </div>

  <div v-else :class="$attrs.class">
    {{ headerDisplay }}
  </div>
</template>
