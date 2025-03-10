import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { router, Stack } from 'expo-router';
import { useUser } from '../contexts/user.context';

// 這個頁面作為 user 標籤的目標路由
export default function UserRedirectPage() {
  const [pageTitle, setPageTitle] = useState('檢查中...');
  const { user, loading } = useUser();
  
  // 使用 sessionStorage 或 AsyncStorage 來避免重複檢查
  useEffect(() => {
    // 跳過載入階段，等待用戶數據完全加載
    if (loading) return;
    
    console.log('用戶頁面 - 檢查登入狀態', user ? '已登入' : '未登入');
    
    // 如果用戶已登入，直接跳轉到個人資料頁面
    if (user) {
      setPageTitle('會員');
      console.log('用戶已登入，立即導向個人資料頁面');
      router.replace('/profile');
    } else {
      // 如果未登入，直接跳轉到登入頁面
      setPageTitle('登入');
      console.log('用戶未登入，立即導向登入頁面');
      router.replace('/login');
    }

    // 添加一個安全超時，以防任何原因導致無法完成導航
    const timeoutId = setTimeout(() => {
      console.log('導航超時，強制重定向');
      if (user) {
        router.replace('/profile');
      } else {
        router.replace('/login');
      }
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [user, loading]);

  // 顯示載入畫面，但通常用戶不會看到這個畫面太久
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: pageTitle }} />
      <ActivityIndicator size="large" color="#4285F4" />
      <Text style={styles.text}>正在導向...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff'
  },
  text: {
    marginTop: 20,
    fontSize: 16,
    color: '#333'
  }
});