import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const { headscaleApi } = useRuntimeConfig()
  const target = joinURL(headscaleApi, event.path)

  return proxyRequest(event, target)
})
