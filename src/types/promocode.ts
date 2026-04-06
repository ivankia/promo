export type PromocodeInput = {
  code: string;
  discountPercent: number;
  activationsLimit: number;
  activationsCount?: number;
  expirationDate: Date;
  isActive?: boolean;
};

export type Promocode = {
  id: string;
  code: string;
  discountPercent: number;
  activationsLimit: number;
  activationsCount: number;
  expirationDate: Date;
  isActive: boolean;
};

export type PromocodeResponse = Promocode;

export type PromocodeList = {
  data: Promocode[];
  info: {
    hasNext: boolean;
    next: string | null;
  };
};

export type PromocodeListResponse = PromocodeList;
