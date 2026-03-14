<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import api from '@/api/axios'

interface Product {
  id: number
  name: string
  sku: string
  description: string
  purchase_price: string
  selling_price: string
  stock_quantity: number
  minimum_stock: number
  supplier_id: number | null
  supplier?: { id: number; name: string }
  stock_status: string
}

interface Supplier { id: number; name: string }

const products = ref<Product[]>([])
const suppliers = ref<Supplier[]>([])
const loading = ref(true)
const error = ref('')
const search = ref('')
const showModal = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleteConfirm = ref<Product | null>(null)

const emptyForm = () => ({
  name: '', sku: '', description: '',
  purchase_price: '', selling_price: '',
  stock_quantity: 0, minimum_stock: 0, supplier_id: null as number | null,
})

const form = ref(emptyForm())
const editId = ref<number | null>(null)
const formErrors = ref<Record<string, string>>({})

async function loadData() {
  loading.value = true
  try {
    const [pRes, sRes] = await Promise.all([
      api.get('/products', { params: { search: search.value } }),
      api.get('/suppliers'),
    ])
    products.value = pRes.data
    suppliers.value = sRes.data
  } catch { error.value = 'Erreur de chargement.' }
  finally { loading.value = false }
}

let searchTimeout: ReturnType<typeof setTimeout>
watch(search, () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadData, 350)
})

onMounted(loadData)

function openCreate() {
  form.value = emptyForm()
  editId.value = null
  editMode.value = false
  formErrors.value = {}
  showModal.value = true
}

function openEdit(p: Product) {
  form.value = {
    name: p.name, sku: p.sku, description: p.description ?? '',
    purchase_price: p.purchase_price, selling_price: p.selling_price,
    stock_quantity: p.stock_quantity, minimum_stock: p.minimum_stock,
    supplier_id: p.supplier_id,
  }
  editId.value = p.id
  editMode.value = true
  formErrors.value = {}
  showModal.value = true
}

async function saveProduct() {
  saving.value = true
  formErrors.value = {}
  try {
    if (editMode.value && editId.value) {
      await api.put(`/products/${editId.value}`, form.value)
    } else {
      await api.post('/products', form.value)
    }
    showModal.value = false
    await loadData()
  } catch (e: any) {
    if (e.response?.status === 422) {
      const errs = e.response.data.errors || {}
      Object.keys(errs).forEach(k => { formErrors.value[k] = errs[k][0] })
    } else {
      error.value = e.response?.data?.message ?? 'Erreur.'
    }
  } finally { saving.value = false }
}

async function deleteProduct() {
  if (!deleteConfirm.value) return
  try {
    await api.delete(`/products/${deleteConfirm.value.id}`)
    deleteConfirm.value = null
    await loadData()
  } catch { error.value = 'Impossible de supprimer ce produit.' }
}

function fmtMoney(v: string | number) {
  return new Intl.NumberFormat('fr-FR').format(Number(v)) + ' FCFA'
}

function stockBadge(s: string) {
  if (s === 'out_of_stock') return { cls: 'badge-danger', label: '🚫 Rupture' }
  if (s === 'low_stock')   return { cls: 'badge-warning', label: '⚠️ Faible' }
  return { cls: 'badge-success', label: '✅ Normal' }
}
</script>

