<script lang="ts" setup>
import {onMounted, ref} from 'vue'
import {
  addMember as addMemberApi,
  deleteMember as deleteMemberApi,
  generateFaceUrl,
  getMemberList,
  type ServerMember
} from '../../api/memberApi'
import {addToast} from '@/components/toast'

const members = ref<ServerMember[]>([])
const loading = ref(false)
const error = ref('')
const newMemberName = ref('')
const newMemberUuid = ref('')

const loadMembers = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getMemberList()
    if (response.success) {
      members.value = response.data
    } else {
      error.value = response.message || '加载成员列表失败'
      addToast(response.message || '加载成员列表失败', 'error')
    }
  } catch (err) {
    error.value = '加载成员列表失败'
    addToast('加载成员列表失败', 'error')
  } finally {
    loading.value = false
  }
}


const addMember = async () => {
  if (!newMemberName.value.trim() || !newMemberUuid.value.trim()) {
    addToast('输入内容不能为空', 'warning')
    return
  }

  const newMember: ServerMember = {
    name: newMemberName.value.trim(),
    uuid: newMemberUuid.value.trim()
  }

  try {
    const response = await addMemberApi(newMember)
    if (response.success) {
      members.value = response.data
      newMemberName.value = ''
      newMemberUuid.value = ''
      addToast(response.message || '添加成功', 'success')
    } else {
      addToast(response.message || '添加失败', 'error')
    }
  } catch (err) {
    addToast('添加失败', 'error')
  }
}

const removeMember = async (uuid: string) => {
  try {
    const response = await deleteMemberApi(uuid)
    if (response.success) {
      members.value = response.data
      addToast(response.message || '删除成功', 'success')
    } else {
      addToast(response.message || '删除失败', 'error')
    }
  } catch (err) {
    addToast('删除失败', 'error')
  }
}

const updateMemberName = (index: number, newName: string) => {
  if (members.value[index]) {
    members.value[index].name = newName.trim()
  }
}

const updateMemberUuid = (index: number, newUuid: string) => {
  if (members.value[index]) {
    members.value[index].uuid = newUuid.trim()
  }
}

onMounted(() => {
  loadMembers()
})
</script>

<template>
  <section class="single-panel">

    <div class="add-member-form">
      <h4>添加新成员</h4>
      <div class="form-row">
        <div class="form-group">
          <label>玩家名称</label>
          <input v-model="newMemberName" placeholder="请输入玩家名称" type="text">
        </div>
        <div class="form-group">
          <label>玩家 UUID</label>
          <input v-model="newMemberUuid" placeholder="请输入玩家 UUID" type="text">
        </div>
        <button class="btn btn-success" @click="addMember">
          添加
        </button>
      </div>
    </div>

    <article class="panel glass">
      <div class="panel-head">
        <h3>成员管理</h3>
        <p class="panel-description">管理服务器成员列表</p>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <p class="error-message">{{ error }}</p>
        <button class="btn btn-primary" @click="loadMembers">
          重试
        </button>
      </div>


      <div v-else class="members-container">
        <div class="members-list">
          <div v-if="members.length === 0" class="empty-list">
            <p>暂无成员</p>
          </div>
          <div v-else class="members-grid">
            <div v-for="(member, index) in members" :key="member.uuid" class="member-card">
              <div class="member-avatar">
                <img :alt="member.name" :src="generateFaceUrl(member.name, { scale: 8 })"
                     @error="(e) => (e.target as HTMLImageElement).src = 'https://crafthead.net/avatar/' + member.name + '?scale=8'">
              </div>
              <div class="member-info">
                <div class="form-group">
                  <label>玩家名称</label>
                  <input :value="member.name" type="text"
                         @input="updateMemberName(index, ($event.target as HTMLInputElement).value)">
                </div>
                <div class="form-group">
                  <label>玩家 UUID</label>
                  <input :value="member.uuid" type="text"
                         @input="updateMemberUuid(index, ($event.target as HTMLInputElement).value)">
                </div>
              </div>
              <button class="btn btn-danger remove-btn" @click="removeMember(member.uuid)">
                <icon-delete size="24"></icon-delete>
              </button>
            </div>
          </div>
        </div>

      </div>
    </article>
  </section>
