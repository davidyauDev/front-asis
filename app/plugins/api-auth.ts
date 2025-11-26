export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl + '/api',
    onRequest({ options }) {
      let token = null;

      if (import.meta.client) {
        token = localStorage.getItem("auth_token");
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
