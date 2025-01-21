<script setup lang="ts">
import { useWebSocket } from "@/composables/useWebSocket.ts";

const WSS_URL = "ws://localhost:3000";
const { buttons } = useWebSocket(WSS_URL);
</script>

<template>
  <div class="buttons-container">
    <transition-group name="button-list" tag="div">
      <button
        v-for="btn in buttons"
        :key="btn.id"
        class="button"
        :class="{ 'button--updated': btn.isUpdated }"
      >
        {{ btn.text }}
      </button>
    </transition-group>
  </div>
</template>

<style scoped>
.buttons-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1rem;
}

.button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.05rem;
  background-color: var(--color-background-soft);
  transition: all 0.3s ease;
}

.button--updated {
  background-color: var(--color-active);
}

.button-list-enter-active,
.button-list-leave-active {
  transition: all 0.3s ease;
}

.button-list-enter-from,
.button-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.button-list-move {
  transition: transform 0.3s ease;
}

.button--updated {
  animation: highlight 0.6s ease;
}

@keyframes highlight {
  0% {
    background-color: #fff;
  }
  50% {
    background-color: var(--color-active);
  }
  100% {
    background-color: #fff;
  }
}
</style>
