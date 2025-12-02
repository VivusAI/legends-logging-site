export interface Asset {
  id: string;
  key: string;
  size: number;
  type: string;
}

export interface AssetResponse {
  files: Asset[];
  totalCount: number;
}
