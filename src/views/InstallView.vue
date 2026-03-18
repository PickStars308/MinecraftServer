<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {useRouter} from 'vue-router'
import {checkInstallStatus, executeInstall, getSiteConfig, updateSiteConfig} from '@/api/installApi'
import {addToast} from '@/components/toast'
import {generateAuthToken} from '@/utils/cryptoUtils'

const router = useRouter()

// 检查安装状态，如果已安装则跳转到首页
const checkInstallationStatus = async () => {
  try {
    const isInstalled = await checkInstallStatus()
    if (isInstalled) {
      router.push('/')
    }
  } catch (error: any) {
    if (error.message && error.message.includes('CORS')) {
      router.push('/error')
    }
  }
}

// 组件挂载时检查安装状态
onMounted(() => {
  checkInstallationStatus()
  loadConfig()
})


const currentStep = ref(1)
const totalSteps = 4


const loading = ref(false)


const adminFormData = ref({
  adminUsername: '',
  adminPassword: '',
  adminPasswordConfirm: ''
})

const configFormData = ref({
  siteName: '',
  siteDescription: '',
  siteAuthor: '',
  siteVersion: '1.0.0',
  siteKeywords: '',
  serverAddress: '',
  serverCreationDate: new Date().toISOString().split('T')[0],
  startYear: new Date().getFullYear().toString(),
  copyright: ''
})


const errors = ref<Record<string, string>>({})


computed(() => {
  return ((currentStep.value - 1) / (totalSteps - 1)) * 100
});


const validateCurrentStep = (): boolean => {
  errors.value = {}

  switch (currentStep.value) {
    case 1:
      if (!adminFormData.value.adminUsername.trim()) {
        errors.value.adminUsername = '请输入管理员用户名'
      } else if (adminFormData.value.adminUsername.length < 3) {
        errors.value.adminUsername = '用户名至少 3 个字符'
      }

      if (!adminFormData.value.adminPassword) {
        errors.value.adminPassword = '请输入密码'
      } else if (adminFormData.value.adminPassword.length < 6) {
        errors.value.adminPassword = '密码至少 6 个字符'
      }

      if (adminFormData.value.adminPassword !== adminFormData.value.adminPasswordConfirm) {
        errors.value.adminPasswordConfirm = '两次输入的密码不一致'
      }
      break
    case 2:
      break
    case 3:
      break
  }

  return Object.keys(errors.value).length === 0
}

// 加载配置数据
const loadConfig = async () => {
  try {
    const token = generateAuthToken()
    const result = await getSiteConfig(token)

    if (result.success && result.data) {
      configFormData.value = {
        siteName: result.data.siteName || '',
        siteDescription: result.data.siteDescription || '',
        siteAuthor: result.data.siteAuthor || '',
        siteVersion: result.data.siteVersion || '1.0.0',
        siteKeywords: result.data.siteKeywords || '',
        serverAddress: result.data.serverAddress || '',
        serverCreationDate: result.data.serverCreationDate || new Date().toISOString().split('T')[0],
        startYear: result.data.startYear || new Date().getFullYear().toString(),
        copyright: result.data.copyright || ''
      }
    }
  } catch (error: any) {
    console.error('加载配置失败:', error)
  }
}

// 保存配置
const saveConfig = async () => {
  try {
    const token = generateAuthToken()
    const result = await updateSiteConfig(configFormData.value, token)

    if (result.success) {
      addToast('配置保存成功', 'success')
      return true
    } else {
      addToast(result.message || '配置保存失败', 'error')
      return false
    }
  } catch (error: any) {
    console.error('保存配置失败:', error)
    addToast(error.message || '保存配置失败', 'error')
    return false
  }
}


const nextStep = async () => {
  if (!validateCurrentStep()) {
    addToast("请检查并修正表单错误", 'error')
    return
  }

  if (currentStep.value < totalSteps) {
    currentStep.value++
  }
}


const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}


