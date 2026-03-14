<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const pageTitles: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Vue d\'ensemble de votre stock' },
  products:  { title: 'Produits', subtitle: 'Gérez votre catalogue produits' },
  suppliers: { title: 'Fournisseurs', subtitle: 'Gérez vos fournisseurs' },
  purchases: { title: 'Achats', subtitle: 'Entrées de stock' },
  sales:     { title: 'Ventes', subtitle: 'Sorties de stock' },
}

function currentPage() {
  const name = route.name as string
  return pageTitles[name] || { title: 'Stock Manager', subtitle: '' }
}

function userInitial() {
  return auth.user?.name?.charAt(0).toUpperCase() ?? 'A'
}

async function handleLogout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">📦</div>
        <div>
          <div class="sidebar-logo-text">StockManager</div>
          <div class="sidebar-logo-sub">MVP v1.0</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-label">Menu</div>

        <RouterLink to="/dashboard" class="nav-link" :class="{ active: route.name === 'dashboard' }">
          <span class="nav-icon">📊</span> Dashboard
        </RouterLink>
        <RouterLink to="/products" class="nav-link" :class="{ active: route.name === 'products' }">
          <span class="nav-icon">📦</span> Produits
        </RouterLink>
        <RouterLink to="/suppliers" class="nav-link" :class="{ active: route.name === 'suppliers' }">
          <span class="nav-icon">🏭</span> Fournisseurs
        </RouterLink>

        <div class="sidebar-label">Mouvements</div>

        <RouterLink to="/purchases" class="nav-link" :class="{ active: route.name === 'purchases' }">
          <span class="nav-icon">⬇️</span> Achats
        </RouterLink>
        <RouterLink to="/sales" class="nav-link" :class="{ active: route.name === 'sales' }">
          <span class="nav-icon">⬆️</span> Ventes
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">{{ userInitial() }}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ auth.user?.name ?? 'Admin' }}</div>
            <div class="sidebar-user-role">Administrateur</div>
          </div>
          <button class="logout-btn" title="Se déconnecter" @click="handleLogout">⏻</button>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="main-content">
      <header class="topbar">
        <div>
          <div class="topbar-title">{{ currentPage().title }}</div>
          <div class="topbar-subtitle">{{ currentPage().subtitle }}</div>
        </div>
        <div class="topbar-spacer"></div>
        <div style="font-size:13px; color:var(--text-muted)">{{ new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) }}</div>
      </header>

      <main class="page-body">
        <RouterView />
      </main>
    </div>
  </div>
</template>
