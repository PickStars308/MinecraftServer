<script lang="ts" setup>
import {onMounted, reactive, ref} from 'vue'
import {addToast} from '@/components/toast'
import {useRoute, useRouter} from 'vue-router'
import {loginAdmin} from '@/api/adminAuthApi'

onMounted(() => {
  console.log('AdminLoginView mounted')
})

const submitting = ref(false)
const router = useRouter()
const route = useRoute()
const form = reactive({
  username: '',
  password: '',
  remember: true
})

const submitLogin = async () => {
  if (!form.username.trim() || !form.password.trim()) {
    addToast('请输入用户名和密码', 'warning')
    return
  }

  submitting.value = true
  try {
    const response = await loginAdmin(form.username.trim(), form.password)
    console.log('[登录] 后端响应:', response)

    if (response.success) {
      addToast(response.message || '登录成功', 'success')

      setTimeout(() => {
        const redirectTarget =
            typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/admin')
                ? route.query.redirect
                : '/admin/panel'
        router.push(redirectTarget)
      }, 100)
    } else {

      addToast(response.message || '用户名或密码错误', 'error')
    }
  } catch (error: any) {
    console.error('[登录] 异常:', error)

    addToast(error.message || '登录失败，请稍后重试', 'error')
  } finally {
    submitting.value = false
  }
}

</script>

<template>
  <section class="admin-login-view">
    <div class="login-card">
      <p class="eyebrow">管理员登录</p>
      <h1 class="title">管理面板</h1>
      <p class="subtitle">请登录以访问管理员功能</p>

      <form class="form" @submit.prevent="submitLogin">
        <label class="field">
          <span class="label">用户名</span>
          <input
              v-model="form.username"
              autocomplete="username"
              class="input"
              placeholder="请输入用户名"
              type="text"
          />
        </label>

        <label class="field">
          <span class="label">密码</span>
          <input
              v-model="form.password"
              autocomplete="current-password"
              class="input"
              placeholder="请输入密码"
              type="password"
          />
        </label>

        <label class="remember-row">
          <input v-model="form.remember" class="checkbox" type="checkbox"/>
          <span>记住我</span>
        </label>

        <button :disabled="submitting" class="submit-btn" type="submit">
          {{ submitting ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.admin-login-view {
  width: 100%;
  max-width: 980px;
  padding: clamp(16px, 5vw, 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.login-card {
  width: min(100%, 100%);
  padding: clamp(22px, 4vw, 34px);
  border-radius: 24px;
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  transition: all 0.28s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 40px rgba(0, 0, 0, 0.16);
  }
}

.eyebrow {
  font-size: 0.82rem;
  color: #fb7ebb;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.title {
  font-size: clamp(1.8rem, 4vw, 2.2rem);
  color: var(--color-text-black);
  margin-bottom: 8px;
}

.subtitle {
  color: var(--color-text-black);
  opacity: 0.8;
  margin-bottom: 24px;
  line-height: 1.5;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 0.95rem;
  color: var(--color-text-black);
}

.input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(31, 41, 55, 0.18);
  background: rgba(255, 255, 255, 0.8);
  padding: 0 14px;
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;

  &:focus {
    border-color: rgba(251, 126, 187, 0.9);
    box-shadow: 0 0 0 3px rgba(251, 126, 187, 0.18);
  }
}

.remember-row {
  margin-top: 2px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  color: var(--color-text-black);
}

.checkbox {
  accent-color: #fb7ebb;
}

.submit-btn {
  margin-top: 4px;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #fb7ebb;
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(251, 126, 187, 0.35);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }
}

html[data-theme="dark"] .login-card {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(226, 232, 240, 0.18);
}

html[data-theme="dark"] .input {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(226, 232, 240, 0.28);
  color: #e2e8f0;
}

@media (max-width: 560px) {
  .subtitle {
    font-size: 0.92rem;
  }
}
</style>