<template>
  <!-- Page Header -->
  <div class="page-header">
    <div class="page-header-left">
      <div class="page-title">Produits</div>
      <div class="page-desc">{{ products.length }} produit(s) dans le catalogue</div>
    </div>
    <button class="btn btn-primary" @click="openCreate" id="btn-add-product">+ Ajouter un produit</button>
  </div>

  <!-- Search -->
  <div class="card" style="margin-bottom:20px">
    <div class="card-body" style="padding:16px">
      <div class="search-bar">
        <span class="search-icon">🔍</span>
        <input v-model="search" placeholder="Rechercher par nom ou référence…" id="product-search" />
      </div>
    </div>
  </div>

  <!-- Error -->
  <div v-if="error" class="alert alert-danger" style="margin-bottom:16px">
    <span>⚠️</span> {{ error }}
  </div>

  <!-- Table -->
  <div class="card">
    <div v-if="loading" class="loading-center"><div class="spinner"></div> Chargement…</div>
    <div v-else-if="!products.length" class="empty-state">
      <div class="empty-state-icon">📦</div>
      <div class="empty-state-title">Aucun produit trouvé</div>
      <div class="empty-state-desc">Ajoutez votre premier produit pour commencer.</div>
    </div>
    <div v-else class="table-container" style="border:none">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Nom</th><th>Référence</th><th>Fournisseur</th>
            <th>Prix achat</th><th>Prix vente</th><th>Stock</th><th>Min.</th><th>État</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in products" :key="p.id">
            <td>{{ p.id }}</td>
            <td class="fw">{{ p.name }}</td>
            <td><code style="font-size:11px;color:var(--text-muted)">{{ p.sku }}</code></td>
            <td>{{ p.supplier?.name ?? '—' }}</td>
            <td>{{ fmtMoney(p.purchase_price) }}</td>
            <td>{{ fmtMoney(p.selling_price) }}</td>
            <td :style="p.stock_quantity <= 0 ? 'color:var(--danger);font-weight:700' : p.stock_quantity <= p.minimum_stock ? 'color:var(--warning);font-weight:600' : ''">
              {{ p.stock_quantity }}
            </td>
            <td>{{ p.minimum_stock }}</td>
            <td><span class="badge" :class="stockBadge(p.stock_status).cls">{{ stockBadge(p.stock_status).label }}</span></td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-secondary btn-sm" @click="openEdit(p)">✏️ Éditer</button>
                <button class="btn btn-danger btn-sm" @click="deleteConfirm = p">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Add/Edit Modal -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ editMode ? '✏️ Modifier le produit' : '+ Nouveau produit' }}</div>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label>Nom du produit *</label>
              <input v-model="form.name" placeholder="Ex : Téléphone XYZ" id="product-name" />
              <div v-if="formErrors.name" class="form-error">{{ formErrors.name }}</div>
            </div>
            <div class="form-group">
              <label>Référence (SKU) *</label>
              <input v-model="form.sku" placeholder="Ex : TLF-001" id="product-sku" />
              <div v-if="formErrors.sku" class="form-error">{{ formErrors.sku }}</div>
            </div>
          </div>

          <div class="form-group">
            <label>Description</label>
            <textarea v-model="form.description" placeholder="Description du produit…" rows="2"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Prix d'achat (FCFA) *</label>
              <input type="number" v-model="form.purchase_price" min="0" step="0.01" id="product-purchase-price" />
              <div v-if="formErrors.purchase_price" class="form-error">{{ formErrors.purchase_price }}</div>
            </div>
            <div class="form-group">
              <label>Prix de vente (FCFA) *</label>
              <input type="number" v-model="form.selling_price" min="0" step="0.01" id="product-selling-price" />
              <div v-if="formErrors.selling_price" class="form-error">{{ formErrors.selling_price }}</div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Quantité en stock</label>
              <input type="number" v-model="form.stock_quantity" min="0" id="product-stock" />
            </div>
            <div class="form-group">
              <label>Stock minimum</label>
              <input type="number" v-model="form.minimum_stock" min="0" id="product-min-stock" />
            </div>
          </div>

          <div class="form-group">
            <label>Fournisseur</label>
            <select v-model="form.supplier_id" id="product-supplier">
              <option :value="null">— Aucun —</option>
              <option v-for="s in suppliers" :key="s.id" :value="s.id">{{ s.name }}</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Annuler</button>
          <button class="btn btn-primary" @click="saveProduct" :disabled="saving" id="btn-save-product">
            <span v-if="saving" class="spinner" style="width:14px;height:14px"></span>
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Delete Confirm Modal -->
  <Teleport to="body">
    <div v-if="deleteConfirm" class="modal-overlay" @click.self="deleteConfirm = null">
      <div class="modal" style="max-width:420px">
        <div class="modal-header">
          <div class="modal-title">🗑️ Supprimer le produit</div>
          <button class="modal-close" @click="deleteConfirm = null">×</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-secondary)">
            Êtes-vous sûr de vouloir supprimer <strong style="color:var(--text-primary)">{{ deleteConfirm.name }}</strong> ?
            Cette action est irréversible.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteConfirm = null">Annuler</button>
          <button class="btn btn-danger" @click="deleteProduct" id="btn-confirm-delete">Supprimer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
