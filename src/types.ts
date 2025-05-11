// 定義 Station 類型
export interface Station {
  sno: string;      // 站點編號
  sna: string;      // 站點名稱
  total: number;      // 總停車格數
  sbi: number;      // 可借車數
  bemp: number;     // 可還車數
  latitude: number; // 緯度
  longitude: number; // 經度
  distance?: number; // 可選的 distance 屬性
  ar: string;        // 地址
  sarea: string;     // 行政區
  updateTime: string;      // 資料更新時間
  act: string;        // 站點狀態
  available_rent_bikes: number; // 可用車輛數
  available_return_bikes: number; // 可用空位數
} 