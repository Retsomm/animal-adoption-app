import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter, Stack } from 'expo-router';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useFavorites } from '../contexts/favorites.context.js';
import { useUser } from '../contexts/user.context';
import { getCacheData, setCacheData } from '../firebase/firebaseCacheService';

const CollectScreen = () => {
  const router = useRouter();
  const { favorites, removeFromFavorites } = useFavorites();
  const { colorScheme, theme } = useContext(ThemeContext);
  
  // 使用 user context 整合 Firebase 收藏功能
  const { user, userData, loading: userLoading, removeFromCollect } = useUser();
  
  const [usingFirebase, setUsingFirebase] = useState(false);
  const [collectData, setCollectData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadTimer, setLoadTimer] = useState(null);
  
  // 添加快取控制
  const [cachedAnimalData, setCachedAnimalData] = useState(null);
  const initialLoadComplete = useRef(false);
  const isProcessingRemove = useRef(false);
  
  const styles = createStyles(theme, colorScheme);

  // 獲取動物資料（優先使用快取）
  const fetchAnimalData = useCallback(async () => {
    console.log('收藏頁面: 獲取動物資料（優先使用快取）');
    
    // 檢查是否已有快取資料
    if (cachedAnimalData) {
      console.log('收藏頁面: 使用記憶體中的快取資料', cachedAnimalData.length);
      return cachedAnimalData;
    }
    
    try {
      // 嘗試從 Firebase 快取獲取
      const cacheKey = 'animal_data_v1';
      const cachedData = await getCacheData(cacheKey);
      
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log('收藏頁面: 使用 Firebase 快取資料，總計：', cachedData.length, '筆記錄');
        setCachedAnimalData(cachedData);
        return cachedData;
      }
      
      // 如果沒有快取，從 API 獲取
      console.log('收藏頁面: 未找到快取，從 API 獲取動物資料');
      const response = await fetch('https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL');
      
      if (!response.ok) {
        throw new Error('無法獲取動物資料');
      }
      
      const data = await response.json();
      console.log('收藏頁面: API 返回的資料筆數:', data.length);
      
      if (!Array.isArray(data)) {
        throw new Error('API 返回的數據格式不正確');
      }
      
      // 保存到快取
      await setCacheData(cacheKey, data);
      console.log('收藏頁面: 已將資料保存到快取');
      
      setCachedAnimalData(data);
      return data;
    } catch (err) {
      console.error('收藏頁面: 獲取動物資料錯誤:', err);
      throw err;
    }
  }, [cachedAnimalData]);

  // 優化的載入收藏函數 (使用快取)
  const loadCollections = useCallback(async () => {
    // 如果正在處理移除操作，則跳過重新載入
    if (isProcessingRemove.current) {
      console.log('收藏頁面: 正在處理移除操作，跳過重新載入');
      return;
    }
    
    console.log('收藏頁面: 開始載入收藏資料...');
    try {
      setLoading(true);
      
      // 如果用戶已登入並有 userData
      if (user && userData && userData.collect) {
        console.log('收藏頁面: 使用者已登入，使用 Firebase 收藏');
        setUsingFirebase(true);
        
        // 檢查是否有收藏資料
        const userCollectIds = Object.keys(userData.collect || {});
        console.log('收藏頁面: 用戶收藏 ID 數量:', userCollectIds.length);
        
        if (userCollectIds.length === 0) {
          console.log('收藏頁面: 沒有收藏資料');
          setCollectData([]);
          setLoading(false);
          return;
        }
        
        // 獲取動物資料 (使用快取)
        const animalData = await fetchAnimalData();
        
        // 篩選出用戶收藏的動物
        const collectedAnimals = animalData.filter(animal => {
          if (!animal || !animal.animal_id) return false;
          const animalIdStr = animal.animal_id.toString();
          const isInCollection = userCollectIds.includes(animalIdStr);
          if (isInCollection) {
            console.log(`收藏頁面: 找到匹配的收藏動物 ID: ${animalIdStr}`);
          }
          return isInCollection;
        });
        
        console.log('收藏頁面: 篩選後的收藏動物數量:', collectedAnimals.length);
        setCollectData(collectedAnimals);
      } else {
        // 否則使用本地收藏
        console.log('收藏頁面: 使用者未登入或無收藏資料，使用本地收藏');
        setUsingFirebase(false);
        console.log('收藏頁面: 本地收藏數量:', favorites.length);
        setCollectData(favorites);
      }
      console.log('收藏頁面: 收藏資料載入完成');
    } catch (err) {
      console.error('收藏頁面: 獲取收藏動物錯誤:', err);
      setError('無法載入收藏的動物資料');
      // 回退到使用本地收藏
      setUsingFirebase(false);
      setCollectData(favorites);
    } finally {
      setLoading(false);
      console.log('收藏頁面: 載入狀態已更新為 false');
    }
  }, [user, userData, favorites, fetchAnimalData]);

  // 處理移除收藏 - 不會觸發頁面重新載入
  const handleRemoveFromFavorites = useCallback(async (item) => {
    if (!item || !item.animal_id) {
      console.error('收藏頁面: 移除收藏錯誤: 無效的動物資料');
      return;
    }

    const animalId = item.animal_id.toString();
    console.log('收藏頁面: 開始處理移除收藏操作', animalId);
    
    try {
      // 標記正在處理移除操作
      isProcessingRemove.current = true;
      
      // 立即更新 UI，提前從列表中移除該項目
      setCollectData(currentData => {
        return currentData.filter(animal => 
          animal && animal.animal_id && animal.animal_id.toString() !== animalId
        );
      });
      
      // 延遲執行後端操作
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // 執行後端操作
      if (usingFirebase && user) {
        console.log('收藏頁面: 使用 Firebase 移除收藏', animalId);
        await removeFromCollect(animalId);
        console.log('收藏頁面: Firebase 移除完成', animalId);
      } else {
        console.log('收藏頁面: 使用本地收藏系統移除', animalId);
        removeFromFavorites(item);
        console.log('收藏頁面: 本地收藏系統移除完成', animalId);
      }
      
      // 完成處理
      setTimeout(() => {
        isProcessingRemove.current = false;
      }, 500);
      
    } catch (err) {
      console.error('收藏頁面: 移除收藏操作錯誤:', err);
      setError('移除收藏操作失敗');
      isProcessingRemove.current = false;
    }
  }, [user, usingFirebase, removeFromCollect, removeFromFavorites]);

  // 首次載入時執行
  useEffect(() => {
    if (!initialLoadComplete.current && !isProcessingRemove.current) {
      console.log('收藏頁面: 首次載入');
      loadCollections();
      initialLoadComplete.current = true;
    }
  }, [loadCollections]);
  
  // 用戶狀態或收藏數據變化時重新載入
  useEffect(() => {
    // 只有在非移除操作期間且已完成初始載入時才重新載入
    if (initialLoadComplete.current && !isProcessingRemove.current) {
      console.log('收藏頁面: 用戶狀態或收藏數據變化觸發重新載入');
      
      if (loadTimer) {
        clearTimeout(loadTimer);
      }
      
      const timer = setTimeout(() => {
        loadCollections();
      }, 300);
      
      setLoadTimer(timer);
    }
    
    return () => {
      if (loadTimer) {
        clearTimeout(loadTimer);
      }
    };
  }, [
    // 只監聽真正需要的變化
    user?.uid,
    // 用收藏數量而非內容作為依賴項
    userData ? Object.keys(userData.collect || {}).length : 0,
    favorites.length
  ]);

  // 渲染收藏項目
  const renderFavoriteItem = useCallback(({ item }) => {
    if (!item) return null;
    
    return (
      <TouchableOpacity 
        style={styles.animalCard}
        onPress={() => router.push(`/item/${item.animal_id}`)}
      >
        <View style={styles.animalInfo}>
          {item.album_file ? (
            <Image 
              source={{ uri: item.album_file }} 
              style={styles.animalImage} 
              resizeMode="cover"
            />
          ) : (
            <Image
              source={require('../assets/images/default.jpg')} 
              style={styles.animalImage} 
              resizeMode="cover"
            />
          )}
          <View style={styles.animalDetails}>
            <Text style={styles.animalName}>{item.animal_kind} - {item.animal_Variety || '未知品種'}</Text>
            <Text style={styles.animalItem}>地區: {item.animal_place ? item.animal_place.substring(0, 3) : '未知'}</Text>
            <Text style={styles.animalItem}>性別: {item.animal_sex === 'M' ? '公' : item.animal_sex === 'F' ? '母' : '未知'}</Text>
            <Text style={styles.animalItem}>顏色: {item.animal_colour || '未知'}</Text>
            <Text style={styles.animalItem}>體型: {item.animal_bodytype || '未知'}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
        <TouchableOpacity 
          accessible={true}
          accessibilityLabel="Remove collected"
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            handleRemoveFromFavorites(item);
          }}
        >
          <FontAwesome name="heart" size={24} color="red" />
          <Text style={styles.favoriteButtonText}>取消收藏</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          accessible={true}
          accessibilityLabel="Detail"
          style={styles.detailButton}
          onPress={() => router.push(`/item/${item.animal_id}`)}
        >
          <FontAwesome name="info-circle" size={24} color="#4a80f5" />
          <Text style={styles.detailButtonText}>詳細資料</Text>
        </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [handleRemoveFromFavorites, router, styles]);

  // 顯示載入中
  if (loading || userLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: '收藏' }} />
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.loadingText}>載入收藏中...</Text>
      </View>
    );
  }
  
  // 顯示錯誤
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Stack.Screen options={{ title: '收藏' }} />
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '收藏' }} />
      {collectData.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.noFavoritesText}>尚無收藏的動物</Text>
          <TouchableOpacity 
            style={styles.browseButton}
            onPress={() => router.push('/data')}
          >
            <Text style={styles.browseButtonText}>瀏覽動物</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={collectData}
          renderItem={renderFavoriteItem}
          keyExtractor={(item) => item?.animal_id?.toString() || Math.random().toString()}
          style={styles.animalList}
          removeClippedSubviews={false}
        />
      )}
    </View>
  );
};

