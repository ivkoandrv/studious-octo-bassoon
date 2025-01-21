/**
 * Here are virtual scroll types are located.
 *
 * Maybe, in the parallel Universe I can use "ready to use" library,
 * but not today :)
 *
 * It's interesting to do on my own, as I met different challenges while I did this task
 * Thanks you for your time, I appreciate it <3
 *
 * Ivan
 *
 */

import type { ComputedRef, Ref } from "vue";

export type Nullable<T> = T | null | undefined;

/////////////////////////////////////////////
/////////// MODULE DEFINITIONS //////////////
/////////////////////////////////////////////

export interface IVirtualScrollOptions {
  itemHeight: number; // Height of each item
  containerHeight: number; // Height of the container
  bufferItems: number; // Buffered elements (up and down of the visible region)
  pageSize: number; // Size of the page
}

export interface IVirtualScrollResponse {
  containerRef: Ref<Nullable<HTMLElement>>; // Link to the container
  sentinelRef: Ref<Nullable<HTMLElement>>; // Intersection Observer element
  scrollTop: Ref<number>; // Current scroll position
  items: Ref<IVirtualScrollItem[]>; // All items
  visibleItems: ComputedRef<IVirtualScrollItemStyled[]>; // Visible elements
  totalHeight: Ref<number>; // General container height
  hasMore: Ref<boolean>; // Check if there are more content to show
  isLoading: Ref<boolean>; // Check if loading data
  onScroll: (event: Event) => Promise<void>;
  initializeItems: () => Promise<void>;
  loadMoreItems: () => Promise<void>;
  updateItems: (newItems: IVirtualScrollItem[]) => void;
}

export type TStatus = "active" | "completed";

export interface IVirtualScrollItem {
  id: number;
  content: string;
  timestamp: number;
  status: TStatus;
}

export interface IVirtualScrollItemStyled extends IVirtualScrollItem {
  style: CSSStyleDeclaration;
}

/////////////////////////////////////////////
//////// COMPONENT DEFINITIONS //////////////
/////////////////////////////////////////////

export interface IVirtualScrollBaseProps
  extends Pick<IVirtualScrollResponse, "items">,
    Partial<IVirtualScrollOptions> {}

export interface IVirtualScrollBaseEmits {
  (e: "onScroll", event: Event): void;
  (e: "onClick", item: IVirtualScrollItem): void;
}
