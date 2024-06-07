<script setup lang="ts">
import { CircleUserIcon, MenuIcon } from 'lucide-vue-next'

import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'

const { selectedNav } = storeToRefs(useRootStore())

const title = computed(
  () => `HSXI - ${selectedNav?.value?.label || 'Dashboard'}`,
)

useSeoMeta({
  title,
})
</script>

<template>
  <div
    class="grid min-h-screen md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
  >
    <div class="hidden border-r bg-muted/40 md:block">
      <div class="flex h-full max-h-screen flex-col gap-2">
        <div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <TheLogo />
        </div>

        <div class="flex-1">
          <ClientOnly>
            <TheNavs />
          </ClientOnly>
        </div>
      </div>
    </div>

    <div class="flex min-w-0 flex-col">
      <header
        class="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6"
      >
        <Sheet>
          <SheetTrigger as-child>
            <Button variant="outline" size="icon" class="shrink-0 md:hidden">
              <MenuIcon class="size-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" class="flex flex-col">
            <TheLogo />

            <ClientOnly>
              <TheNavs />
            </ClientOnly>
          </SheetContent>
        </Sheet>

        <div class="flex-1" />

        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="secondary" size="icon" class="rounded-full">
              <CircleUserIcon class="size-5" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
        <div v-if="selectedNav" class="flex items-center">
          <h1 class="text-lg font-semibold md:text-2xl">
            {{ selectedNav.label }}
          </h1>
        </div>

        <div class="flex flex-1 rounded-lg border border-dashed shadow-sm">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
