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
        const storedFavorites = await storage.getItem('favorites');
        if (storedFavorites !== null && isMounted.current) {
          setFavorites(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error('Failed to load favorites from storage', error);
      } finally {
        if (isMounted.current) {
          setIsLoaded(true);
        }
      }
    };

    loadFavorites();
  }, []);

  // 更新存儲
  useEffect(() => {
    if (isLoaded) {
      const saveFavorites = async () => {
        try {
          await storage.setItem('favorites', JSON.stringify(favorites));
        } catch (error) {
          console.error('Failed to save favorites to storage', error);
        }
      };

      saveFavorites();
    }
  }, [favorites, isLoaded]);
  useEffect(() => {
    // 添加短暫延遲確保組件已完全掛載
    const timer = setTimeout(() => {
      const loadFavorites = async () => {
        // 加載邏輯
      };
      loadFavorites();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);
  // 添加到收藏
  const addToFavorites = (animal) => {
    // 檢查是否已存在於收藏中
    const exists = favorites.some(fav => fav.animal_id === animal.animal_id);
    if (!exists) {
      setFavorites(prev => [...prev, animal]);
    }
  };

  // 從收藏中移除
  const removeFromFavorites = (animal) => {
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