<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { CubeIcon, ExclamationTriangleIcon } from '@heroicons/vue/24/outline'

const auth = useAuthStore()
const router = useRouter()

const form = reactive({ email: 'admin@stock.com', password: 'password' })
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (!form.email || !form.password) return
  loading.value = true
  error.value = ''
  try {
    await auth.login(form.email, form.password)
    router.push('/dashboard')
  } catch (e: any) {
    const msg = e.response?.data?.message
    const errs = e.response?.data?.errors?.email
    error.value = errs?.[0] ?? msg ?? 'Erreur de connexion.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon"><CubeIcon style="width:32px;height:32px;color:white;" /></div>
        <div style="text-align:center">
          <div class="auth-title">StockManager</div>
          <div class="auth-sub">Connectez-vous à votre espace</div>
        </div>
      </div>

      <form @submit.prevent="handleLogin" style="display:flex;flex-direction:column;gap:16px">
        <div v-if="error" class="alert alert-danger">
          <ExclamationTriangleIcon style="width:18px;height:18px;flex-shrink:0" /> {{ error }}
        </div>

        <div class="form-group">
          <label for="email">Adresse e-mail</label>
          <input id="email" type="email" v-model="form.email" placeholder="admin@stock.com" autocomplete="email" />
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input id="password" type="password" v-model="form.password" placeholder="••••••••" autocomplete="current-password" />
        </div>

        <button type="submit" class="btn btn-primary" :disabled="loading" style="width:100%;padding:12px">
          <span v-if="loading" class="spinner" style="width:16px;height:16px"></span>
          {{ loading ? 'Connexion...' : 'Se connecter' }}
        </button>
      </form>
    </div>
  </div>
</template>
