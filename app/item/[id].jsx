// app/item/[id].jsx 優化版 - 使用快取功能
import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, 
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
// 保留本地收藏功能引入，因為可能還有其他地方依賴它
import { useFavorites } from '../../contexts/favorites.context.js';
import { useUser } from '../../contexts/user.context.js';
import { ThemeContext } from '@/contexts/ThemeContext';
import { getCacheData, setCacheData } from '../../firebase/firebaseCacheService';
 
const AnimalDetailScreen = () => {
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  const { colorScheme, theme } = useContext(ThemeContext);
  
  // 使用 Firebase 相關功能
  const { user, isCollected, addToCollect, removeFromCollect } = useUser();
  
  const styles = createStyles(theme, colorScheme);

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  // 檢查動物是否在收藏中
  const [isInFavorites, setIsInFavorites] = useState(false);
  
  // 更新收藏狀態 - 基於用戶是否登入選擇不同的檢查方式
  useEffect(() => {
    const checkIsInFavorites = () => {
      // 如果用戶已登入，使用 Firebase 收藏
      if (user && id) {
        const result = isCollected(id.toString());
        console.log('檢查 Firebase 收藏狀態:', id, result);
        return result;
      } 
      // 否則使用本地收藏 (或者如果已經不想使用本地收藏，則始終返回 false)
      else if (id) {
        const result = favorites.some(fav => String(fav.animal_id) === String(id));
        console.log('檢查本地收藏狀態:', id, result);
        return result;
      }
      return false;
    };
    
    const isInFavoritesResult = checkIsInFavorites();
    console.log('最終收藏狀態:', isInFavoritesResult);
    setIsInFavorites(isInFavoritesResult);
  }, [user, id, favorites, isCollected]);

  // 從緩存或 API 獲取動物資料的函數
  const fetchAnimalData = useCallback(async () => {
    console.log('詳情頁面: 獲取動物資料（優先使用快取）');
    
    try {
      // 嘗試從 Firebase 快取獲取
      const cacheKey = 'animal_data_v1';
      const cachedData = await getCacheData(cacheKey);
      
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        console.log('詳情頁面: 使用 Firebase 快取資料，總計：', cachedData.length, '筆記錄');
        return cachedData;
      }
      
      // 如果沒有快取，從 API 獲取
      console.log('詳情頁面: 未找到快取，從 API 獲取動物資料');
      
      // 使用加載超時控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15秒超時
      
      const response = await fetch(
        'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL', 
        { signal: controller.signal }
      );
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API 回應錯誤: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('API 返回的數據格式不正確');
      }
      
      console.log('詳情頁面: API 返回的資料筆數:', data.length);
      
      // 保存到快取
      await setCacheData(cacheKey, data);
      console.log('詳情頁面: 已將資料保存到快取');
      
      return data;
    } catch (err) {
      console.error('詳情頁面: 獲取動物資料錯誤:', err);
      throw err;
    }
  }, []);

  // 使用 useEffect 載入動物詳情
  useEffect(() => {
    const loadAnimalDetail = async () => {
      if (!id) {
        console.log('無法取得ID參數');
        setError('無法取得動物ID');
        setLoading(false);
        return;
      }
      
      try {
        if (isMounted.current) setLoading(true);
        
        console.log('開始獲取動物詳情，ID:', id);
        
        // 從快取或 API 獲取完整動物數據
        const allAnimalData = await fetchAnimalData();
        
        // 使用字符串比較查找特定動物
        const foundAnimal = allAnimalData.find(item => 
          item && item.animal_id && String(item.animal_id) === String(id)
        );
        
        console.log('找到動物?', foundAnimal ? '是' : '否');
        
        if (!isMounted.current) return;
        
        if (foundAnimal) {
          console.log('成功設置動物資料');
          setAnimal(foundAnimal);
          setLoading(false);
        } else {
          console.log('找不到動物數據，ID:', id);
          setError('找不到該動物資料');
          setLoading(false);
          
          // 使用 setTimeout 確保不在渲染期間執行 Alert
          setTimeout(() => {
            if (isMounted.current) {
              Alert.alert(
                '找不到資料',
                `無法找到此動物的詳細資料 (ID: ${id})，可能已被移除或更新。`,
                [
                  { 
                    text: '返回列表', 
                    onPress: () => router.back() 
                  }
                ]
              );
            }
          }, 100);
        }
      } catch (error) {
        console.error('獲取動物數據時出錯:', error.message);
        if (isMounted.current) {
          if (error.name === 'AbortError') {
            setError('載入動物資料超時，請檢查網路連接');
          } else {
            setError('載入動物資料時發生錯誤: ' + error.message);
          }
          setLoading(false);
        }
      }
    };

    loadAnimalDetail();
  }, [id, router, fetchAnimalData]);
  
  // 切換收藏狀態的函數 - 根據用戶登入狀態選擇不同的收藏方法
  const toggleFavorite = async () => {
    if (!animal) return;
    
    try {
      // 使用 Firebase 收藏
      if (user) {
        const animalId = animal.animal_id.toString();
        
        if (isInFavorites) {
          await removeFromCollect(animalId);
          console.log('從 Firebase 收藏中移除:', animalId);
        } else {
          await addToCollect(animalId);
          console.log('添加到 Firebase 收藏:', animalId);
        }
        
        // 立即更新 UI 狀態，不需要等待重新渲染
        setIsInFavorites(!isInFavorites);
      } 
      // 使用本地收藏 (如果決定保留本地收藏作為未登入時的備用) 
      else {
        if (isInFavorites) {
          removeFromFavorites(animal);
          console.log('從本地收藏中移除:', animal.animal_id);
        } else {
          addToFavorites(animal);
          console.log('添加到本地收藏:', animal.animal_id);
        }
        
        // 立即更新 UI 狀態
        setIsInFavorites(!isInFavorites);
        
        // 或者提示用戶登入 (如果想完全轉移到 Firebase)
        Alert.alert(
          '需要登入',
          '請先登入以使用收藏功能',
          [
            { text: '取消', style: 'cancel' },
            { text: '前往登入', onPress: () => router.push('/login') }
          ]
        );
        return; // 中止後續操作
      }
    } catch (err) {
      console.error('處理收藏操作錯誤:', err);
      Alert.alert('操作失敗', '無法更新收藏狀態，請稍後再試');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Stack.Screen options={{ title: '動物詳情' }} />
        <ActivityIndicator size="large" color="#4a80f5" />
        <Text style={styles.loadingText}>資料正在路上，請稍候...</Text>
        <Text style={styles.debugText}>正在載入ID: {id}</Text>
      </View>
    );
  }
  
  if (error || !animal) {
    return (
      <View style={styles.errorContainer}>
        <Stack.Screen options={{ title: '錯誤' }} />
        <FontAwesome name="exclamation-circle" size={60} color="#ff6b6b" />
        <Text style={styles.errorText}>{error || '找不到該動物資料'}</Text>
        <Text style={styles.debugText}>請求的ID: {id}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>返回</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  // 處理可能缺失的資料
  const getDefaultIfEmpty = (value) => value || "未提供";
  
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: animal?.animal_kind || '動物詳情' }} />
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonContainer}
          onPress={() => router.push('/data')}
        >
          <FontAwesome name="arrow-left" size={24} style={styles.arrowIcon}/>
        </TouchableOpacity>
        
        {/* 收藏按鈕 */}
        <TouchableOpacity 
          style={styles.collectButtonContainer}
          onPress={toggleFavorite}
        >
          <FontAwesome 
            name={isInFavorites ? "heart" : "heart-o"} 
            size={24} 
            color={isInFavorites ? "red" : theme.text} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.imageContainer}>
        <Image
          source={{ uri: animal.album_file || 'https://via.placeholder.com/300x200' }}
          style={styles.image}
          defaultSource={require('../../assets/images/default.jpg')}
        />
      </View>

      <View style={styles.detailContainer}>
        <View style={styles.nameContainer}>
          <Text style={styles.animalName}>
            {getDefaultIfEmpty(animal.animal_kind)} - {getDefaultIfEmpty(animal.animal_Variety)}
          </Text>
          <View style={styles.badgeContainer}>
            <View style={[styles.badge, { backgroundColor: animal.animal_sex === 'M' ? '#81d4fa' : animal.animal_sex === 'F' ? '#f48fb1' : '#e0e0e0' }]}>
              <Text style={styles.badgeText}>
                {animal.animal_sex === 'M' ? '公' : animal.animal_sex === 'F' ? '母' : '未知'}
              </Text>
            </View>
          </View>
        </View>
        
        {/* 收藏按鈕區塊 */}
        <TouchableOpacity 
          style={[
            styles.collectFullButton,
            isInFavorites ? styles.collectActiveButton : null
          ]}
          onPress={toggleFavorite}
        >
          <FontAwesome 
            name={isInFavorites ? "heart" : "heart-o"} 
            size={20} 
            color="white" 
          />
          <Text style={styles.collectButtonText}>
            {isInFavorites ? '取消收藏' : '加入收藏'}
          </Text>
        </TouchableOpacity>

        {/* 其他內容不變 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>基本資訊</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>體型</Text>
              <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_bodytype)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>毛色</Text>
              <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_colour)}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>年齡</Text>
              <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_age)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>狀態</Text>
              <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_status)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>醫療資訊</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>絕育狀態</Text>
              <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_sterilization)}</Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>狂犬病疫苗</Text>
              <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_bacterin)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>相關時間</Text>
          
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>開放認養時間（起）</Text>
            <Text style={styles.timeValue}>{getDefaultIfEmpty(animal.animal_opendate)}</Text>
          </View>
          
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>開放認養時間（迄）</Text>
            <Text style={styles.timeValue}>{getDefaultIfEmpty(animal.animal_closeddate)}</Text>
          </View>
          
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>資料更新時間</Text>
            <Text style={styles.timeValue}>{getDefaultIfEmpty(animal.animal_update)}</Text>
          </View>
          
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>資料建立時間</Text>
            <Text style={styles.timeValue}>{getDefaultIfEmpty(animal.animal_createtime)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>其他資訊</Text>
          
          <View style={styles.fullInfoItem}>
            <Text style={styles.infoLabel}>尋獲地</Text>
            <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_foundplace)}</Text>
          </View>
          
          <View style={styles.fullInfoItem}>
            <Text style={styles.infoLabel}>備註</Text>
            <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_remark)}</Text>
          </View>
          
          <View style={styles.fullInfoItem}>
            <Text style={styles.infoLabel}>其他說明</Text>
            <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.animal_caption)}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>收容所資訊</Text>
          
          <View style={styles.fullInfoItem}>
            <Text style={styles.infoLabel}>收容所名稱</Text>
            <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.shelter_name)}</Text>
          </View>
          
          <View style={styles.fullInfoItem}>
            <Text style={styles.infoLabel}>地址</Text>
            <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.shelter_address)}</Text>
          </View>
          
          <View style={styles.fullInfoItem}>
            <Text style={styles.infoLabel}>電話</Text>
            <Text style={styles.infoValue}>{getDefaultIfEmpty(animal.shelter_tel)}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    collectButtonContainer: {
      padding: 8,
    },
    collectFullButton: {
      backgroundColor: '#ff4757',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      marginVertical: 15,
    },
    collectActiveButton: {
      backgroundColor: '#ff6b81',
    },
    collectButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 10,
      fontSize: 18,
      color: theme.text,
      textAlign: 'center',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: theme.background,
    },
    errorText: {
      fontSize: 18,
      color: theme.text,
      textAlign: 'center',
      marginVertical: 20,
    },
    backButton: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      backgroundColor: theme.button,
      borderRadius: 5,
      marginTop: 10,
    },
    backButtonText: {
      color: colorScheme === 'dark' ? "white" : "black",
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 16,
    },
    backButtonContainer: {
      padding: 8,
    },
    imageContainer: {
      height: 250,
      width: '100%',
      backgroundColor: theme.background,
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    detailContainer: {
      padding: 16,
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      marginTop: -20,
    },
    nameContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 15,
    },
    animalName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.text,
      flex: 1,
    },
    badgeContainer: {
      flexDirection: 'row',
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 14,
      marginLeft: 8,
    },
    badgeText: {
      color: theme.text,
      fontSize: 14,
      fontWeight: 'bold',
    },
    section: {
      marginBottom: 20,
      backgroundColor: theme.background,
      padding: 15,
      borderRadius: 10,
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      elevation: 2,
    },
    arrowIcon: {
      color: theme.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 20,
      marginTop: 10,
      color: theme.text,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    infoItem: {
      flex: 1,
    },
    fullInfoItem: {
      marginBottom: 15,
    },
    infoLabel: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 10,
      fontWeight: '800',
    },
    infoValue: {
      fontSize: 16,
      color: theme.text,
    },
    timeItem: {
      marginBottom: 12,
    },
    timeLabel: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 10,
      fontWeight: '800',
    },
    timeValue: {
      fontSize: 16,
      color: theme.text,
    },
    debugText: {
      marginTop: 10,
      fontSize: 14,
      color: theme.text,
    },
  });
}

export default AnimalDetailScreen;