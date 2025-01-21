<script setup lang="ts">
import VirtualScrollBase from "@/components/VirtualScroll/VirtualScrollBase.vue";
import { computed, onMounted, ref } from "vue";
import { useInfiniteQuery, useQueryClient } from "@tanstack/vue-query";
import { addItem, fetchItems } from "@/modules/api.ts";
import type { IVirtualScrollItem } from "@/types/modules/VirtualScroll.ts";

/**
 * this file represents the usage of the VirtualScroll using Vue Query
 */

const PAGE_SIZE = 50;
const queryClient = useQueryClient();

const { data, refetch } = useInfiniteQuery({
  queryKey: ["items"],
  queryFn: ({ pageParam = 0 }) =>
    fetchItems({
      page: pageParam,
      limit: PAGE_SIZE,
    }),
  getNextPageParam: (_lastPage, allPages) => {
    return allPages.length;
  },
  initialPageParam: 0,
});

// Let's merge all pages to one array for virtual scroll list
// do it with .flatMap() method
const flatItems = computed(() => {
  if (!data.value) return [];

  return data.value.pages.flatMap((page) => page.items);
});

// Let's count general number of items
const totalItems = computed(() => {
  if (!data.value?.pages[0]) return 0;
  return Math.max(
    flatItems.value.length + PAGE_SIZE,
    data.value.pages[0].total,
  );
});

const handleOptimisticAdd = async () => {
  // create temporary item
  const optimisticItem: IVirtualScrollItem = {
    id: Date.now(),
    content: "Loading...",
    timestamp: Date.now(),
    status: "active",
  };

  // optimistically update UI
  queryClient.setQueryData(["items"], (oldData: unknown) => {
    if (!oldData) return oldData;
    return {
      ...oldData,
      pages: oldData.pages.map((page: unknown, index: number) =>
        index === 0
          ? { ...page, items: [optimisticItem, ...page.items] }
          : page,
      ),
    };
  });

  try {
    // here is the real query
    const newItem = await addItem();

    // update data after query
    queryClient.setQueryData(["items"], (oldData: unknown) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page: unknown, index: number) =>
          index === 0
            ? {
                ...page,
                items: [
                  newItem,
                  ...page.items.filter((item) => item.id !== optimisticItem.id),
                ],
              }
            : page,
        ),
      };
    });
  } catch (error) {
    console.error("Failed to add item:", error);
    // rollback if error
    queryClient.invalidateQueries({ queryKey: ["items"] });
  }
};

onMounted(() => {
  queryClient.setDefaultOptions({
    queries: {
      staleTime: Infinity,
    },
  });
});
</script>

<template>
  <div class="container">
    <div class="controls">
      <button @click="handleOptimisticAdd">Add element</button>
      <button @click="refetch">Refresh list</button>
    </div>

    <virtual-scroll-base
      :items="flatItems"
      :total-items="totalItems"
      :item-height="80"
      :container-height="400"
    >
      <template #default="{ item, style }">
        <div
          class="custom-item"
          :style="[
            style,
            {
              backgroundColor:
                item.status === 'active'
                  ? 'var( --color-active-muted)'
                  : 'var(--color-background )',
            },
          ]"
        >
          <div class="custom-item-header">
            <h3>{{ item.content }}</h3>
            <span class="status" :class="item.status">{{ item.status }}</span>
          </div>
          <p>
            {{ new Date(item.timestamp).toLocaleString() }}
          </p>
        </div>
      </template>
    </virtual-scroll-base>
  </div>
</template>

<style>
.container {
  width: 800px;
  margin: 0 auto;
}

.controls {
  margin-bottom: 1rem;
}

.custom-item {
  padding: 1rem;
  border-bottom: 1px solid var(--color-border);
  width: 100%;
  color: var(--color-text);
  background: var(--color-background);
}

.custom-item-header {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.status {
  font-size: 1rem;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
}

.status.active {
  background-color: var(--color-active);
  color: var(--color-active-rich);
}

.status.completed {
  background-color: var(--color-completed);
  color: var(--color-completed-rich);
}
</style>
