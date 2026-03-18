<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {updateSiteConfig} from '@/api/installApi'
import {generateAuthToken} from '@/utils/cryptoUtils'
import {addToast} from '@/components/toast'
import useSiteConfigStore from '@/stores/siteConfig'

const siteConfigStore = useSiteConfigStore()

const loading = ref(false)

const formData = ref({
  siteName: '',
  siteDescription: '',
  siteAuthor: '',
  siteVersion: '1.0.0',
  siteKeywords: '',
  serverAddress: '',
  serverCreationDate: '',
  startYear: '',
  copyright: ''
})

const errors = ref<Record<string, string>>({})

onMounted(() => {
  loadConfig()
})

const loadConfig = () => {
  if (siteConfigStore.config) {
    formData.value = {
      siteName: siteConfigStore.config.siteName || '',
      siteDescription: siteConfigStore.config.siteDescription || '',
      siteAuthor: siteConfigStore.config.siteAuthor || '',
      siteVersion: siteConfigStore.config.siteVersion || '1.0.0',
      siteKeywords: siteConfigStore.config.siteKeywords || '',
      serverAddress: siteConfigStore.config.serverAddress || '',
      serverCreationDate: siteConfigStore.config.serverCreationDate || '',
      startYear: siteConfigStore.config.startYear || '',
      copyright: siteConfigStore.config.copyright || ''
    }
  }
}

const validateForm = (): boolean => {
  errors.value = {}

  if (!formData.value.siteName.trim()) {
    errors.value.siteName = '请输入站点名称'
  }

  return Object.keys(errors.value).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) {
    addToast('请检查并修正表单错误', 'error')
    return
  }

  loading.value = true

  try {
    const token = generateAuthToken()
    const result = await updateSiteConfig(formData.value, token)

    if (result.success) {
      addToast('配置保存成功，即将刷新页面', 'success')

      siteConfigStore.updateConfig(formData.value)
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } else {
      addToast(result.message || '配置保存失败', 'error')
    }
  } catch (error: any) {
    console.error('保存配置失败:', error)
    addToast(error.message || '保存配置失败', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="config-editor">
    <div class="form-section">
      <h3 class="section-title">基本信息配置</h3>

      <div class="form-grid">
        <div class="form-group">
          <label class="field-label" for="siteName">
            站点名称 <span class="required">*</span>
          </label>
          <input
              id="siteName"
              v-model="formData.siteName"
              :class="{ error: errors.siteName }"
              class="input"
              placeholder="例如：Stars Server"
              type="text"
          />
          <p v-if="errors.siteName" class="error-text">{{ errors.siteName }}</p>
        </div>

        <div class="form-group">
          <label class="field-label" for="siteDescription">
            站点描述
          </label>
          <input
              id="siteDescription"
              v-model="formData.siteDescription"
              class="input"
              placeholder="简短介绍你的服务器"
              type="text"
          />
        </div>

        <div class="form-group">
          <label class="field-label" for="siteAuthor">
            站点作者
          </label>
          <input
              id="siteAuthor"
              v-model="formData.siteAuthor"
              class="input"
              placeholder="作者名称"
              type="text"
          />
        </div>

        <div class="form-group">
          <label class="field-label" for="copyright">
            版权信息
          </label>
          <input
              id="copyright"
              v-model="formData.copyright"
              class="input"
              placeholder="版权所有者"
              type="text"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">SEO 优化配置</h3>

      <div class="form-grid">
        <div class="form-group full-width">
          <label class="field-label" for="siteKeywords">
            站点关键词
          </label>
          <input
              id="siteKeywords"
              v-model="formData.siteKeywords"
              class="input"
              placeholder="Minecraft,我的世界,服务器,游戏（用逗号分隔）"
              type="text"
          />
          <p class="hint-text">💡 关键词有助于搜索引擎找到你的服务器</p>
        </div>

        <div class="form-group">
          <label class="field-label" for="siteVersion">
            站点版本
          </label>
          <input
              id="siteVersion"
              v-model="formData.siteVersion"
              class="input"
              placeholder="1.0.0"
              type="text"
          />
        </div>

        <div class="form-group">
          <label class="field-label" for="startYear">
            起始年份
          </label>
          <input
              id="startYear"
              v-model="formData.startYear"
              class="input"
              placeholder="2024"
              type="text"
          />
        </div>
      </div>
    </div>

    <div class="form-section">
      <h3 class="section-title">服务器配置</h3>

      <div class="form-grid">
        <div class="form-group">
          <label class="field-label" for="serverAddress">
            服务器地址
          </label>
          <input
              id="serverAddress"
              v-model="formData.serverAddress"
              class="input"
              placeholder="mc.xinstudio.top"
              type="text"
          />
        </div>

        <div class="form-group">
          <label class="field-label" for="serverCreationDate">
            服务器创建日期
          </label>
          <input
              id="serverCreationDate"
              v-model="formData.serverCreationDate"
              class="input"
              type="date"
          />
        </div>

      </div>
    </div>

    <div class="form-actions">
      <button
          :disabled="loading"
          class="btn-save"
          type="button"
          @click="handleSubmit"
      >
        {{ loading ? '保存中...' : '保存配置' }}
      </button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.config-editor {
  max-width: 1200px;
}

.form-section {
  margin-bottom: 32px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.section-title {
  color: var(--color-text-black);
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(251, 126, 187, 0.3);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.field-label {
  font-size: 0.95rem;
  color: var(--color-text-black);
  font-weight: 600;

  .required {
    color: #ef4444;
    margin-left: 4px;
  }
}

.input {
  width: 100%;
  padding: 12px 16px;
  border-radius: 12px;
  border: 1px solid rgba(31, 41, 55, 0.18);
  background: rgba(255, 255, 255, 0.8);
  outline: none;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  box-sizing: border-box;

  &:focus {
    border-color: rgba(251, 126, 187, 0.9);
    box-shadow: 0 0 0 3px rgba(251, 126, 187, 0.18);
  }

  &.error {
    border-color: rgba(239, 68, 68, 0.6);
  }
}

.error-text {
  font-size: 0.85rem;
  color: #ef4444;
  margin-top: 6px;
}

.hint-text {
  font-size: 0.85rem;
  color: var(--color-text-black);
  opacity: 0.7;
  margin-top: 6px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-save {
  padding: 12px 32px;
  background: linear-gradient(135deg, #fb7ebb, #ff8cc9);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(251, 126, 187, 0.35);
  }

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
}

/* Dark mode */
html[data-theme='dark'] .form-section {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
}

html[data-theme='dark'] .section-title,
html[data-theme='dark'] .field-label {
  color: #f1f5f9;
}

html[data-theme='dark'] .input {
  background: rgba(2, 6, 23, 0.5);
  border-color: rgba(226, 232, 240, 0.28);
  color: #e2e8f0;
}

html[data-theme='dark'] .hint-text {
  color: #94a3b8;
}
</style>
