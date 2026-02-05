import { createApp } from "vue";
import { createRouter, createWebHistory } from "vue-router";
import "./style.css";
import App from "./App.vue";
import TimeRecording from "./views/TimeRecording.vue";
import MemberManagement from "./views/MemberManagement.vue";
import ListMembers from "./views/ListMembers.vue";
import Login from "./views/Login.vue";
import { authService, authState } from "./services/auth";

// Initialize auth state from local storage
authService.init();

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      redirect: "/time-recording",
    },
    {
      path: "/login",
      name: "Login",
      component: Login,
      meta: { requiresAuth: false },
    },
    {
      path: "/time-recording",
      name: "TimeRecording",
      component: TimeRecording,
      meta: { requiresAuth: true },
    },
    {
      path: "/member-management",
      name: "MemberManagement",
      component: MemberManagement,
      meta: { requiresAuth: true },
    },
    {
      path: "/list-members",
      name: "ListMembers",
      component: ListMembers,
      meta: { requiresAuth: true },
    },
  ],
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = authState.isAuthenticated;

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login if page requires auth and user is not logged in
    next("/login");
  } else if (to.path === "/login" && isAuthenticated) {
    // Redirect to home if user is already logged in and tries to access login page
    next("/time-recording");
  } else {
    next();
  }
});

const app = createApp(App);
app.use(router);
app.mount("#app");