</template>

<style lang="scss" scoped>
.single-panel {
  min-height: 420px;
}

.panel {
  padding: 24px;
}

.glass {
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.panel-head {
  margin-bottom: 24px;

  h3 {
    color: var(--color-text-black);
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .panel-description {
    color: var(--color-text-black);
    opacity: 0.7;
    font-size: 0.9rem;
    margin: 0;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    border-top-color: var(--color-primary);
    animation: spin 1s ease-in-out infinite;
    margin-bottom: 16px;
  }

  p {
    color: var(--color-text-black);
  }
}

.error-container {
  text-align: center;
  padding: 40px 0;

  .error-message {
    color: var(--color-danger);
    margin-bottom: 16px;
  }
}

.add-member-form {
  background: rgba(255, 255, 255, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 20px;
  backdrop-filter: blur(16px) saturate(140%);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 20px;

  h4 {
    color: var(--color-text-black);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .form-row {
    display: flex;
    gap: 12px;
    align-items: flex-end;

    .form-group {
      flex: 1;

      label {
        display: block;
        color: var(--color-text-black);
        font-size: 0.8rem;
        font-weight: 500;
        margin-bottom: 4px;
      }

      input {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 6px;
        font-size: 0.9rem;
        background: rgba(255, 255, 255, 0.8);

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
      }
    }

    .btn {
      padding: 8px 16px;
      font-size: 0.9rem;
    }
  }
}

.members-header {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;

  .save-btn {
    padding: 8px 16px;
    font-size: 0.9rem;
  }
}

.members-list {
  margin-bottom: 24px;

  h4 {
    color: var(--color-text-black);
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 16px;
  }

  .empty-list {
    text-align: center;
    padding: 40px 0;

    p {
      color: var(--color-text-black);
      opacity: 0.6;
    }
  }

  .members-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 16px;
  }
}

.member-card {
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  gap: 12px;
  align-items: center;

  .member-avatar {
    width: 64px;
    height: 64px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .member-info {
    flex: 1;

    .form-group {
      margin-bottom: 8px;

      label {
        display: block;
        color: var(--color-text-black);
        font-size: 0.75rem;
        font-weight: 500;
        margin-bottom: 2px;
      }

      input {
        width: 100%;
        padding: 6px 10px;
        border: 1px solid rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        font-size: 0.85rem;
        background: rgba(255, 255, 255, 0.8);

        &:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
      }
    }
  }

  .remove-btn {
    padding: 6px 12px;
    font-size: 0.8rem;
    flex-shrink: 0;
  }
}

.btn-success {
  background: var(--color-success);
  color: white;

  &:hover {
    background: var(--color-success-dark);
  }
}

.btn-danger {
  background: var(--color-danger);

  &:hover {
    background: var(--color-danger-dark);
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

html[data-theme='dark'] .glass {
  background: rgba(15, 23, 42, 0.62);
  border-color: rgba(226, 232, 240, 0.14);
}

html[data-theme='dark'] .panel-head h3,
html[data-theme='dark'] .panel-head .panel-description,
html[data-theme='dark'] .loading-container p,
html[data-theme='dark'] .add-member-form h4,
html[data-theme='dark'] .add-member-form label,
html[data-theme='dark'] .members-list h4,
html[data-theme='dark'] .empty-list p,
html[data-theme='dark'] .member-card label {
  color: #ffffff;
}

html[data-theme='dark'] .add-member-form,
html[data-theme='dark'] .member-card {
  background: rgba(30, 41, 59, 0.6);
}

html[data-theme='dark'] .add-member-form input,
html[data-theme='dark'] .member-card input {
  background: rgba(15, 23, 42, 0.8);
  border-color: rgba(226, 232, 240, 0.2);
  color: #000000;

  &:focus {
    border-color: var(--color-primary);
  }
}

html[data-theme='dark'] .loading-spinner {
  border-color: rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
}

@media (max-width: 768px) {
  .members-grid {
    grid-template-columns: 1fr !important;
  }

  .form-row {
    flex-direction: column;
    align-items: stretch !important;

    .btn {
      width: 100%;
    }
  }
}
</style>
