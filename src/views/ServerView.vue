<template>
  <div class="server-view">
    <h1 class="main-title">
      <Typewriter :after-text-delay="2000" :loop="true" :speed="100" :texts="introTexts"/>
    </h1>

    <p class="subtitle">欢迎来到我们的服务器</p>

    <div class="server-cards">
      <div class="server-card">
        <div class="card-icon info-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" x2="12" y1="16" y2="12"></line>
            <line x1="12" x2="12.01" y1="8" y2="8"></line>
          </svg>
        </div>
        <h3 class="card-title">服务器信息</h3>
        <div class="card-content">
          <div class="info-item">
            <span class="info-label">服务器地址:</span>
            <span class="info-value">mc.xinstudio.top</span>
          </div>
          <div class="info-item">
            <span class="info-label">CPU:</span>
            <span class="info-value">R9 9950X 32 GiB</span>
          </div>
          <div class="info-item">
            <span class="info-label">内存:</span>
            <span class="info-value">200 GiB</span>
          </div>
          <div class="info-item">
            <span class="info-label">游戏模式:</span>
            <span class="info-value">生存，生电，建筑，休闲</span>
          </div>
          <div class="info-item">
            <span class="info-label">最大玩家:</span>
            <span class="info-value">20</span>
          </div>
          <div class="info-item">
            <span class="info-label">在线时间:</span>
            <span class="info-value">7×24小时</span>
          </div>
        </div>
      </div>

      <div class="server-card">
        <div class="card-icon feature-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <circle cx="12" cy="12" r="3"></circle>
            <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </div>
        <h3 class="card-title">服务器特色</h3>
        <div class="card-content">
          <div class="feature-item">
            <span class="feature-icon">✓</span>
            <span class="feature-text">联机工具提供</span>
          </div>
        </div>
      </div>

      <div class="server-card">
        <div class="card-icon team-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3 class="card-title">管理团队</h3>
        <div class="card-content">
          <div class="team-item">
            <span class="team-name">PickStars2025</span>
            <span class="team-role">腐竹</span>
          </div>
        </div>
      </div>

      <div class="server-card">
        <div class="card-icon friendly-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path
                d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </div>
        <h3 class="card-title">友好相处</h3>
        <div class="card-content">
          <p class="rule-text">尊重其他玩家，禁止任何形式的骚扰和欺凌行为</p>
        </div>
      </div>

      <div class="server-card">
        <div class="card-icon anti-cheat-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" x2="8" y1="13" y2="13"></line>
            <line x1="16" x2="8" y1="17" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3 class="card-title">禁止作弊</h3>
        <div class="card-content">
          <p class="rule-text">严禁使用任何作弊客户端</p>
        </div>
      </div>

      <div class="server-card">
        <div class="card-icon chat-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h3 class="card-title">文明聊天</h3>
        <div class="card-content">
          <p class="rule-text">保持聊天频道文明，禁止发布广告和不当内容</p>
        </div>
      </div>

      <div class="server-card join-group">
        <div class="card-icon group-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-4-4h-2"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
        </div>
        <h3 class="card-title">加入我们的Q群</h3>
        <div class="card-content">
          <p class="group-text">欢迎加入官方Q群，与大家一起交流、讨论、分享游戏心得！</p>
          <p class="group-number">群号：238814310</p>
          <button class="copy-btn" @click="copyToClipboard('238814310')">复制群号</button>
        </div>
      </div>

      <div class="server-card contact-email">
        <div class="card-icon email-icon">
          <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
            <rect height="16" rx="2" width="20" x="2" y="4"></rect>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
          </svg>
        </div>
        <h3 class="card-title">联系我们</h3>
        <div class="card-content">
          <p class="email-text">有任何问题或建议，欢迎通过邮箱联系管理员</p>
          <p class="email-address">PickStars2024@qq.com</p>
          <button class="copy-btn" @click="copyToClipboard('PickStars2024@qq.com')">复制邮箱</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>

import {computed} from 'vue'
import Typewriter from "@/components/Typewriter.vue";

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text).then(() => {
    alert('已复制到剪贴板！')

  }).catch(err => {
    console.error('复制失败:', err)
    alert('复制失败，请手动复制')
  })
}

