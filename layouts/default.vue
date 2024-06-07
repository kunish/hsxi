<script setup lang="ts">
import { ConfigProvider } from 'radix-vue'

import { Toaster } from '~/components/ui/toast'

const useIdFunction = () => useId()
</script>

<template>
  <ConfigProvider :use-id="useIdFunction">
    <slot />

    <Toaster />
  </ConfigProvider>
</template>
