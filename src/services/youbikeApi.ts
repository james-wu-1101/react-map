import type { Station } from '../types';

const API_URL = 'https://tcgbusfs.blob.core.windows.net/dotapp/youbike/v2/youbike_immediate.json';

export const fetchYouBikeStations = async (): Promise<Station[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('無法獲取 YouBike 站點資料');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('獲取 YouBike 站點資料時出錯:', error);
    throw error;
  }
}; 
