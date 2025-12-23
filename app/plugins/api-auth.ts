export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl + '/api',
    onRequest({ options }) {
      let token = null;

      if (import.meta.client) {
         const token1 = useCookie<string | null>('auth_token')
        token = token1.value;
      }

      options.headers.set("Content-Type", "application/json");

      if (token) {
        options.headers.set("Authorization", `Bearer ${token}`);
      }
    },
  });

  return {
    provide: {
      api,
    },
  };
});