// 樣式保持不變
function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    centerContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    animalList: {
      flex: 1,
      padding: 10,
      width: '100%',
    },
    animalCard: {
      backgroundColor: theme.background,
      padding: 15,
      marginBottom: 15,
      borderRadius: 10,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    animalInfo: {
      flexDirection: 'row',
    },
    animalImage: {
      width: 120,
      height: 120,
      borderRadius: 10,
      alignItems: 'center',
      marginLeft: 20,
      justifyContent: 'flex-start',
    },
    animalDetails: {
      flex: 1,
      justifyContent:'center',
      marginLeft: 50,
    },
    animalName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: theme.text
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 10,
      justifyContent: 'space-between',
    },
    removeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorScheme === 'dark' ? "black" : "white",
      padding: 8,
      borderRadius: 5,
      flex: 1,
      marginRight: 5,
      borderColor:colorScheme === 'dark' ? "white" : "black",
      borderWidth:1
    },
    detailButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colorScheme === 'dark' ? "black" : "white",
      padding: 8,
      borderRadius: 5,
      flex: 1,
      marginLeft: 5,
      borderColor:colorScheme === 'dark' ? "white" : "black",
      borderWidth:1
    },
    detailButtonText: {
      marginLeft: 5,
      color: theme.text
    },
    favoriteButtonText: {
      marginLeft: 5,
      color: theme.text
    },
    noFavoritesText: {
      fontSize: 18,
      color: theme.text
    },
    animalItem:{
      color:theme.text,
      marginBottom:5,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: theme.text,
    },
    errorText: {
      color: 'red',
      textAlign: 'center',
      fontSize: 16,
    },
    browseButton: {
      backgroundColor: "#4285F4",
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginTop: 20,
    },
    browseButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold",
    },
  });
}

export default CollectScreen;