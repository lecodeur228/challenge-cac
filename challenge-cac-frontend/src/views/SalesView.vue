<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import { ShoppingCartIcon, ExclamationTriangleIcon, TrashIcon, ArrowUpTrayIcon, CheckIcon, NoSymbolIcon } from '@heroicons/vue/24/outline'

interface Product { id: number; name: string; sku: string; selling_price: string; stock_quantity: number }
interface Sale { id: number; sale_date: string; total_amount: string; items: any[] }

const sales = ref<Sale[]>([])
const products = ref<Product[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')

const today = new Date().toISOString().slice(0, 10)

interface Item { product_id: number | null; quantity: number; unit_price: number; max_qty: number }

const form = ref({ sale_date: today, items: [] as Item[] })

async function loadData() {
  loading.value = true
  const [sRes, prodRes] = await Promise.all([api.get('/sales'), api.get('/products')])
  sales.value = sRes.data
  products.value = prodRes.data
  loading.value = false
}

onMounted(loadData)

function openForm() {
  form.value = { sale_date: today, items: [{ product_id: null, quantity: 1, unit_price: 0, max_qty: 9999 }] }
  formError.value = ''
  showForm.value = true
}

function addItem() { form.value.items.push({ product_id: null, quantity: 1, unit_price: 0, max_qty: 9999 }) }
function removeItem(i: number) { form.value.items.splice(i, 1) }

function onProductChange(i: number) {
  const item = form.value.items[i]
  if (!item) return
  const product = products.value.find(p => p.id === item.product_id)
  if (product) {
    item.unit_price = Number(product.selling_price)
    item.max_qty = product.stock_quantity
    if (item.quantity > product.stock_quantity) item.quantity = product.stock_quantity
  }
}

const total = computed(() =>
  form.value.items.reduce((s, it) => s + it.quantity * it.unit_price, 0)
)

async function saveSale() {
  if (form.value.items.some(it => !it.product_id)) { formError.value = 'Sélectionnez un produit pour chaque ligne.'; return }
  saving.value = true
  formError.value = ''
  try {
    await api.post('/sales', form.value)
    showForm.value = false
    await loadData()
  } catch (e: any) {
    const errs = e.response?.data?.errors
    if (errs) {
      const msgs = Object.values(errs).flat() as string[]
      formError.value = msgs.join(' ')
    } else formError.value = e.response?.data?.message ?? 'Erreur.'
  } finally { saving.value = false }
}

function fmtMoney(v: string | number) {
  return new Intl.NumberFormat('fr-FR').format(Number(v)) + ' FCFA'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function stockAvailable(pid: number | null) {
  if (!pid) return null
  return products.value.find(p => p.id === pid)?.stock_quantity ?? 0
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Ventes</div>
      <div class="page-desc">{{ sales.length }} vente(s) enregistrée(s)</div>
    </div>
    <button class="btn btn-primary" @click="openForm" id="btn-new-sale">+ Nouvelle vente</button>
  </div>

  <!-- New Sale Form -->
  <div v-if="showForm" class="card" style="margin-bottom:24px">
    <div class="card-header">
      <div class="card-title" style="display:flex;align-items:center;gap:6px;"><ShoppingCartIcon style="width:20px;height:20px" /> Nouvelle vente</div>
      <button class="btn btn-ghost btn-sm" @click="showForm = false">✕ Annuler</button>
    </div>
    <div class="card-body">
      <div v-if="formError" class="alert alert-danger" style="margin-bottom:16px;display:flex;align-items:center;gap:6px;">
        <ExclamationTriangleIcon style="width:18px;height:18px;flex-shrink:0" /> {{ formError }}
      </div>

      <div class="form-group" style="max-width:280px;margin-bottom:16px">
        <label>Date de vente *</label>
        <input type="date" v-model="form.sale_date" id="sale-date" />
      </div>

      <!-- Items -->
      <div style="margin-bottom:12px">
        <label style="margin-bottom:8px;display:block">Produits vendus *</label>
        <div v-for="(item, i) in form.items" :key="i" style="margin-bottom:8px">
          <div class="item-row" style="grid-template-columns:2fr 80px 140px 40px">
            <div class="form-group" style="margin:0">
              <select v-model="item.product_id" @change="onProductChange(i)" :id="'sale-product-'+i">
                <option :value="null" disabled>— Produit —</option>
                <option v-for="p in products" :key="p.id" :value="p.id" :disabled="p.stock_quantity <= 0">
                  {{ p.name }} (stock: {{ p.stock_quantity }}){{ p.stock_quantity <= 0 ? ' (Rupture)' : '' }}
                </option>
              </select>
            </div>
            <div class="form-group" style="margin:0">
              <input type="number" v-model="item.quantity" min="1" :max="item.max_qty" :id="'sale-qty-'+i" />
            </div>
            <div class="form-group" style="margin:0">
              <input type="number" v-model="item.unit_price" min="0" step="0.01" placeholder="Prix unit." :id="'sale-price-'+i" />
            </div>
            <button class="btn btn-danger btn-sm" @click="removeItem(i)" :disabled="form.items.length === 1" title="Supprimer l'article">
              <TrashIcon style="width:16px;height:16px" />
            </button>
          </div>
          <!-- Stock warning -->
          <div v-if="item.product_id" style="font-size:11px;color:var(--text-muted);margin-top:4px;padding:0 2px">
            <span v-if="stockAvailable(item.product_id)! <= 0" style="color:var(--danger);display:flex;align-items:center;gap:4px;">
              <NoSymbolIcon style="width:14px;height:14px" /> Rupture de stock
            </span>
            <span v-else-if="item.quantity > (stockAvailable(item.product_id) ?? 0)" style="color:var(--danger);display:flex;align-items:center;gap:4px;">
              <ExclamationTriangleIcon style="width:14px;height:14px" /> Quantité supérieure au stock disponible ({{ stockAvailable(item.product_id) }})
            </span>
            <span v-else style="color:var(--text-muted)">Stock disponible : {{ stockAvailable(item.product_id) }}</span>
          </div>
        </div>
        <button class="btn btn-secondary btn-sm" @click="addItem" id="btn-add-sale-item">+ Ajouter un article</button>
      </div>

      <!-- Total -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--bg-surface);border-radius:var(--radius-sm);border:1px solid var(--border)">
        <div style="color:var(--text-muted);font-size:13px">Total vente</div>
        <div style="font-size:20px;font-weight:800;color:var(--success)">{{ fmtMoney(total) }}</div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" @click="showForm = false">Annuler</button>
      <button class="btn btn-success" @click="saveSale" :disabled="saving" id="btn-save-sale" style="display:flex;align-items:center;gap:6px;">
        <span v-if="saving" class="spinner" style="width:14px;height:14px"></span>
        <CheckIcon v-if="!saving" style="width:16px;height:16px" />
        {{ saving ? 'Enregistrement…' : 'Valider la vente' }}
      </button>
    </div>
  </div>

  <!-- List -->
  <div class="card">
    <div v-if="loading" class="loading-center"><div class="spinner"></div> Chargement…</div>
    <div v-else-if="!sales.length" class="empty-state">
      <div class="empty-state-icon"><ArrowUpTrayIcon style="width:32px;height:32px;margin:auto" /></div>
      <div class="empty-state-title">Aucune vente enregistrée</div>
    </div>
    <div v-else class="table-container" style="border:none">
      <table>
        <thead>
          <tr><th>#</th><th>Date</th><th>Articles</th><th>Total</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in sales" :key="s.id">
            <td class="fw">#{{ s.id }}</td>
            <td>{{ fmtDate(s.sale_date) }}</td>
            <td><span class="badge badge-accent">{{ s.items?.length ?? 0 }} article(s)</span></td>
            <td style="font-weight:600;color:var(--success)">{{ fmtMoney(s.total_amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
