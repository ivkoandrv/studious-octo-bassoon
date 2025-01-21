import { createRouter, createWebHistory } from "vue-router";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: () => import("@/views/InfiniteScrollView.vue"),
    },
    {
      path: "/sockets",
      name: "sockets",
      component: () => import("@/views/SocketsView.vue"),
    },
  ],
});

export default router;
