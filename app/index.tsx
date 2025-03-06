// app/index.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Link, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  
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
    <View style={styles.container}>
      <Stack.Screen options={{ title: '首頁' }} />
      
      <View style={styles.header}>
        <Text style={styles.title}>動物領養平台</Text>
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
          <TouchableOpacity style={styles.button}>
            <Ionicons name="search" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.buttonText}>開始瀏覽動物資料</Text>
          </TouchableOpacity>
        </Link>
      </View>
      
      <View style={styles.featureContainer}>
        <View style={styles.featureItem}>
          <Ionicons name="filter" size={24} color="#4a80f5" />
          <Text style={styles.featureText}>多種篩選條件</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="heart" size={24} color="#4a80f5" />
          <Text style={styles.featureText}>收藏喜愛動物</Text>
        </View>
        <View style={styles.featureItem}>
          <Ionicons name="information-circle" size={24} color="#4a80f5" />
          <Text style={styles.featureText}>詳細資訊查詢</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  imageContainer: {
    height: 200,
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#666',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4a80f5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  featureItem: {
    alignItems: 'center',
    padding: 10,
  },
  featureText: {
    marginTop: 8,
    fontSize: 14,
    color: '#333',
  },
});