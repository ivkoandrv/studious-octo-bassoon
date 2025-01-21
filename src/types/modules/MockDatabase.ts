export interface IFetchParams {
  page: number;
  limit: number;
}

export interface IFetchResponse<T> {
  items: T[];
  total: number;
  hasMore: boolean;
}

export interface IButton {
  id: string;
  text: string;
  isUpdated: boolean;
}

export interface IWSSMessage {
  buttons: IButton[];
}
