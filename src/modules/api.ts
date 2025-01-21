import { MockDatabase } from "@/modules/mockDatabase.ts";
import type {
  IFetchParams,
  IFetchResponse,
} from "@/types/modules/MockDatabase.ts";
import type { IVirtualScrollItem } from "@/types/modules/VirtualScroll.ts";

export const db = new MockDatabase();

export const fetchItems = async ({
  page = 0,
  limit = 5,
}: IFetchParams): Promise<IFetchResponse<IVirtualScrollItem>> => {
  const start = page * limit;
  const total = db.getTotalCount;
  const items = db.getItems(start, limit);

  return {
    items,
    total,
    hasMore: true,
  };
};

export const addItem = async (): Promise<IVirtualScrollItem> => {
  return db.addItem();
};

export const deleteItem = async (id: number): Promise<boolean> => {
  db.deleteItem(id);
  return true;
};
