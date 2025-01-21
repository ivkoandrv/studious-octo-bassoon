<script setup lang="ts">
import type {
  IVirtualScrollBaseEmits,
  IVirtualScrollBaseProps,
  IVirtualScrollItem,
} from "@/types/modules/VirtualScroll.ts";
import { useVirtualScroll } from "@/composables/useVirtualScroll.ts";
import { onMounted, watch } from "vue";

const props = withDefaults(defineProps<IVirtualScrollBaseProps>(), {
  itemHeight: 50,
  containerHeight: 400,
  bufferItems: 5,
  pageSize: 50,
  items: () => [],
});

const emit = defineEmits<IVirtualScrollBaseEmits>();

const {
  containerRef,
  visibleItems,
  totalHeight,
  sentinelRef,
  onScroll,
  initializeItems,
  updateItems,
} = useVirtualScroll({
  itemHeight: props.itemHeight,
  containerHeight: props.containerHeight,
  bufferItems: props.bufferItems,
  pageSize: props.pageSize,
});

// Initialize items when component is mounted
onMounted(async () => {
  if (props.items.length === 0) {
    await initializeItems();
  }
});

// Watch for external items updates
watch(
  () => props.items,
  (newItems) => {
    if (newItems.length > 0) {
      updateItems(newItems);
    }
  },
  { deep: true },
);

const handleScroll = async (event: Event) => {
  await onScroll(event);
  emit("onScroll", event);
};

const itemClick = (item: IVirtualScrollItem) => {
  emit("onClick", item);
};
</script>

<template>
  <div
    ref="containerRef"
    class="virtual-scroll-container"
    :style="{ height: `${containerHeight}px` }"
    @scroll="handleScroll"
  >
    <div class="virtual-scroll-content" :style="{ height: `${totalHeight}px` }">
      <slot
        v-for="item of visibleItems"
        :key="item.id"
        :style="item.style"
        :item="item"
      >
        <div class="scroll-item" :style="item.style" @click="itemClick(item)">
          {{ item.content }}
        </div>
      </slot>
    </div>
    <div ref="sentinelRef" class="sentinel" style="height: 1px; width: 100%" />
  </div>
</template>
<style>
.virtual-scroll-container {
  overflow-y: auto;
  position: relative;
  border: 1px solid var(--color-border);
}

.virtual-scroll-content {
  position: relative;
}

.scroll-item {
  width: 100%;
  padding: 10px;
  box-sizing: border-box;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-background-soft);
  cursor: pointer;
}
</style>
