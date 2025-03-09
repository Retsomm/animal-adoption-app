import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { Link, Stack } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { ThemeContext } from '@/contexts/ThemeContext';

export default function HomeScreen() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  
  const [isLoading, setIsLoading] = useState(true);
  const styles = createStyles(theme, colorScheme);
  
  // 模擬載入時間，然後顯示介面
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // 載入中畫面
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a80f5" />
        <Text style={styles.loadingText}>應用程式準備中...</Text>
      </View>
    );
  }
  
  return (
    <ScrollView>
      <View style={styles.container}>
            <Stack.Screen options={{ title: '首頁' }} />
            
            <View style={styles.header}>
              <Text style={styles.title}>動物領養平台
              <TouchableOpacity 
                accessible={true}
                accessibilityLabel="Switch mode"
                style={styles.themeToggle}
                onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}>
                <FontAwesome 
                  name={colorScheme === 'dark' ? "moon-o" : "sun-o"} 
                  size={24} 
                  color={theme.icon} 
                />
              </TouchableOpacity>
              </Text>
              <Text style={styles.subtitle}>幫助無家可歸的動物找到溫暖的家</Text>
            </View>
            
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1036&q=80' }}
                style={styles.image}
                resizeMode="cover"
              />
            </View>
            
            <View style={styles.infoSection}>
              <Text style={styles.infoTitle}>一起來幫助流浪動物</Text>
              <Text style={styles.infoText}>
                本應用程式提供全台灣各收容所的動物資訊，幫助您找到最適合的寵物夥伴。
                您可以瀏覽不同地區的待認養動物，並查看詳細資訊。
              </Text>
            </View>
            
            <View style={styles.buttonContainer}>
              <Link href="/data" asChild>
              <TouchableOpacity 
                accessible={true}
                accessibilityLabel="Ready to see animal's data."
                style={styles.button}>
                <FontAwesome name="search" size={24} style={styles.buttonIcon} />
                <Text style={styles.buttonText}>開始瀏覽動物資料</Text>
              </TouchableOpacity>
              </Link>
            </View>
            <View style={styles.featureContainer}>
              <View style={styles.featureItem}>
              <FontAwesome name="filter" size={24} color="#4a80f5" />
                <Text style={styles.featureText}>多種篩選條件</Text>
              </View>
              <View style={styles.featureItem}>
              <FontAwesome name="heart" size={24} color="#4a80f5" />
                <Text style={styles.featureText}>收藏喜愛動物</Text>
              </View>
              <View style={styles.featureItem}>
              <FontAwesome name="info-circle" size={24} color="#4a80f5" />
                <Text style={styles.featureText}>詳細資訊查詢</Text>
              </View>
            </View>
      </View>
    </ScrollView>
  );
}

function createStyles(theme, colorScheme) {
  // 檢查是否為網頁環境
  const isWeb = Platform.OS === 'web';
  
  // 創建基本樣式
  const styles = {
    SafeAreaView: {
      flex: 1
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.background,
    },
    loadingText: {
      marginTop: 20,
      fontSize: 16,
      color: theme.text,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
      padding: 20,
      // 直接在樣式對象中添加網頁特定的媒體查詢
      ...(isWeb && {
        '@media (min-width: 1024px)': {
          maxWidth: 960,
          margin: '0 auto',
        },
        '@media (min-width: 768px) and (max-width: 1023px)': {
          maxWidth: 720,
          margin: '0 auto',
          padding: 15,
        },
        '@media (max-width: 767px)': {
          padding: 15,
        },
      }),
    },
    header: {
      marginBottom: 20,
      alignItems: 'center',
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 10,
      // 直接在樣式對象中添加網頁特定的媒體查詢
      ...(isWeb && {
        '@media (max-width: 767px)': {
          fontSize: 24,
        },
      }),
    },
    subtitle: {
      fontSize: 16,
      color: theme.text,
      textAlign: 'center',
    },
    imageContainer: {
      height: 200,
      borderRadius: 15,
      overflow: 'hidden',
      marginBottom: 20,
      elevation: 3,
      boxShadowColor: theme.shadow,
      boxShadowOffset: { width: 0, height: 2 },
      boxShadowOpacity: 0.1,
      boxShadowRadius: 4,
      // 直接在樣式對象中添加網頁特定的媒體查詢
      ...(isWeb && {
        '@media (min-width: 768px) and (max-width: 1023px)': {
          height: 250,
        },
        '@media (max-width: 767px)': {
          height: 180,
        },
      }),
    },
    image: {
      width: '100%',
      height: '100%',
    },
    infoSection: {
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 15,
      marginBottom: 20,
      elevation: 2,
      shadowColor: theme.shaodw,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    infoTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 10,
      color: theme.text,
    },
    infoText: {
      fontSize: 14,
      lineHeight: 22,
      color: theme.text,
    },
    buttonContainer: {
      marginBottom: 20,
    },
    button: {
      backgroundColor: colorScheme === 'dark' ? "black" : "white",
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 15,
      borderRadius: 10,
      borderColor: colorScheme === 'dark' ? "white" : "black",
      borderWidth: 1
    },
    buttonIcon: {
      marginRight: 10,
      color: colorScheme === 'dark' ? "white" : "black",
    },
    buttonText: {
      color: colorScheme === 'dark' ? "white" : "black",
      fontSize: 16,
      fontWeight: 'bold',
    },
    featureContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 10,
      // 直接在樣式對象中添加網頁特定的媒體查詢
      ...(isWeb && {
        '@media (max-width: 767px)': {
          flexDirection: 'column',
          alignItems: 'center',
        },
      }),
    },
    featureItem: {
      alignItems: 'center',
      padding: 10,
    },
    featureText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.text,
    },
    themeToggle: {
      paddingLeft: 10,
    }
  };

  // 將樣式對象轉換為 StyleSheet
  return StyleSheet.create(styles);
}