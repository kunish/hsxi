import { BookKeyIcon, HexagonIcon, RouteIcon, UserIcon } from 'lucide-vue-next'

import type * as apiTypes from '~/typings/api'

export const useRootStore = defineStore('root', () => {
  const { $api } = useNuxtApp()

  const { execute: fetchApiKeys, data: apiKeysData } = useAsyncData(
    () =>
      $api<{
        apiKeys: apiTypes.ApiKey[]
      }>('/api/v1/apikey'),
    {
      default: () => ({
        apiKeys: [],
      }),
    },
  )

  const { execute: fetchNodes, data: nodesData } = useAsyncData(
    () =>
      $api<{
        nodes: apiTypes.Node[]
      }>('/api/v1/node'),
    {
      default: () => ({
        nodes: [],
      }),
    },
  )

  const { execute: fetchRoutes, data: routesData } = useAsyncData(
    () =>
      $api<{
        routes: apiTypes.Route[]
      }>('/api/v1/routes'),
    {
      default: () => ({
        routes: [],
      }),
    },
  )

  const { execute: fetchUsers, data: usersData } = useAsyncData(
    () =>
      $api<{
        users: apiTypes.User[]
      }>('/api/v1/user'),
    {
      default: () => ({
        users: [],
      }),
    },
  )

  const navs = computed(() => [
    {
      label: 'Users',
      href: '/users',
      icon: UserIcon,
      count: usersData.value?.users.length,
    },
    {
      label: 'Nodes',
      href: '/nodes',
      icon: HexagonIcon,
      count: nodesData.value?.nodes.length,
    },
    {
      label: 'Routes',
      href: '/routes',
      icon: RouteIcon,
      count: routesData.value?.routes.length,
    },
    {
      label: 'API Keys',
      href: '/api-keys',
      icon: BookKeyIcon,
      count: apiKeysData.value?.apiKeys.length,
    },
  ])

  const router = useRouter()

  const selectedNav = computed(() =>
    navs.value.find((nav) => nav.href === router.currentRoute.value.path),
  )

  return {
    apiKeysData,
    nodesData,
    routesData,
    usersData,
    fetchApiKeys,
    fetchNodes,
    fetchRoutes,
    fetchUsers,
    navs,
    selectedNav,
  }
})
