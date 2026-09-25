import { createRouter, createWebHistory } from "vue-router";
import AdminLogin from "../views/AdminLogin.vue";
import AdminDashboard from "../views/AdminDashboard.vue";
import AdminSettings from "../views/AdminSettings.vue";

const routes = [
  { path: "/", redirect: "/login" },
  { path: "/login", name: "Login", component: AdminLogin },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: AdminDashboard,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "Settings",
    component: AdminSettings,
    meta: { requiresAuth: true },
  },
  { path: "/:pathMatch(.*)*", redirect: "/login" },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation Guard to protect routes
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("adminToken");

  if (to.meta.requiresAuth && !token) {
    // Prevent infinite stack loop by redirecting only if not already heading to login
    if (to.path !== "/login") {
      next("/login");
    } else {
      next();
    }
  } else if (to.path === "/login" && token) {
    // If user is already authenticated and tries to visit /login, redirect to /dashboard
    next("/dashboard");
  } else {
    next();
  }
});

export default router;