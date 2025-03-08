import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

// 這個頁面作為 user 標籤的目標路由
// 它會根據用戶登入狀態自動重定向到登入或個人資料頁面
export default function UserRedirectPage() {
  const [isRedirecting, setIsRedirecting] = useState(false);
  
  useEffect(() => {
    // 使用 setTimeout 確保組件已完全掛載
    const timer = setTimeout(() => {
      const auth = getAuth();
      
      // 使用 onAuthStateChanged 監聽來確保我們獲得最新的登入狀態
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        if (!isRedirecting) {
          setIsRedirecting(true);
          
          // 根據登入狀態重定向
          if (currentUser) {
            router.replace('/profile');
          } else {
            router.replace('/login');
          }
        }
      });
      
      // 清理訂閱
      return () => {
        unsubscribe();
      };
    }, 100); // 短暫延遲確保組件已掛載
    
    return () => clearTimeout(timer);
  }, []);
  
  // 顯示載入畫面
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '重定向中...' }} />
      <ActivityIndicator size="large" color="#0000ff" />
      <Text style={styles.text}>正在檢查登入狀態...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  text: {
    marginTop: 20,
    fontSize: 16
  }
});