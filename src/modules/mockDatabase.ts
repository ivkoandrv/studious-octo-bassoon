import type { IVirtualScrollItem } from "@/types/modules/VirtualScroll.ts";

/**
 * Let's imagine, that our backend team did not implement CRUD yet,
 * and we should show something to our client on demo to avoid frustrating.
 *
 * And now we create a small service, which give to us dynamic stuff
 *
 */

export class MockDatabase {
  private items: Map<number, IVirtualScrollItem> = new Map();
  private currentId: number = 0;

  // Public methods
  createItem(id: number): IVirtualScrollItem {
    const contents = [
      `Item ${id} - Task`,
      `Item ${id} - Meeting`,
      `Item ${id} - Note`,
      `Item ${id} - Reminder`,
      `Item ${id} - Event`,
    ];

    return {
      id,
      content: contents[Math.floor(Math.random() * contents.length)],
      timestamp: Date.now() - id * 1000,
      status: Math.random() > 0.5 ? "active" : "completed",
    };
  }

  getItems(start: number, limit: number): IVirtualScrollItem[] {
    const result: IVirtualScrollItem[] = [];
    const end = start + limit;

    for (let i = start; i < end; i++) {
      if (!this.items.has(i)) {
        this.items.set(i, this.createItem(i + 1));
        this.currentId = Math.max(this.currentId, i + 1);
      }
      result.push(this.items.get(i)!);
    }

    return result;
  }

  addItem(): IVirtualScrollItem {
    const newId = this.currentId + 1;
    const newItem = this.createItem(newId);

    this.items.set(newId - 1, newItem);
    this.currentId = newId;

    return newItem;
  }

  // hack for the infinite scroll
  get getTotalCount(): number {
    return Math.max(this.currentId + 50, this.items.size + 50);
  }

  deleteItem(id: number): void {
    this.items.delete(id - 1);
  }
}
