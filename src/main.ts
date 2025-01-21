import "./assets/main.css";

import { createApp } from "vue";
import { VueQueryPlugin, QueryClient } from "@tanstack/vue-query";

import App from "./App.vue";
import router from "./router";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const app = createApp(App);

app.use(router);

app.use(VueQueryPlugin, {
  queryClient,
});

app.mount("#app");
