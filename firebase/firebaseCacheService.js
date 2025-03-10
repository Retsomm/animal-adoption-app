// firebase/firebaseCacheService.js
import { ref, set, get, serverTimestamp } from 'firebase/database';
import { database } from './firebaseConfig';

// 設定資料快取過期時間（毫秒）
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24小時

// 將資料存入 Firebase 快取
export const setCacheData = async (key, data) => {
  try {
    await set(ref(database, `cache/${key}`), {
      data: data,
      timestamp: Date.now(), // 使用客戶端時間戳，serverTimestamp() 是伺服器時間
    });
    console.log(`資料已成功快取至 key: ${key}`);
    return true;
  } catch (error) {
    console.error('快取資料失敗:', error);
    return false;
  }
};

// 從 Firebase 獲取快取資料
export const getCacheData = async (key) => {
  try {
    const snapshot = await get(ref(database, `cache/${key}`));
    if (snapshot.exists()) {
      const cachedData = snapshot.val();
      const currentTime = Date.now();
      const cacheTime = cachedData.timestamp;
      
      // 檢查快取是否過期
      if (cacheTime && (currentTime - cacheTime < CACHE_EXPIRY)) {
        console.log(`使用快取資料 (key: ${key})`);
        return cachedData.data;
      } else {
        console.log(`快取資料已過期 (key: ${key})`);
        return null;
      }
    } else {
      console.log(`沒有找到快取資料 (key: ${key})`);
      return null;
    }
  } catch (error) {
    console.error('獲取快取資料失敗:', error);
    return null;
  }
};

// 清除過期的快取資料
export const cleanupCache = async () => {
  try {
    const snapshot = await get(ref(database, 'cache'));
    if (snapshot.exists()) {
      const cacheData = snapshot.val();
      const currentTime = Date.now();
      
      for (const [key, value] of Object.entries(cacheData)) {
        if (value.timestamp && (currentTime - value.timestamp > CACHE_EXPIRY)) {
          await set(ref(database, `cache/${key}`), null);
          console.log(`已清除過期快取: ${key}`);
        }
      }
    }
  } catch (error) {
    console.error('清除快取失敗:', error);
  }
};

// 設定快取過期時間 (以小時為單位)
export const setCacheExpiry = (hours) => {
  if (typeof hours === 'number' && hours > 0) {
    CACHE_EXPIRY = hours * 60 * 60 * 1000;
    return true;
  }
  return false;
};