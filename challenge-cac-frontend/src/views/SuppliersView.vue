<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api/axios'

interface Supplier { id: number; name: string; phone: string; email: string; address: string }

const suppliers = ref<Supplier[]>([])
const loading = ref(true)
const error = ref('')
const showModal = ref(false)
const editMode = ref(false)
const saving = ref(false)
const deleteConfirm = ref<Supplier | null>(null)

const emptyForm = () => ({ name: '', phone: '', email: '', address: '' })
const form = ref(emptyForm())
const editId = ref<number | null>(null)
const formErrors = ref<Record<string, string>>({})

async function loadData() {
  loading.value = true
  try {
    const res = await api.get('/suppliers')
    suppliers.value = res.data
  } finally { loading.value = false }
}

onMounted(loadData)

function openCreate() {
  form.value = emptyForm()
  editId.value = null
  editMode.value = false
  formErrors.value = {}
  showModal.value = true
}

function openEdit(s: Supplier) {
  form.value = { name: s.name, phone: s.phone ?? '', email: s.email ?? '', address: s.address ?? '' }
  editId.value = s.id
  editMode.value = true
  formErrors.value = {}
  showModal.value = true
}

async function save() {
  saving.value = true
  formErrors.value = {}
  try {
    if (editMode.value && editId.value) {
      await api.put(`/suppliers/${editId.value}`, form.value)
    } else {
      await api.post('/suppliers', form.value)
    }
    showModal.value = false
    await loadData()
  } catch (e: any) {
    if (e.response?.status === 422) {
      const errs = e.response.data.errors || {}
      Object.keys(errs).forEach(k => { formErrors.value[k] = errs[k][0] })
    }
  } finally { saving.value = false }
}

async function deleteSupplier() {
  if (!deleteConfirm.value) return
  try {
    await api.delete(`/suppliers/${deleteConfirm.value.id}`)
    deleteConfirm.value = null
    await loadData()
  } catch (e: any) {
    error.value = e.response?.data?.message ?? 'Erreur lors de la suppression.'
  }
}
</script>

<template>
  <div class="page-header">
    <div>
      <div class="page-title">Fournisseurs</div>
      <div class="page-desc">{{ suppliers.length }} fournisseur(s) enregistré(s)</div>
    </div>
    <button class="btn btn-primary" @click="openCreate" id="btn-add-supplier">+ Ajouter un fournisseur</button>
  </div>

  <div v-if="error" class="alert alert-danger" style="margin-bottom:16px"><span>⚠️</span> {{ error }}</div>

  <div class="card">
    <div v-if="loading" class="loading-center"><div class="spinner"></div> Chargement…</div>
    <div v-else-if="!suppliers.length" class="empty-state">
      <div class="empty-state-icon">🏭</div>
      <div class="empty-state-title">Aucun fournisseur</div>
      <div class="empty-state-desc">Ajoutez votre premier fournisseur.</div>
    </div>
    <div v-else class="table-container" style="border:none">
      <table>
        <thead>
          <tr><th>#</th><th>Nom</th><th>Téléphone</th><th>Email</th><th>Adresse</th><th>Actions</th></tr>
        </thead>
        <tbody>
          <tr v-for="s in suppliers" :key="s.id">
            <td>{{ s.id }}</td>
            <td class="fw">{{ s.name }}</td>
            <td>{{ s.phone || '—' }}</td>
            <td>{{ s.email || '—' }}</td>
            <td>{{ s.address || '—' }}</td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-secondary btn-sm" @click="openEdit(s)">✏️ Éditer</button>
                <button class="btn btn-danger btn-sm" @click="deleteConfirm = s">🗑️</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Modal -->
  <Teleport to="body">
    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title">{{ editMode ? '✏️ Modifier' : '+ Nouveau fournisseur' }}</div>
          <button class="modal-close" @click="showModal = false">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nom *</label>
            <input v-model="form.name" placeholder="Nom du fournisseur" id="supplier-name" />
            <div v-if="formErrors.name" class="form-error">{{ formErrors.name }}</div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Téléphone</label>
              <input v-model="form.phone" placeholder="+225 0700000000" id="supplier-phone" />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input type="email" v-model="form.email" placeholder="contact@fournisseur.com" id="supplier-email" />
            </div>
          </div>
          <div class="form-group">
            <label>Adresse</label>
            <textarea v-model="form.address" placeholder="Adresse complète" rows="2"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showModal = false">Annuler</button>
          <button class="btn btn-primary" @click="save" :disabled="saving" id="btn-save-supplier">
            <span v-if="saving" class="spinner" style="width:14px;height:14px"></span>
            {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Delete Confirm -->
  <Teleport to="body">
    <div v-if="deleteConfirm" class="modal-overlay" @click.self="deleteConfirm = null">
      <div class="modal" style="max-width:400px">
        <div class="modal-header">
          <div class="modal-title">🗑️ Supprimer le fournisseur</div>
          <button class="modal-close" @click="deleteConfirm = null">×</button>
        </div>
        <div class="modal-body">
          <p style="color:var(--text-secondary)">Supprimer <strong style="color:var(--text-primary)">{{ deleteConfirm.name }}</strong> ?</p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="deleteConfirm = null">Annuler</button>
          <button class="btn btn-danger" @click="deleteSupplier" id="btn-confirm-delete-supplier">Supprimer</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
