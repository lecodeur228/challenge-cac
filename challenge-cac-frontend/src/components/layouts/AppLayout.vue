<script setup lang="ts">
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { CubeIcon, ChartBarIcon, BuildingOfficeIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, PowerIcon } from '@heroicons/vue/24/outline'

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
        <div class="sidebar-logo-icon"><CubeIcon class="w-6 h-6 text-white" style="width:20px;height:20px;" /></div>
        <div>
          <div class="sidebar-logo-text">StockManager</div>
          <div class="sidebar-logo-sub">MVP v1.0</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="sidebar-label">Menu</div>

        <RouterLink to="/dashboard" class="nav-link" :class="{ active: route.name === 'dashboard' }">
          <ChartBarIcon class="nav-icon" style="width:18px;height:18px;" /> Dashboard
        </RouterLink>
        <RouterLink to="/products" class="nav-link" :class="{ active: route.name === 'products' }">
          <CubeIcon class="nav-icon" style="width:18px;height:18px;" /> Produits
        </RouterLink>
        <RouterLink to="/suppliers" class="nav-link" :class="{ active: route.name === 'suppliers' }">
          <BuildingOfficeIcon class="nav-icon" style="width:18px;height:18px;" /> Fournisseurs
        </RouterLink>

        <div class="sidebar-label">Mouvements</div>

        <RouterLink to="/purchases" class="nav-link" :class="{ active: route.name === 'purchases' }">
          <ArrowDownTrayIcon class="nav-icon" style="width:18px;height:18px;" /> Achats
        </RouterLink>
        <RouterLink to="/sales" class="nav-link" :class="{ active: route.name === 'sales' }">
          <ArrowUpTrayIcon class="nav-icon" style="width:18px;height:18px;" /> Ventes
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">{{ userInitial() }}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">{{ auth.user?.name ?? 'Admin' }}</div>
            <div class="sidebar-user-role">Administrateur</div>
          </div>
          <button class="logout-btn" title="Se déconnecter" @click="handleLogout">
            <PowerIcon style="width:20px;height:20px;" />
          </button>
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
