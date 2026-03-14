import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('@/components/layouts/AppLayout.vue'),
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/views/DashboardView.vue'),
        },
        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/ProductsView.vue'),
        },
        {
          path: 'suppliers',
          name: 'suppliers',
          component: () => import('@/views/SuppliersView.vue'),
        },
        {
          path: 'purchases',
          name: 'purchases',
          component: () => import('@/views/PurchasesView.vue'),
        },
        {
          path: 'sales',
          name: 'sales',
          component: () => import('@/views/SalesView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!to.meta.public && !auth.isAuthenticated) {
    return { name: 'login' }
  }

  if (to.name === 'login' && auth.isAuthenticated) {
    return { name: 'dashboard' }
  }

  // Lazy-load user info if token exists but user data is missing
  if (auth.isAuthenticated && !auth.user) {
    await auth.fetchUser()
  }
})

export default router