const introTexts = computed(() => [
  '愿方块与你同在',
  '今日也是挖矿的好日子',
  '建造属于你的星辰大海',
  '服务器因你而更精彩',
  '每一次相遇都值得珍惜',
  '在方块世界里自由奔跑',
  '把平凡的日子过成冒险',
  '用心搭建，用爱守护',
  '探索不止，快乐不停',
  '存档里藏着我们的回忆'
])

</script>
<style lang="scss" scoped>
$gap: 20px;
$radius: 16px;

.server-view {
  max-width: 1400px;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;

  .main-title {
    font-size: clamp(1.8rem, 7vw, 3.5rem);
    font-weight: 700;
    color: var(--color-text-black);
    overflow: hidden;
    margin-bottom: clamp(8px, 3vw, 16px);
    line-height: 1.2;
    word-break: break-word;
  }

  .subtitle {
    font-size: clamp(1rem, 2.5vw, 1.25rem);
    color: var(--color-text-black);
    margin-bottom: clamp(24px, 10vw, 48px);
    line-height: 1.5;
  }

  /* 核心布局 */
  .server-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 28px;
    width: 100%;
  }

  /* 默认 3 列 */
  .server-card {
    flex: 0 0 calc(33.333% - 19px);
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: $radius;
    padding: 28px 24px;
    transition: all 0.3s ease;
    text-align: left;
    display: flex;
    flex-direction: column;

    &:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.18);
    }

    .card-icon {
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      margin-bottom: 20px;
      color: white;
      font-size: 1.5rem;

      &.info-icon {
        background: #3b82f6;
      }

      &.feature-icon {
        background: #10b981;
      }

      &.team-icon {
        background: #f59e0b;
      }

      &.friendly-icon {
        background: #ec4899;
      }

      &.anti-cheat-icon {
        background: #ef4444;
      }

      &.chat-icon {
        background: #8b5cf6;
      }

      &.group-icon {
        background: #6366f1;
      }

      &.email-icon {
        background: #06b6d4;
      }
    }

    .card-title {
      font-size: 1.375rem;
      font-weight: 700;
      color: var(--color-text-black);
      margin-bottom: 20px;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .info-item {
      display: flex;
      justify-content: space-between;
    }

    .info-label {
      font-weight: 500;
      color: var(--color-text-black);
    }

    .info-value {
      color: var(--color-text-black);
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .feature-text {
      color: var(--color-text-black);
    }

    .team-item {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .team-name {
      font-weight: 600;
      color: var(--color-text-black);
    }

    .team-role {
      font-size: 0.9rem;
      color: var(--color-text-black);
      opacity: 0.8;
    }

    .rule-text,
    .group-text,
    .email-text {
      line-height: 1.6;
      margin: 0;
      color: var(--color-text-black);
    }

    .group-number,
    .email-address {
      font-weight: 600;
      font-size: 1.1rem;
      margin: 12px 0 16px;
      color: var(--color-text-black);
    }

    .copy-btn {
      align-self: flex-start;
      padding: 8px 16px;
      background: rgba(59, 130, 246, 0.15);
      color: #2563eb;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(59, 130, 246, 0.25);
      }
    }
  }

  /* 手机 */
  @media (max-width: 640px) {
    .server-card {
      flex: 0 0 100%;
    }
  }
}

/* 暗黑模式 */
:deep(.dark) {
  .server-view {
    .main-title,
    .subtitle {
      color: #f1f5f9;
    }

    .server-card {
      background: rgba(30, 30, 30, 0.6);
      border-color: rgba(80, 80, 80, 0.3);

      .card-title,
      .group-number,
      .email-address,
      .info-label,
      .info-value,
      .feature-text,
      .team-name,
      .team-role,
      .rule-text,
      .group-text,
      .email-text {
        color: #f1f5f9;
      }

      .copy-btn {
        background: rgba(96, 165, 250, 0.2);
        color: #93c5fd;

        &:hover {
          background: rgba(96, 165, 250, 0.3);
        }
      }
    }
  }
}
</style>
