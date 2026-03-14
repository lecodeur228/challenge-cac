<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import api from '@/api/axios'
import { ClipboardDocumentListIcon, ExclamationTriangleIcon, TrashIcon, ArrowDownTrayIcon, CheckIcon } from '@heroicons/vue/24/outline'

interface Product { id: number; name: string; sku: string; selling_price: string; stock_quantity: number }
interface Supplier { id: number; name: string }
interface Purchase { id: number; supplier_id: number; supplier?: { name: string }; purchase_date: string; total_amount: string; items: any[] }

const purchases = ref<Purchase[]>([])
const products = ref<Product[]>([])
const suppliers = ref<Supplier[]>([])
const loading = ref(true)
const showForm = ref(false)
const saving = ref(false)
const formError = ref('')

const today = new Date().toISOString().slice(0, 10)

interface Item { product_id: number | null; quantity: number; unit_price: number }

const form = ref({ supplier_id: null as number | null, purchase_date: today, items: [] as Item[] })

async function loadData() {
  loading.value = true
  const [pRes, sRes, prodRes] = await Promise.all([
    api.get('/purchases'),
    api.get('/suppliers'),
    api.get('/products'),
  ])
  purchases.value = pRes.data
  suppliers.value = sRes.data
  products.value = prodRes.data
  loading.value = false
}

onMounted(loadData)

function openForm() {
  form.value = { supplier_id: null, purchase_date: today, items: [{ product_id: null, quantity: 1, unit_price: 0 }] }
  formError.value = ''
  showForm.value = true
}

function addItem() { form.value.items.push({ product_id: null, quantity: 1, unit_price: 0 }) }
function removeItem(i: number) { form.value.items.splice(i, 1) }

function onProductChange(i: number) {
  const item = form.value.items[i]
  if (!item) return
  const product = products.value.find(p => p.id === item.product_id)
  if (product) item.unit_price = Number(product.selling_price)
}

const total = computed(() =>
  form.value.items.reduce((s, it) => s + it.quantity * it.unit_price, 0)
)

async function savePurchase() {
  if (!form.value.supplier_id) { formError.value = 'Veuillez sélectionner un fournisseur.'; return }
  if (form.value.items.some(it => !it.product_id)) { formError.value = 'Sélectionnez un produit pour chaque ligne.'; return }
  saving.value = true
  formError.value = ''
  try {
    await api.post('/purchases', form.value)
    showForm.value = false
    await loadData()
  } catch (e: any) {
    const errs = e.response?.data?.errors
    if (errs) formError.value = Object.values(errs).flat().join(' ')
    else formError.value = e.response?.data?.message ?? 'Erreur.'
  } finally { saving.value = false }
}

function fmtMoney(v: string | number) {
  return new Intl.NumberFormat('fr-FR').format(Number(v)) + ' FCFA'
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Achats</div>
      <div class="page-desc">{{ purchases.length }} commande(s) enregistrée(s)</div>
    </div>
    <button class="btn btn-primary" @click="openForm" id="btn-new-purchase">+ Nouvelle commande</button>
  </div>

  <!-- New Purchase Form -->
  <div v-if="showForm" class="card" style="margin-bottom:24px">
    <div class="card-header">
      <div class="card-title" style="display:flex;align-items:center;gap:6px;"><ClipboardDocumentListIcon style="width:20px;height:20px" /> Nouvelle commande d'achat</div>
      <button class="btn btn-ghost btn-sm" @click="showForm = false">✕ Annuler</button>
    </div>
    <div class="card-body">
      <div v-if="formError" class="alert alert-danger" style="margin-bottom:16px;display:flex;align-items:center;gap:6px;">
        <ExclamationTriangleIcon style="width:18px;height:18px;flex-shrink:0" /> {{ formError }}
      </div>

      <div class="form-row" style="margin-bottom:16px">
        <div class="form-group">
          <label>Fournisseur *</label>
          <select v-model="form.supplier_id" id="purchase-supplier">
            <option :value="null" disabled>— Sélectionner un fournisseur —</option>
            <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Date de commande *</label>
          <input type="date" v-model="form.purchase_date" id="purchase-date" />
        </div>
      </div>

      <!-- Items -->
      <div style="margin-bottom:12px">
        <label style="margin-bottom:8px;display:block">Articles *</label>
        <div v-for="(item, i) in form.items" :key="i" class="item-row" style="margin-bottom:8px;grid-template-columns:2fr 80px 140px 40px">
          <div class="form-group" style="margin:0">
            <select v-model="item.product_id" @change="onProductChange(i)" :id="'purchase-product-'+i">
              <option :value="null" disabled>— Produit —</option>
              <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }} (stock: {{ p.stock_quantity }})</option>
            </select>
          </div>
          <div class="form-group" style="margin:0">
            <input type="number" v-model="item.quantity" min="1" :id="'purchase-qty-'+i" />
          </div>
          <div class="form-group" style="margin:0">
            <input type="number" v-model="item.unit_price" min="0" step="0.01" placeholder="Prix unit." :id="'purchase-price-'+i" />
          </div>
          <button class="btn btn-danger btn-sm" @click="removeItem(i)" :disabled="form.items.length === 1" title="Supprimer l'article">
            <TrashIcon style="width:16px;height:16px" />
          </button>
        </div>
        <button class="btn btn-secondary btn-sm" @click="addItem" id="btn-add-item">+ Ajouter un article</button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--bg-surface);border-radius:var(--radius-sm);border:1px solid var(--border)">
        <div style="color:var(--text-muted);font-size:13px">Total commande</div>
        <div style="font-size:20px;font-weight:800;color:var(--accent-light)">{{ fmtMoney(total) }}</div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" @click="showForm = false">Annuler</button>
      <button class="btn btn-primary" @click="savePurchase" :disabled="saving" id="btn-save-purchase" style="display:flex;align-items:center;gap:6px;">
        <span v-if="saving" class="spinner" style="width:14px;height:14px"></span>
        <CheckIcon v-if="!saving" style="width:16px;height:16px" />
        {{ saving ? 'Enregistrement…' : 'Valider la commande' }}
      </button>
    </div>
  </div>

  <!-- List -->
  <div class="card">
    <div v-if="loading" class="loading-center"><div class="spinner"></div> Chargement…</div>
    <div v-else-if="!purchases.length" class="empty-state">
      <div class="empty-state-icon"><ArrowDownTrayIcon style="width:32px;height:32px;margin:auto" /></div>
      <div class="empty-state-title">Aucun achat enregistré</div>
    </div>
    <div v-else class="table-container" style="border:none">
      <table>
        <thead>
          <tr><th>#</th><th>Fournisseur</th><th>Date</th><th>Articles</th><th>Total</th></tr>
        </thead>
        <tbody>
          <tr v-for="p in purchases" :key="p.id">
            <td class="fw">#{{ p.id }}</td>
            <td>{{ p.supplier?.name ?? '—' }}</td>
            <td>{{ fmtDate(p.purchase_date) }}</td>
            <td><span class="badge badge-accent">{{ p.items?.length ?? 0 }} article(s)</span></td>
            <td style="font-weight:600;color:var(--text-primary)">{{ fmtMoney(p.total_amount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
