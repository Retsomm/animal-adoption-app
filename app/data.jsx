// app/data.jsx 修正版 - 解決收藏按鈕無反應問題
import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Modal,
  SafeAreaView,
  Alert,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ThemeContext } from '@/contexts/ThemeContext';
import { useUser } from '../contexts/user.context'; 
import { getCacheData, setCacheData } from '../firebase/firebaseCacheService';

const DataScreen = () => {
  const { colorScheme, theme } = useContext(ThemeContext);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [animals, setAnimals] = useState([]);
  const [filteredAnimals, setFilteredAnimals] = useState([]);
  const [filters, setFilters] = useState({
    area: '',
    kind: '',
    bodyType: '',
    breed: '',
    color: '',
    sex: ''
  });
  
  // 使用 user context
  const { user, isCollected, addToCollect, removeFromCollect } = useUser();
  
  // 添加收藏狀態追蹤
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // 篩選選項
  const [areas, setAreas] = useState([]);
  const [kinds, setKinds] = useState([]);
  const [bodyTypes, setBodyTypes] = useState([]);
  const [breeds, setBreeds] = useState([]);
  const [colors, setColors] = useState([]);
  
  // 篩選視窗控制
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState({...filters});
  const styles = createStyles(theme, colorScheme);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 定義一個快取鍵，可以根據需要添加版本號
      const cacheKey = 'animal_data_v1'; 
      
      // 嘗試從快取獲取資料
      const cachedData = await getCacheData(cacheKey);
      
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
        // 如果有快取資料，直接使用
        console.log("使用快取資料，總計：", cachedData.length, "筆記錄");
        setAnimals(cachedData);
        setFilteredAnimals(cachedData);
        
        // 處理篩選選項
        processFilterOptions(cachedData);
        
        setLoading(false);
        return;
      }
      
      // 如果沒有快取或快取已過期，從 API 獲取資料
      console.log("快取不可用，從 API 獲取資料");
      const apiUrl = "https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL";
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        console.error("API返回的數據不是陣列:", data);
        setAnimals([]);
        setFilteredAnimals([]);
        setLoading(false);
        return;
      }
      
      console.log("從 API 獲取資料成功，總計：", data.length, "筆記錄");
      
      // 將資料存入快取
      await setCacheData(cacheKey, data);
      
      setAnimals(data);
      setFilteredAnimals(data);
      
      // 處理篩選選項
      processFilterOptions(data);
      
      setLoading(false);
    } catch (error) {
      console.error("獲取資料錯誤:", error.message);
      setAnimals([]);
      setFilteredAnimals([]);
      setLoading(false);
    }
  };
  
  // 將篩選選項處理邏輯抽取為一個單獨的函數
  const processFilterOptions = (data) => {
    if (data.length > 0) {
      // 安全地取得所有篩選選項
      const safeGet = (item, prop) => {
        if (item && item[prop] !== undefined && item[prop] !== null) {
          return prop === 'animal_place' ? item[prop].substring(0, 3) : item[prop];
        }
        return '';
      };
      
      const uniqueAreas = [...new Set(data.map(item => safeGet(item, 'animal_place')))].filter(Boolean);
      const uniqueKinds = [...new Set(data.map(item => safeGet(item, 'animal_kind')))].filter(Boolean);
      const uniqueBodyTypes = [...new Set(data.map(item => safeGet(item, 'animal_bodytype')))].filter(Boolean);
      const uniqueBreeds = [...new Set(data.map(item => safeGet(item, 'animal_Variety')))].filter(Boolean);
      const uniqueColors = [...new Set(data.map(item => safeGet(item, 'animal_colour')))].filter(Boolean);

      setAreas(uniqueAreas);
      setKinds(uniqueKinds);
      setBodyTypes(uniqueBodyTypes);
      setBreeds(uniqueBreeds);
      setColors(uniqueColors);
    }
  };
  
  // 初次載入時抓取資料
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 500); // 增加短暫延遲，確保組件已完全掛載
    
    return () => clearTimeout(timer);
  }, []);
  
  // 套用篩選 - 增加安全檢查
  const applyFilters = () => {
    if (!Array.isArray(animals) || animals.length === 0) {
      setFilteredAnimals([]);
      return;
    }
    
    let filtered = [...animals];
    
    if (filters.area) {
      filtered = filtered.filter(animal => {
        const placePrefix = animal && animal.animal_place ? animal.animal_place.substring(0, 3) : '';
        return placePrefix === filters.area;
      });
    }
    
    if (filters.kind) {
      filtered = filtered.filter(animal => animal && animal.animal_kind === filters.kind);
    }
    
    if (filters.bodyType) {
      filtered = filtered.filter(animal => animal && animal.animal_bodytype === filters.bodyType);
    }
    
    if (filters.breed) {
      filtered = filtered.filter(animal => animal && animal.animal_Variety === filters.breed);
    }
    
    if (filters.color) {
      filtered = filtered.filter(animal => animal && animal.animal_colour === filters.color);
    }
    
    if (filters.sex) {
      filtered = filtered.filter(animal => {
        if (!animal) return false;
        if (filters.sex === 'M') return animal.animal_sex === 'M';
        if (filters.sex === 'F') return animal.animal_sex === 'F';
        if (filters.sex === 'N') return animal.animal_sex === 'N';
        return true;
      });
    }
    
    setFilteredAnimals(filtered);
  };
  
  // 修改狀態更新邏輯，避免過早更新狀態
  useEffect(() => {
    if (animals.length > 0) {  // 只有當animals有數據時，才應用過濾器
      applyFilters();
    }
  }, [filters, animals, forceUpdate]);  // 添加 forceUpdate 依賴
  
  // 處理收藏/取消收藏
  const handleToggleFavorite = async (item) => {
    if (!item) {
      console.error('收藏操作錯誤: 項目為空');
      return;
    }
    
    // 確保有用戶登入
    if (!user) {
      console.log('用戶未登入，提示登入');
      Alert.alert(
        '需要登入',
        '請先登入以使用收藏功能',
        [
          { text: '取消', style: 'cancel' },
          { text: '去登入', onPress: () => router.push('/login') }
        ]
      );
      return;
    }
    
    try {
      const animalId = item.animal_id.toString();
      console.log('處理收藏/取消收藏，ID:', animalId);
      
      // 檢查目前收藏狀態
      const isCurrentlyCollected = isCollected(animalId);
      console.log('目前收藏狀態:', isCurrentlyCollected);
      
      if (isCurrentlyCollected) {
        console.log('嘗試取消收藏');
        await removeFromCollect(animalId);
        console.log('已從收藏中移除:', animalId);
      } else {
        console.log('嘗試添加收藏');
        await addToCollect(animalId);
        console.log('已添加到收藏:', animalId);
      }
      
      // 不要重新渲染整個列表，只通知 UI 收藏狀態已更新
      // 這裡什麼都不做，因為 useUser 會自動更新狀態
      // 如果需要，可以添加一些視覺反饋
      
    } catch (err) {
      console.error('收藏操作錯誤:', err);
      Alert.alert('操作失敗', '無法更新收藏狀態，請稍後再試');
    }
  };
  
  //渲染動物項目函數
  const renderAnimalItem = React.useCallback(({ item }) => {
    if (!item) return null;
    
    // 確保 item 是有效的對象
    const safeItem = {
      animal_id: item.animal_id || 'unknown',
      animal_kind: item.animal_kind || '未知種類',
      animal_Variety: item.animal_Variety || '未知品種',
      animal_place: item.animal_place || '未知地點',
      animal_sex: item.animal_sex || '未知性別',
      animal_colour: item.animal_colour || '未知',
      animal_bodytype: item.animal_bodytype || '未知',
      album_file: item.album_file || null
    };
    
    // 檢查動物是否已經在收藏中
    const animalId = item.animal_id?.toString();
    const isInFavorites = user && animalId ? isCollected(animalId) : false;
    
    return (
      <TouchableOpacity 
        style={styles.animalCard}
        onPress={() => {
          const animalId = String(item.animal_id);
          console.log("正在跳轉到動物ID:", item.animal_id);
          router.push(`/item/${item.animal_id}`);
        }}
      >
        <View style={styles.animalInfo}>
          {safeItem.album_file ? (
            <Image 
              source={{ uri: safeItem.album_file }} 
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
            <Text style={styles.animalName}>{safeItem.animal_kind} - {safeItem.animal_Variety}</Text>
            <Text style={styles.animalItem}>地區: {safeItem.animal_place ? safeItem.animal_place.substring(0, 3) : '未知'}</Text>
            <Text style={styles.animalItem}>性別: {safeItem.animal_sex === 'M' ? '公' : safeItem.animal_sex === 'F' ? '母' : '未知'}</Text>
            <Text style={styles.animalItem}>顏色: {safeItem.animal_colour}</Text>
            <Text style={styles.animalItem}>體型: {safeItem.animal_bodytype}</Text>
          </View>
        </View>
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            accessible={true}
            accessibilityLabel="Do you like it?"
            style={styles.favoriteButton}
            onPress={(e) => {
              e.stopPropagation();
              console.log('收藏按鈕被點擊');
              handleToggleFavorite(item);
            }}
          >
            <FontAwesome name={isInFavorites ? "heart" : "heart-o"} size={24} color="red" />
            <Text style={styles.favoriteButtonText}>
              {isInFavorites ? '取消收藏' : '收藏'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            accessible={true}
            accessibilityLabel="Detail"
            style={styles.detailButton}
            onPress={() => {
              console.log("正在從詳細資料按鈕跳轉到動物ID:", item.animal_id);
              router.push(`/item/${item.animal_id}`);
            }}
          >
            <FontAwesome name="info-circle" size={24} color="gray" />
            <Text style={styles.detailButtonText}>詳細資料</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, [user, isCollected]);
  
  const renderFilterCollapsible = () => {
    return (
      <TouchableOpacity 
        accessible={true}
        accessibilityLabel="Filter condictions"
        style={styles.filterCollapsible}
        onPress={() => {
          setTempFilters({...filters});
          setFilterModalVisible(true);
        }}
      >
        <View style={styles.filterCollapsibleContent}>
          <Text style={styles.filterTitle}>篩選條件</Text>
          <Text style={styles.filterSummary}>
            {Object.values(filters).filter(Boolean).length > 0 
              ? `已套用 ${Object.values(filters).filter(Boolean).length} 個篩選條件` 
              : '點擊設定篩選條件'}
          </Text>
        </View>
        <FontAwesome name="filter" size={24} color="#4a80f5" />
      </TouchableOpacity>
    );
  };
  
  const renderFilterModal = () => {
    return (
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>篩選條件</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <FontAwesome name="times" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            {/* 區域篩選 */}
            <Text style={styles.filterLabel}>地區</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={true} style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  tempFilters.area === '' && styles.filterOptionSelected
                ]}
                onPress={() => setTempFilters({...tempFilters, area: ''})}
              >
                <Text style={[
                  styles.filterOptionText, 
                  tempFilters.area === '' && styles.filterOptionTextSelected
                ]}>全部</Text>
              </TouchableOpacity>
              {areas.map((area, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.filterOption, 
                    tempFilters.area === area && styles.filterOptionSelected
                  ]}
                  onPress={() => setTempFilters({...tempFilters, area: area})}
                >
                  <Text style={[
                    styles.filterOptionText, 
                    tempFilters.area === area && styles.filterOptionTextSelected
                  ]}>{area}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* 種類篩選 */}
            <Text style={styles.filterLabel}>種類</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterOptions}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  tempFilters.kind === '' && styles.filterOptionSelected
                ]}
                onPress={() => setTempFilters({...tempFilters, kind: ''})}
              >
                <Text style={[
                  styles.filterOptionText, 
                  tempFilters.kind === '' && styles.filterOptionTextSelected
                ]}>全部</Text>
              </TouchableOpacity>
              {kinds.map((kind, index) => (
                <TouchableOpacity 
                  key={index}
                  style={[
                    styles.filterOption, 
                    tempFilters.kind === kind && styles.filterOptionSelected
                  ]}
                  onPress={() => setTempFilters({...tempFilters, kind: kind})}
                >
                  <Text style={[
                    styles.filterOptionText, 
                    tempFilters.kind === kind && styles.filterOptionTextSelected
                  ]}>{kind}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            {/* 性別篩選 */}
            <Text style={styles.filterLabel}>性別</Text>
            <View style={styles.filterOptionsRow}>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  tempFilters.sex === '' && styles.filterOptionSelected
                ]}
                onPress={() => setTempFilters({...tempFilters, sex: ''})}
              >
                <Text style={[
                  styles.filterOptionText, 
                  tempFilters.sex === '' && styles.filterOptionTextSelected
                ]}>全部</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  tempFilters.sex === 'M' && styles.filterOptionSelected
                ]}
                onPress={() => setTempFilters({...tempFilters, sex: 'M'})}
              >
                <Text style={[
                  styles.filterOptionText, 
                  tempFilters.sex === 'M' && styles.filterOptionTextSelected
                ]}>公</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  tempFilters.sex === 'F' && styles.filterOptionSelected
                ]}
                onPress={() => setTempFilters({...tempFilters, sex: 'F'})}
              >
                <Text style={[
                  styles.filterOptionText, 
                  tempFilters.sex === 'F' && styles.filterOptionTextSelected
                ]}>母</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.filterOption, 
                  tempFilters.sex === 'N' && styles.filterOptionSelected
                ]}
                onPress={() => setTempFilters({...tempFilters, sex: 'N'})}
              >
                <Text style={[
                  styles.filterOptionText, 
                  tempFilters.sex === 'N' && styles.filterOptionTextSelected
                ]}>未知</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
          
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              accessible={true}
              accessibilityLabel="Reset condictions"
              style={styles.resetButton} 
              onPress={() => setTempFilters({
                area: '',
                kind: '',
                bodyType: '',
                breed: '',
                color: '',
                sex: ''
              })}
            >
              <Text style={styles.resetButtonText}>重置</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              accessible={true}
              accessibilityLabel="Ensure condictions"
              style={styles.confirmButton} 
              onPress={() => {
                setFilters({...tempFilters});
                setFilterModalVisible(false);
              }}
            >
              <Text style={styles.confirmButtonText}>確認</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.dataContainer}>
        {renderFilterCollapsible()}
        {renderFilterModal()}
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>資料正在路上，請稍候...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAnimals}
            renderItem={renderAnimalItem}
            keyExtractor={(item) => item?.animal_id?.toString() || Math.random().toString()}
            style={styles.animalList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>沒有符合條件的資料</Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1, // 確保 SafeAreaView 撐滿全屏
    },
    dataContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    filterCollapsible: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 15,
      backgroundColor: theme.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    filterCollapsibleContent: {
      flex: 1,
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    filterSummary: {
      color: theme.text,
      marginTop: 4,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: 18,
      color: theme.text,
      textAlign: 'center',
    },
    emptyContainer: {
      padding: 20,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 16,
      color: theme.text,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
      color: theme.text,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
      color: theme.text,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.text,
    },
    modalContent: {
      flex: 1,
      padding: 15,
      color: theme.text,
    },
    modalFooter: {
      flexDirection: 'row',
      padding: 15,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      color: theme.text,
    },
    resetButton: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? "black" : "white",
      borderRadius: 5,
      padding: 15,
      alignItems: 'center',
      marginRight: 10,
      borderColor:colorScheme === 'dark' ? "white" : "black",
      width:100,
      borderWidth:1
    },
    resetButtonText: {
      color: theme.text,
      fontWeight: 'bold',
    },
    confirmButton: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? "black" : "white",
      borderRadius: 5,
      padding: 15,
      alignItems: 'center',
      borderColor:colorScheme === 'dark' ? "white" : "black",
      borderWidth:1,
      width:100,
    },
    confirmButtonText: {
      color: theme.text,
      fontWeight: 'bold',
    },
    filterLabel: {
      fontSize: 16,
      marginTop: 15,
      marginBottom: 5,
      fontWeight: 'bold',
      color: theme.text,
    },
    filterOptions: {
      flexDirection: 'row',
      marginBottom: 15,
    },
    filterOptionsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 15,
    },
    filterOption: {
      backgroundColor: theme.background,
      paddingHorizontal: 15,
      paddingVertical: 8,
      borderRadius: 20,
      marginRight: 8,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filterOptionSelected: {
      backgroundColor: theme.background,
      borderColor: colorScheme === 'dark' ? "skyblue" : "orange",
    },
    filterOptionText: {
      color: theme.text,
    },
    filterOptionTextSelected: {
      color: colorScheme === 'dark' ? "skyblue" : "orange",
      fontWeight: 'bold',
    },
    dropdownContainer: {
      paddingVertical: 5,
    },
    dropdown: {
      width: '100%',
      height: 40,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: 5,
      paddingHorizontal: 10,
      justifyContent: 'center',
    },
    dropdownText: {
      fontSize: 16,
      paddingVertical: 8,
      color: theme.text,
    },
    dropdownList: {
      width: 300,
      marginTop: 8,
      borderRadius: 5,
    },
    dropdownItemText: {
      fontSize: 16,
    },
    animalList: {
      flex: 1,
      padding: 10,
    },
    animalCard: {
      backgroundColor: theme.background,
      padding: 15,
      marginBottom: 15,
      borderRadius: 10,
      boxShadowColor: theme.shadow,
      boxShadowOffset: { width: 0, height: 2 },
      boxShadowOpacity: 0.1,
      boxShadowRadius: 4,
      elevation: 2,
    },
    animalInfo: {
      flexDirection: 'row',
    },
    animalItem:{
      color:theme.text,
      marginBottom:5,
    },
    animalImage: {
      width: 120,
      height: 120,
      borderRadius: 10,
      alignItems: 'center',
      marginLeft: 20,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    noImage: {
      width: 100,
      height: 100,
      borderRadius: 10,
      marginLeft: 30,
      backgroundColor: theme.background,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    animalDetails: {
      flex: 1,
      color:theme.text,
      justifyContent:'center',
      marginLeft: 50,
    },
    animalName: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
      color:theme.text,
    },
    buttonContainer: {
      flexDirection: 'row',
      marginTop: 10,
      justifyContent: 'space-between',
    },
    favoriteButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.button,
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
      backgroundColor: theme.button,
      padding: 8,
      borderRadius: 5,
      flex: 1,
      marginLeft: 5,
      borderColor:colorScheme === 'dark' ? "white" : "black",
      borderWidth:1
    },
    detailButtonText: {
      marginLeft: 5,
      color: colorScheme === 'dark' ? "white" : "black",
    },
    favoriteButtonText: {
      marginLeft: 5,
      color: colorScheme === 'dark' ? "white" : "black",
    },
  });
}

export default DataScreen;