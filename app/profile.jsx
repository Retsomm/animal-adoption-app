import React, { useEffect, useContext, useRef } from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { signOut } from "firebase/auth";
import { router, Stack } from "expo-router";
import { ThemeContext } from '@/contexts/ThemeContext';
import { auth } from "../firebase/firebaseConfig";
import { useUser } from '../contexts/user.context';

const ProfileScreen = () => {
  const { colorScheme, theme } = useContext(ThemeContext);
  const { user, userData, loading } = useUser();
  const styles = createStyles(theme, colorScheme);
  const redirectedRef = useRef(false);
  
  // 未登入時導航到登入頁面
  // 使用 ref 確保每個渲染週期只執行一次跳轉
  useEffect(() => {
    if (!loading && !user && !redirectedRef.current) {
      redirectedRef.current = true;
      console.log("使用者未登入，重定向到登入頁面");
      
      // 使用 setTimeout 避免路由更新與渲染衝突
      setTimeout(() => {
        router.replace("/login");
      }, 100);
    }
  }, [user, loading]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 登出後使用者狀態會變更，useEffect 會處理導航
    } catch (error) {
      console.error("登出錯誤:", error);
    }
  };

  // 顯示載入中
  if (loading) {
    return (
      <View style={[styles.profileContainer, styles.centerContent]}>
        <Stack.Screen options={{ title: '個人資料' }} />
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.profileText}>載入中...</Text>
      </View>
    );
  }

  // 用戶未登入但還在處理重定向
  if (!user) {
    return (
      <View style={[styles.profileContainer, styles.centerContent]}>
        <Stack.Screen options={{ title: '重定向中' }} />
        <ActivityIndicator size="large" color="#4285F4" />
        <Text style={styles.profileText}>重定向中...</Text>
      </View>
    );
  }

  // 計算收藏數量 - 支援物件格式的收藏
  const collectCount = userData && userData.collect 
    ? Object.keys(userData.collect).length 
    : 0;

  return (
    <View style={styles.profileContainer}>
      <Stack.Screen options={{ title: '個人資料' }} />
      <Text style={styles.profileTitle}>個人資料</Text>
      
      {user.photoURL && (
        <Image 
          source={{ uri: user.photoURL }} 
          style={styles.profileImage} 
        />
      )}
      
      <View style={styles.infoContainer}>
        <Text style={styles.profileText}>姓名： {user.displayName}</Text>
        <Text style={styles.profileText}>Email： {user.email}</Text>
        <Text style={styles.profileText}>收藏數量： {collectCount} 筆</Text>
      </View>
      
      <TouchableOpacity 
        accessible={true}
        accessibilityLabel="View Collections"
        onPress={() => router.push("/collect")} 
        style={styles.collectButton}>
        <Text style={styles.buttonText}>查看收藏</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        accessible={true}
        accessibilityLabel="Logout"
        onPress={handleLogout} 
        style={styles.logoutButton}>
        <Text style={styles.buttonText}>登出</Text>
      </TouchableOpacity>
    </View>
  );
};

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    profileContainer: {
      flex: 1, 
      padding: 20,
      backgroundColor: theme.background,
    },
    centerContent: {
      justifyContent: "center", 
      alignItems: "center",
    },
    profileTitle: {
      fontSize: 24,
      fontWeight: "bold",
      color: theme.text,
      marginBottom: 30,
      textAlign: "center",
      marginTop: 20,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      alignSelf: "center",
      marginBottom: 30,
    },
    infoContainer: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
      padding: 20,
      borderRadius: 10,
      marginBottom: 30,
    },
    profileText: {
      color: theme.text,
      marginBottom: 15,
      fontSize: 16,
    },
    collectButton: {
      backgroundColor: "#4a80f5", // 藍色
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 5,
      marginBottom: 15,
      alignItems: "center"
    },
    logoutButton: {
      backgroundColor: "#f44336", // 紅色
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 5,
      alignItems: "center"
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold"
    }
  });
}

export default ProfileScreen;