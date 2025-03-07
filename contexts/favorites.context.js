import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const FavoritesContext = createContext();

// Web 環境的本地存儲替代方案
const webStorage = {
  getItem: async (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (e) {
        console.error('localStorage getItem error:', e);
        return null;
      }
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.error('localStorage setItem error:', e);
        return false;
      }
    }
    return false;
  }
};

// 根據平台選擇合適的存儲方法
const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMounted = useRef(true);

  // 處理組件卸載
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // 從存儲加載收藏數據
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        console.log('嘗試從儲存中載入收藏資料');
        const storedFavorites = await storage.getItem('favorites');
        
        if (storedFavorites !== null && isMounted.current) {
          try {
            const parsedFavorites = JSON.parse(storedFavorites);
            if (Array.isArray(parsedFavorites)) {
              console.log(`成功載入 ${parsedFavorites.length} 個收藏項目`);
              setFavorites(parsedFavorites);
            } else {
              console.warn('儲存的收藏不是陣列格式，重置為空陣列');
              setFavorites([]);
            }
          } catch (parseError) {
            console.error('解析收藏資料時出錯', parseError);
            setFavorites([]);
          }
        } else {
          console.log('沒有找到儲存的收藏或組件已卸載');
        }
      } catch (error) {
        console.error('從儲存中載入收藏時失敗', error);
      } finally {
        if (isMounted.current) {
          setIsLoaded(true);
          console.log('收藏資料載入完成');
        }
      }
    };

    // 添加短暫延遲確保組件已完全掛載
    const timer = setTimeout(() => {
      loadFavorites();
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // 更新存儲
  useEffect(() => {
    if (isLoaded) {
      const saveFavorites = async () => {
        try {
          console.log(`嘗試儲存 ${favorites.length} 個收藏項目`);
          await storage.setItem('favorites', JSON.stringify(favorites));
          console.log('收藏儲存成功');
        } catch (error) {
          console.error('儲存收藏到儲存時失敗', error);
        }
      };

      saveFavorites();
    }
  }, [favorites, isLoaded]);

  // 添加到收藏
  const addToFavorites = (animal) => {
    if (!animal || !animal.animal_id) {
      console.error('嘗試添加無效的動物到收藏', animal);
      return;
    }
    
    // 檢查是否已存在於收藏中
    const exists = favorites.some(fav => fav.animal_id === animal.animal_id);
    
    if (!exists) {
      console.log(`添加動物 ID: ${animal.animal_id} 到收藏`);
      setFavorites(prev => [...prev, animal]);
    } else {
      console.log(`動物 ID: ${animal.animal_id} 已經在收藏中`);
    }
  };

  // 從收藏中移除
  const removeFromFavorites = (animal) => {
    if (!animal || !animal.animal_id) {
      console.error('嘗試從收藏中移除無效的動物', animal);
      return;
    }
    
    console.log(`從收藏中移除動物 ID: ${animal.animal_id}`);
    setFavorites(prev => 
      prev.filter(fav => fav.animal_id !== animal.animal_id)
    );
  };

  return (
    <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isLoaded }}>
      {children}
    </FavoritesContext.Provider>
  );
};

// 自定義Hook以便於在組件中使用
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};