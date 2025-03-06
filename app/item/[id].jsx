// app/item/[id].jsx
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, Image, ScrollView, 
  ActivityIndicator, TouchableOpacity, Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useFavorites } from '../../contexts/favorites.context.js';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimalDetailScreen = () => {
  const params = useLocalSearchParams();
  const { id } = params;
  const router = useRouter();
  const { favorites, addToFavorites, removeFromFavorites } = useFavorites();
  const [animal, setAnimal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMounted = useRef(true);
  
  // 使用 useMemo 來計算是否在收藏中，避免不必要的重新計算
  const isInFavorites = favorites ? favorites.some(fav => fav.animal_id === id) : false;

  // 組件卸載時清理
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchAnimalDetail = async () => {
      if (!id) {
        console.log('無法取得ID參數');
        setError('無法取得動物ID');
        return;
      }
      
      try {
        if (isMounted.current) setLoading(true);
        
        console.log('開始獲取動物資料，ID:', id);
        const response = await fetch('https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL');
        const data = await response.json();
        
        console.log('API回應數據長度:', data.length);
        
        // 使用字符串比較而不是直接比較
        const foundAnimal = data.find(item => String(item.animal_id) === String(id));
        
        console.log('找到動物?', foundAnimal ? '是' : '否');
        
        if (!isMounted.current) return;
        
        if (foundAnimal) {
          console.log('成功設置動物資料');
          setAnimal(foundAnimal);
        } else {
          console.log('找不到動物數據，ID:', id);
          setError('找不到該動物資料');
          
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
          }, 0);
        }
      } catch (error) {
        console.error('獲取動物數據時出錯:', error);
        if (isMounted.current) {
          setError('載入動物資料時發生錯誤');
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchAnimalDetail();
  }, [id, router]);

  const toggleFavorite = () => {
    if (!animal) return;
    
    if (isInFavorites) {
      removeFromFavorites(animal);
    } else {
      addToFavorites(animal);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a80f5" />
        <Text style={styles.loadingText}>資料正在路上，請稍候...</Text>
        <Text style={styles.debugText}>正在載入ID: {id}</Text>
      </View>
    );
  }

  if (error || !animal) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color="#ff6b6b" />
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
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButtonContainer}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.favoriteButtonContainer}
            onPress={toggleFavorite}
          >
            <Ionicons 
              name={isInFavorites ? "heart" : "heart-outline"} 
              size={24} 
              color={isInFavorites ? "red" : "#333"} 
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
    marginVertical: 20,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 5,
  },
  backButtonText: {
    color: 'white',
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
  favoriteButtonContainer: {
    padding: 8,
  },
  imageContainer: {
    height: 250,
    width: '100%',
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  detailContainer: {
    padding: 16,
    backgroundColor: 'white',
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
    color: '#333',
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
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
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
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  timeItem: {
    marginBottom: 12,
  },
  timeLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 16,
    color: '#333',
  },
  debugText: {
    marginTop: 10,
    fontSize: 14,
    color: '#ff6b6b',
  },
  debugInfo: {
    padding: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    margin: 5,
  },
  // 其他樣式保持不變
});

export default AnimalDetailScreen;