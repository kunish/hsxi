export default defineNuxtPlugin(() => {
  const api = $fetch.create({
    async onRequest({ options }) {
      const apiKey = useCookie('apiKey').value

      if (!apiKey) {
        await navigateTo('/setup', { replace: true })

        return
      }

      const headers = (options.headers ||= {})

      if (Array.isArray(headers)) {
        headers.push(['Authorization', `Bearer ${apiKey}`])
      } else if (headers instanceof Headers) {
        headers.set('Authorization', `Bearer ${apiKey}`)
      } else {
        headers.Authorization = `Bearer ${apiKey}`
      }
    },

    async onResponseError({ response }) {
      if (response.status === 401) {
        await navigateTo('/setup', { replace: true })
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