const submitInstall = async () => {
  if (!validateCurrentStep()) {
    addToast("请检查并修正表单错误", 'error')
    return
  }

  loading.value = true

  try {
    // 先保存配置
    const configSaved = await saveConfig()
    if (!configSaved) {
      loading.value = false
      return
    }

    // 执行安装
    const result = await executeInstall({
      adminUsername: adminFormData.value.adminUsername,
      adminPassword: adminFormData.value.adminPassword
    })

    if (result.success) {
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      addToast("安装失败", 'error')
    }
  } catch (error: any) {
    console.error('安装失败:', error)
    addToast(error.message || '安装过程中发生未知错误', 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="install-view">
    <div class="install-card">
      <!-- 头部 -->
      <div class="install-header">
        <p class="eyebrow">初始化配置</p>
        <h1 class="title">安装向导</h1>
        <p class="subtitle">只需几步，完成网站初始化配置</p>
      </div>

      <!-- 进度指示器 -->
      <div class="progress-section">
        <div class="step-indicators">
          <div
              v-for="step in totalSteps"
              :key="step"
              :class="['step-dot', { active: step <= currentStep }]">
            {{ step }}
          </div>
        </div>
      </div>

      <!-- 表单内容 -->
      <div class="install-content">
        <!-- 步骤 1: 管理员账户 -->
        <transition mode="out-in" name="slide-fade">
          <div v-if="currentStep === 1" key="step1" class="step-content">
            <h2 class="step-title">创建管理员账户</h2>

            <div class="form-group">
              <label class="field-label" for="adminUsername">
                用户名 <span class="required">*</span>
              </label>
              <input
                  id="adminUsername"
                  v-model="adminFormData.adminUsername"
                  :class="{ error: errors.adminUsername }"
                  class="input"
                  placeholder="至少 3 个字符"
                  type="text"
              />
              <p v-if="errors.adminUsername" class="error-text">{{ errors.adminUsername }}</p>
            </div>

            <div class="form-group">
              <label class="field-label" for="adminPassword">
                密码 <span class="required">*</span>
              </label>
              <input
                  id="adminPassword"
                  v-model="adminFormData.adminPassword"
                  :class="{ error: errors.adminPassword }"
                  class="input"
                  placeholder="至少 6 个字符"
                  type="password"
              />
              <p v-if="errors.adminPassword" class="error-text">{{ errors.adminPassword }}</p>
            </div>

            <div class="form-group">
              <label class="field-label" for="adminPasswordConfirm">
                确认密码 <span class="required">*</span>
              </label>
              <input
                  id="adminPasswordConfirm"
                  v-model="adminFormData.adminPasswordConfirm"
                  :class="{ error: errors.adminPasswordConfirm }"
                  class="input"
                  placeholder="再次输入密码"
                  type="password"
              />
              <p v-if="errors.adminPasswordConfirm" class="error-text">{{ errors.adminPasswordConfirm }}</p>
            </div>

            <div class="tip-box">
              <p>🔒 请妥善保管管理员账户信息，后续可以通过后台管理面板修改</p>
            </div>
          </div>

          <!-- 步骤 2: Meta 信息配置 -->
          <div v-else-if="currentStep === 2" key="step2" class="step-content">
            <h2 class="step-title">配置网站 Meta 信息</h2>

            <div class="form-group">
              <label class="field-label" for="siteName">
                站点名称
              </label>
              <input
                  id="siteName"
                  v-model="configFormData.siteName"
                  class="input"
                  placeholder="例如：Stars Server"
                  type="text"
              />
              <p class="hint-text">💡 用于网页标题和 SEO</p>
            </div>

            <div class="form-group">
              <label class="field-label" for="siteDescription">
                站点描述
              </label>
              <input
                  id="siteDescription"
                  v-model="configFormData.siteDescription"
                  class="input"
                  placeholder="简短介绍你的服务器"
                  type="text"
              />
              <p class="hint-text">💡 用于搜索引擎描述</p>
            </div>

            <div class="form-group full-width">
              <label class="field-label" for="siteKeywords">
                站点关键词
              </label>
              <input
                  id="siteKeywords"
                  v-model="configFormData.siteKeywords"
                  class="input"
                  placeholder="Minecraft，我的世界，服务器，游戏（用逗号分隔）"
                  type="text"
              />
              <p class="hint-text">💡 多个关键词用逗号分隔</p>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="field-label" for="siteAuthor">
                  站点作者
                </label>
                <input
                    id="siteAuthor"
                    v-model="configFormData.siteAuthor"
                    class="input"
                    placeholder="作者名称"
                    type="text"
                />
              </div>

              <div class="form-group" style="display: none">
                <label class="field-label" for="copyright">
                  版权信息
                </label>
                <input
                    id="copyright"
                    v-model="configFormData.copyright"
                    class="input"
                    placeholder="版权所有者"
                    type="text"
                />
              </div>
            </div>

            <div class="tip-box">
              <p>📝 这些配置将用于网站的 SEO 和 Meta 标签</p>
            </div>
          </div>

          <!-- 步骤 3: 服务器配置 -->
          <div v-else-if="currentStep === 3" key="step3" class="step-content">
            <h2 class="step-title">配置 Minecraft 服务器</h2>

            <div class="form-group">
              <label class="field-label" for="serverAddress">
                服务器地址
              </label>
              <input
                  id="serverAddress"
                  v-model="configFormData.serverAddress"
                  class="input"
                  placeholder="mc.xinstudio.top"
                  type="text"
              />
              <p class="hint-text">💡 填写你的服务器 IP 或域名</p>
            </div>

            <div class="form-group">
              <label class="field-label" for="serverCreationDate">
                服务器创建日期
              </label>
              <input
                  id="serverCreationDate"
                  v-model="configFormData.serverCreationDate"
                  class="input"
                  type="date"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="field-label" for="startYear">
                  起始年份
                </label>
                <input
                    id="startYear"
                    v-model="configFormData.startYear"
                    class="input"
                    placeholder="2024"
                    type="text"
                />
              </div>

              <div class="form-group" style="display: none">
                <label class="field-label" for="siteVersion">
                  站点版本
                </label>
                <input
                    id="siteVersion"
                    v-model="configFormData.siteVersion"
                    class="input"
                    placeholder="1.0.0"
                    type="text"
                />
              </div>
            </div>

            <div class="tip-box">
              <p>🎮 这些配置用于显示服务器状态和运行时间</p>
            </div>
          </div>

          <!-- 步骤 4: 确认安装 -->
          <div v-else-if="currentStep === 4" key="step4" class="step-content">
            <h2 class="step-title">确认安装信息</h2>

            <div class="confirm-card">
              <h3>管理员账户</h3>

              <div class="confirm-item">
                <span class="confirm-label">管理员用户名：</span>
                <span class="confirm-value">{{ adminFormData.adminUsername }}</span>
              </div>
            </div>

            <div class="confirm-card" style="margin-top: 20px;">
              <h3>网站 Meta 信息</h3>

              <div class="confirm-item">
                <span class="confirm-label">站点名称：</span>
                <span class="confirm-value">{{ configFormData.siteName || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">站点描述：</span>
                <span class="confirm-value">{{ configFormData.siteDescription || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">站点关键词：</span>
                <span class="confirm-value">{{ configFormData.siteKeywords || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">站点作者：</span>
                <span class="confirm-value">{{ configFormData.siteAuthor || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">版权信息：</span>
                <span class="confirm-value">{{ configFormData.copyright || '未设置' }}</span>
              </div>
            </div>

            <div class="confirm-card" style="margin-top: 20px;">
              <h3>Minecraft 服务器配置</h3>

              <div class="confirm-item">
                <span class="confirm-label">服务器地址：</span>
                <span class="confirm-value">{{ configFormData.serverAddress || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">服务器创建日期：</span>
                <span class="confirm-value">{{ configFormData.serverCreationDate || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">起始年份：</span>
                <span class="confirm-value">{{ configFormData.startYear || '未设置' }}</span>
              </div>
              <div class="confirm-item">
                <span class="confirm-label">站点版本：</span>
                <span class="confirm-value">{{ configFormData.siteVersion || '未设置' }}</span>
              </div>
            </div>

            <div class="warning-box">
              <p>⚠️ 安装完成后，管理员账户将无法直接修改，请谨慎操作</p>
            </div>
          </div>
        </transition>
      </div>

      <!-- 底部按钮 -->
      <div class="install-footer">
        <button
            v-if="currentStep > 1"
            :disabled="loading"
            class="btn btn-secondary"
            type="button"
            @click="prevStep"
        >
          上一步
        </button>

        <button
            v-if="currentStep < totalSteps"
            :disabled="loading"
            class="btn btn-primary"
            type="button"
            @click="nextStep"
        >
          下一步
        </button>

        <button
            v-if="currentStep === totalSteps"
            :disabled="loading"
            class="btn btn-success"
            type="button"
            @click="submitInstall"
        >
          {{ loading ? '安装中...' : '开始安装' }}
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.install-view {
  width: 100%;
  max-width: 980px;
  padding: clamp(16px, 5vw, 32px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
}

.install-card {
  width: 100%;
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

.install-header {
  text-align: center;
  margin-bottom: 30px;
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

.progress-section {
  margin-bottom: 30px;
}

.progress-bar {
  height: 4px;
  background: rgba(203, 213, 225, 0.5);
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 15px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #fb7ebb, #ff8cc9);
  transition: width 0.3s ease;
  border-radius: 2px;
}

.step-indicators {
  display: flex;
  justify-content: space-around;
  gap: 12px;
}

.step-dot {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(203, 213, 225, 0.5);
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  transition: all 0.3s ease;

  &.active {
    background: linear-gradient(135deg, #fb7ebb, #ff8cc9);
    color: white;
  }
}

.install-content {
  min-height: 300px;
  margin-bottom: 30px;
}

.step-content {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.step-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-black);
  margin-bottom: 25px;
}

.form-group {
  margin-bottom: 20px;

  &.full-width {
    grid-column: 1 / -1;
  }
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.field-label {
  display: block;
  font-size: 0.95rem;
  color: var(--color-text-black);
  margin-bottom: 8px;

  .required {
    color: #ef4444;
    margin-left: 4px;
  }

  .optional {
    color: var(--color-text-tertiary);
    font-weight: normal;
  }
}

.input,
.textarea {
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

.textarea {
  resize: vertical;
  font-family: inherit;
}

.input-with-button {
  display: flex;
  gap: 10px;

  .input {
    flex: 1;
  }
}

.test-btn {
  padding: 12px 20px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 44px;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(16, 185, 129, 0.35);
  }

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
}

.error-text {
  font-size: 0.85rem;
  color: #ef4444;
  margin-top: 6px;
}

.hint-text {
  font-size: 0.85rem;
  color: var(--color-text-tertiary);
  margin-top: 6px;
}

.tip-box,
.warning-box {
  margin-top: 20px;
  padding: 15px;
  border-radius: 12px;
  font-size: 0.92rem;

  p {
    margin: 0;
  }
}

.tip-box {
  background: rgba(59, 130, 246, 0.1);
  border-left: 4px solid #3b82f6;
  color: var(--color-text-black);
}

.warning-box {
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
  color: var(--color-text-black);
}

.confirm-card {
  background: rgba(241, 245, 249, 0.5);
  border-radius: 15px;
  padding: 25px;

  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--color-text-black);
    margin: 0 0 20px 0;
  }
}

.confirm-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid rgba(203, 213, 225, 0.3);

  &:last-child {
    border-bottom: none;
  }
}

.confirm-label {
  font-size: 0.95rem;
  color: var(--color-text-tertiary);
  font-weight: 500;
}

.confirm-value {
  font-size: 0.95rem;
  color: var(--color-text-black);
  font-weight: 600;
  text-align: right;
  max-width: 60%;
}

.install-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
}

.btn-secondary {
  background: rgba(203, 213, 225, 0.5);
  color: var(--color-text-black);

  &:hover:not(:disabled) {
    background: rgba(203, 213, 225, 0.8);
  }
}

.btn-primary {
  background: linear-gradient(135deg, #fb7ebb, #ff8cc9);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(251, 126, 187, 0.35);
  }
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 10px 24px rgba(16, 185, 129, 0.35);
  }
}


.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}


html[data-theme='dark'] .install-card {
  background: rgba(15, 23, 42, 0.5);
  border-color: rgba(226, 232, 240, 0.18);
}

html[data-theme='dark'] .input,
html[data-theme='dark'] .textarea {
  background: rgba(15, 23, 42, 0.72);
  border-color: rgba(226, 232, 240, 0.28);
  color: #e2e8f0;
}

html[data-theme='dark'] .confirm-card {
  background: rgba(30, 41, 59, 0.5);
}


@media (max-width: 768px) {
  .install-card {
    padding: 20px;
  }

  .title {
    font-size: 1.6rem;
  }

  .input-with-button {
    flex-direction: column;
  }

  .test-btn {
    width: 100%;
  }

  .confirm-item {
    flex-direction: column;
    gap: 5px;

    .confirm-value {
      text-align: left;
      max-width: 100%;
    }
  }
}

@media (max-width: 560px) {
  .subtitle {
    font-size: 0.92rem;
  }

  .step-title {
    font-size: 1.3rem;
  }
}
</style>
