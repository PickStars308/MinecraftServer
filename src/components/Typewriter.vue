<script lang="ts" setup>
import {onMounted, onUnmounted, ref} from "vue"

interface Props {
  texts: string[]
  speed?: number
  deleteSpeed?: number
  delay?: number
  loop?: boolean
  afterTextDelay?: number
  afterDeleteDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  texts: () => [],
  speed: 150,
  deleteSpeed: 80,
  delay: 0,
  loop: false,
  afterTextDelay: 2000,
  afterDeleteDelay: 500
})

const emit = defineEmits<{
  complete: []
  textComplete: [index: number]
  textDeleteStart: [index: number]
  textDeleteComplete: [index: number]
}>()

const displayText = ref("")
const currentTextIndex = ref(0)

/* 随机顺序数组 */
const order = ref<number[]>([])

let charIndex = 0
let isTyping = true
let isDeleting = false
let timer: ReturnType<typeof setTimeout> | null = null

const clearTimers = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

/* 获取当前文本 */
const getCurrentText = () => {
  const index = order.value[currentTextIndex.value]
  if (index === undefined) return undefined
  return props.texts[index]
}

/* 主流程 */
const process = () => {
  if (!isTyping) return

  if (isDeleting) {
    deleteChar()
  } else {
    typeChar()
  }
}

/* 打字 */
const typeChar = () => {
  const currentText = getCurrentText()

  if (currentText && charIndex < currentText.length) {
    displayText.value += currentText[charIndex]
    charIndex++
    timer = setTimeout(process, props.speed)

  } else if (currentText) {

    emit("textComplete", currentTextIndex.value)

    const hasNext = currentTextIndex.value < order.value.length - 1

    if (hasNext || props.loop) {

      timer = setTimeout(() => {
        isDeleting = true
        emit("textDeleteStart", currentTextIndex.value)
        process()
      }, props.afterTextDelay)

    } else {
      emit("complete")
    }
  }
}

/* 删除 */
const deleteChar = () => {

  if (charIndex > 0) {

    displayText.value = displayText.value.slice(0, -1)
    charIndex--
    timer = setTimeout(process, props.deleteSpeed)

  } else {

    emit("textDeleteComplete", currentTextIndex.value)

    if (props.loop) {
      currentTextIndex.value =
          (currentTextIndex.value + 1) % order.value.length
    } else {
      currentTextIndex.value++
    }

    if (currentTextIndex.value < order.value.length) {

      isDeleting = false
      timer = setTimeout(process, props.afterDeleteDelay)

    } else {
      emit("complete")
    }
  }
}

/* 初始化随机顺序 */
const shuffle = () => {
  order.value = [...props.texts.keys()].sort(() => Math.random() - 0.5)
}

onMounted(() => {

  if (props.texts.length === 0) return

  shuffle()

  timer = setTimeout(() => {
    process()
  }, props.delay)
})

onUnmounted(() => {
  clearTimers()
})

defineExpose({

  stop() {
    isTyping = false
    clearTimers()
  },

  reset() {
    clearTimers()

    displayText.value = ""
    currentTextIndex.value = 0
    charIndex = 0
    isTyping = true
    isDeleting = false

    shuffle()

    process()
  }

})
</script>

<template>
  <span class="typing-text">
    <span class="typing-content">{{ displayText }}</span>
    <span class="cursor">|</span>
  </span>
</template>

<style scoped>
.typing-text {
  display: block;
  width: 100%;
  max-width: 100%;
  white-space: nowrap;
  vertical-align: bottom;
  overflow: hidden;
}

.typing-content {
  display: inline-block;
  max-width: calc(100% - 14px);
  overflow: hidden;

  white-space: nowrap;
  vertical-align: bottom;
}

.cursor {
  display: inline-block;
  animation: blink 1s infinite;
  color: #ffffff;
  font-weight: bold;
  margin-left: 2px;
  vertical-align: bottom;
}

@keyframes blink {
  0%, 50% {
    opacity: 1;
  }
  51%, 100% {
    opacity: 0;
  }
}
</style>
