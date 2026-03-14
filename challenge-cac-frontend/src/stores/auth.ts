import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api/axios'

export interface User {
  id: number
  name: string
  email: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('auth_token'))
  const user = ref<User | null>(null)

  const isAuthenticated = computed(() => !!token.value)

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login', { email, password })
    token.value = res.data.token
    user.value = res.data.user
    localStorage.setItem('auth_token', res.data.token)
  }

  async function fetchUser() {
    if (!token.value) return
    try {
      const res = await api.get('/auth/me')
      user.value = res.data
    } catch {
      logout()
    }
  }

  function logout() {
    if (token.value) {
      api.post('/auth/logout').catch(() => {})
    }
    token.value = null
    user.value = null
    localStorage.removeItem('auth_token')
  }

  return { token, user, isAuthenticated, login, logout, fetchUser }
})
