<script setup lang="ts">
const { navs, selectedNav } = storeToRefs(useRootStore())
</script>

<template>
  <nav class="grid items-start px-2 text-sm font-medium lg:px-4">
    <NuxtLink
      v-for="nav in navs"
      :key="nav.href"
      :class="[
        'flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary',
        selectedNav?.href === nav.href
          ? 'bg-muted text-primary'
          : 'text-muted-foreground',
      ]"
      :href="nav.href"
    >
      <component :is="nav.icon" class="size-4" />

      {{ nav.label }}

      <Badge
        class="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
      >
        {{ nav.count }}
      </Badge>
    </NuxtLink>
  </nav>
</template>
