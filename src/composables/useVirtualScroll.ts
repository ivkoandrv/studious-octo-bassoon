import type {
  IVirtualScrollItem,
  IVirtualScrollItemStyled,
  IVirtualScrollOptions,
  IVirtualScrollResponse,
  Nullable,
} from "@/types/modules/VirtualScroll.ts";
import {
  computed,
  ref,
  type ComputedRef,
  type Ref,
  onMounted,
  onUnmounted,
} from "vue";
import { fetchItems } from "@/modules/api.ts";

export function useVirtualScroll(
  options: Partial<IVirtualScrollOptions> = {},
): IVirtualScrollResponse {
  const {
    itemHeight = 50,
    containerHeight = 400,
    bufferItems = 5,
    pageSize = 50,
  } = options;

  const scrollTop: Ref<number> = ref(0);
  const lastScrollPosition: Ref<number> = ref(0);
  const containerRef: Ref<Nullable<HTMLElement>> = ref(null);
  const sentinelRef: Ref<Nullable<HTMLElement>> = ref(null);
  const items: Ref<IVirtualScrollItem[]> = ref<IVirtualScrollItem[]>([]);
  const hasMore: Ref<boolean> = ref(true);
  const isLoading: Ref<boolean> = ref(false);
  const currentPage: Ref<number> = ref(0);

  /**
   * Key optimization is here!
   *
   * Optimizes virtual scroll performance by implementing element virtualization
   *
   * This function computes the minimal set of elements that need to be rendered
   * based on the current scroll position. It maintains efficient memory usage by
   * rendering only the items visible in the viewport plus a small buffer zone
   * above and below. The buffer prevents visual gaps during rapid scrolling.
   *
   */
  const visibleItems: ComputedRef<IVirtualScrollItemStyled[]> = computed(() => {
    const startIndex = Math.floor(scrollTop.value / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const start = Math.max(0, startIndex - bufferItems);
    const end = Math.min(
      items.value.length,
      startIndex + visibleCount + bufferItems,
    );

    return items.value.slice(start, end).map((item, index) => ({
      ...item,
      style: {
        position: "absolute",
        top: `${(start + index) * itemHeight}px`,
        height: `${itemHeight}px`,
      } as CSSStyleDeclaration,
    }));
  });

  const totalHeight = computed(() => items.value.length * itemHeight);

  /**
   *
   * This function is typically used when initially loading a list of items on a page,
   * or when it is necessary to reset the current state of the list to the initial one.
   */
  const initializeItems = async (): Promise<void> => {
    isLoading.value = true;
    try {
      const response = await fetchItems({
        page: 0,
        limit: pageSize,
      });

      items.value = response.items;
      hasMore.value = response.hasMore;
      currentPage.value = 0;
    } catch (error) {
      console.error("Failed to initialize items:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const loadMoreItems = async (): Promise<void> => {
    if (!hasMore.value || isLoading.value) return;

    isLoading.value = true;
    lastScrollPosition.value = scrollTop.value;

    try {
      const nextPage = currentPage.value + 1;
      const response = await fetchItems({
        page: nextPage,
        limit: pageSize,
      });

      items.value = [...items.value, ...response.items];
      hasMore.value = response.hasMore;
      currentPage.value = nextPage;
    } catch (error) {
      console.error("Failed to load more items:", error);
    } finally {
      isLoading.value = false;
    }
  };

  const onScroll = async (event: Event): Promise<void> => {
    const target = event.target as HTMLElement;
    scrollTop.value = target.scrollTop;
  };

  /**
   * Infinite scroll implemented using Intersection Observer API
   *
   * This component loads more content when the user scrolls near the bottom of the page.
   *
   * The Intersection Observer watches a sentinel element and triggers content loading
   * when it becomes visible, providing a more efficient alternative to manual scroll
   * position calculations
   *
   */
  const setupScroller = () => {
    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && hasMore.value && !isLoading.value) {
          await loadMoreItems();
        }
      },
      {
        root: containerRef.value,
        threshold: 0,
        rootMargin: "200px",
      },
    );

    if (sentinelRef.value) {
      observer.observe(sentinelRef.value);
    }

    return observer;
  };

  const updateItems = (newItems: IVirtualScrollItem[]): void => {
    items.value = newItems;
  };

  onMounted(() => {
    const observer = setupScroller();
    onUnmounted(() => observer.disconnect());
  });

  return {
    containerRef,
    sentinelRef,
    scrollTop,
    items,
    visibleItems,
    totalHeight,
    hasMore,
    isLoading,
    onScroll,
    initializeItems,
    loadMoreItems,
    updateItems,
  };
}
