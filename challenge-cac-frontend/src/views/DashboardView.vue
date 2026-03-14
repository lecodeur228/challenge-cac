<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'
import {
  CubeIcon, ExclamationCircleIcon, ExclamationTriangleIcon,
  BanknotesIcon, ShoppingCartIcon, BuildingOfficeIcon, CheckCircleIcon
} from '@heroicons/vue/24/outline'

interface DashStats {
  total_products: number
  out_of_stock: number
  low_stock: number
  today_sales_count: number
  month_sales_total: number
  recent_sales: any[]
  recent_purchases: any[]
  low_stock_products: any[]
}

const stats = ref<DashStats | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await api.get('/dashboard')
    stats.value = res.data
  } finally {
    loading.value = false
  }
})

function fmtMoney(v: number) {
  return new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 0 }).format(v) + ' FCFA'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function stockBadge(p: any) {
  if (p.stock_status === 'out_of_stock') return { cls: 'badge-danger', label: 'Rupture' }
  if (p.stock_status === 'low_stock')   return { cls: 'badge-warning', label: 'Stock faible' }
  return { cls: 'badge-success', label: 'Normal' }
}
</script>

<template>
  <div v-if="loading" class="loading-center">
    <div class="spinner"></div> Chargement du dashboard…
  </div>

  <template v-else-if="stats">
    <!-- Stat Cards -->
    <div class="stat-grid">
      <div class="stat-card" style="--stat-color: #6366f1; --stat-bg: rgba(99,102,241,0.15)">
        <div class="stat-icon"><CubeIcon style="width:24px;height:24px" /></div>
        <div class="stat-info">
          <div class="stat-label">Total Produits</div>
          <div class="stat-value">{{ stats.total_products }}</div>
          <div class="stat-sub">dans le catalogue</div>
        </div>
      </div>
      <div class="stat-card" style="--stat-color: #ef4444; --stat-bg: rgba(239,68,68,0.15)">
        <div class="stat-icon"><ExclamationCircleIcon style="width:24px;height:24px" /></div>
        <div class="stat-info">
          <div class="stat-label">En rupture</div>
          <div class="stat-value">{{ stats.out_of_stock }}</div>
          <div class="stat-sub">produits à stock zéro</div>
        </div>
      </div>
      <div class="stat-card" style="--stat-color: #f59e0b; --stat-bg: rgba(245,158,11,0.15)">
        <div class="stat-icon"><ExclamationTriangleIcon style="width:24px;height:24px" /></div>
        <div class="stat-info">
          <div class="stat-label">Stock faible</div>
          <div class="stat-value">{{ stats.low_stock }}</div>
          <div class="stat-sub">sous le minimum</div>
        </div>
      </div>
      <div class="stat-card" style="--stat-color: #22c55e; --stat-bg: rgba(34,197,94,0.15)">
        <div class="stat-icon"><BanknotesIcon style="width:24px;height:24px" /></div>
        <div class="stat-info">
          <div class="stat-label">Ventes du mois</div>
          <div class="stat-value" style="font-size:20px">{{ fmtMoney(stats.month_sales_total) }}</div>
          <div class="stat-sub">{{ stats.today_sales_count }} vente(s) aujourd'hui</div>
        </div>
      </div>
    </div>

    <!-- Bottom Grid -->
    <div class="dash-grid">
      <!-- Recent Sales -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Dernières ventes</div>
          <RouterLink to="/sales" class="btn btn-ghost btn-sm">Voir tout →</RouterLink>
        </div>
        <div v-if="!stats.recent_sales.length" class="empty-state" style="padding:30px">
          <div class="empty-state-icon"><ShoppingCartIcon style="width:32px;height:32px;margin:auto" /></div>
          <div class="empty-state-title">Aucune vente</div>
        </div>
        <div class="table-container" v-else style="border:none;border-radius:0">
          <table>
            <thead><tr>
              <th>#</th><th>Date</th><th>Articles</th><th>Total</th>
            </tr></thead>
            <tbody>
              <tr v-for="sale in stats.recent_sales" :key="sale.id">
                <td class="fw">#{{ sale.id }}</td>
                <td>{{ fmtDate(sale.sale_date) }}</td>
                <td>{{ sale.items?.length ?? 0 }} article(s)</td>
                <td><span class="badge badge-success">{{ fmtMoney(Number(sale.total_amount)) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Purchases -->
      <div class="card">
        <div class="card-header">
          <div class="card-title">Derniers achats</div>
          <RouterLink to="/purchases" class="btn btn-ghost btn-sm">Voir tout →</RouterLink>
        </div>
        <div v-if="!stats.recent_purchases.length" class="empty-state" style="padding:30px">
          <div class="empty-state-icon"><BuildingOfficeIcon style="width:32px;height:32px;margin:auto" /></div>
          <div class="empty-state-title">Aucun achat</div>
        </div>
        <div class="table-container" v-else style="border:none;border-radius:0">
          <table>
            <thead><tr>
              <th>#</th><th>Fournisseur</th><th>Date</th><th>Total</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in stats.recent_purchases" :key="p.id">
                <td class="fw">#{{ p.id }}</td>
                <td>{{ p.supplier?.name ?? '–' }}</td>
                <td>{{ fmtDate(p.purchase_date) }}</td>
                <td><span class="badge badge-accent">{{ fmtMoney(Number(p.total_amount)) }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Products -->
      <div class="card" style="grid-column: 1 / -1">
        <div class="card-header">
          <div class="card-title" style="display:flex;align-items:center;gap:6px">
            <ExclamationTriangleIcon style="width:20px;height:20px;color:var(--warning)" /> Produits en alerte stock
          </div>
          <RouterLink to="/products" class="btn btn-ghost btn-sm">Gérer →</RouterLink>
        </div>
        <div v-if="!stats.low_stock_products.length" class="empty-state" style="padding:30px">
          <div class="empty-state-icon"><CheckCircleIcon style="width:32px;height:32px;margin:auto;color:var(--success)" /></div>
          <div class="empty-state-title">Tous les produits ont un stock suffisant !</div>
        </div>
        <div class="table-container" v-else style="border:none;border-radius:0">
          <table>
            <thead><tr>
              <th>Produit</th><th>Référence</th><th>Stock</th><th>Minimum</th><th>État</th>
            </tr></thead>
            <tbody>
              <tr v-for="p in stats.low_stock_products" :key="p.id">
                <td class="fw">{{ p.name }}</td>
                <td><code style="font-size:11px;color:var(--text-muted)">{{ p.sku }}</code></td>
                <td :style="p.stock_quantity <= 0 ? 'color:var(--danger);font-weight:700' : 'color:var(--warning);font-weight:600'">{{ p.stock_quantity }}</td>
                <td>{{ p.minimum_stock }}</td>
                <td><span class="badge" :class="stockBadge(p).cls">{{ stockBadge(p).label }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
</template>
