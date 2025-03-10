import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from "react-native";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { router, Stack } from "expo-router";
import { auth } from "../firebase/firebaseConfig";
import { ThemeContext } from '@/contexts/ThemeContext';
import { useUser } from '../contexts/user.context';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { colorScheme, theme } = useContext(ThemeContext);
  const { user } = useUser();
  const redirectedRef = useRef(false);
  
  const styles = createStyles(theme, colorScheme);
  
  // 如果用戶已登入，自動跳轉到個人資料頁面
  // 使用 ref 確保每個渲染週期只執行一次跳轉
  useEffect(() => {
    if (user && !redirectedRef.current) {
      redirectedRef.current = true;
      console.log("使用者已登入，重定向到個人資料頁面");
      
      // 使用 setTimeout 避免路由更新與渲染衝突
      setTimeout(() => {
        router.replace("/profile");
      }, 100);
    }
  }, [user]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 確保在 Web 環境中
      if (typeof window !== 'undefined') {
        // 建立 Google 授權提供者
        const provider = new GoogleAuthProvider();
        
        // 使用 Firebase 的 signInWithPopup 方法 (適用於網頁環境)
        await signInWithPopup(auth, provider);
        
        // 登入成功後，user context 會自動更新，並透過 useEffect 導航到個人資料頁面
      } else {
        throw new Error("目前環境不支援彈出式視窗登入");
      }
    } catch (error) {
      console.error("登入失敗:", error);
      setError(`登入失敗: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: '登入' }} />
      <Text style={styles.mentionText}>登入後開始使用收藏功能</Text>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#4285F4" />
      ) : (
        <TouchableOpacity 
          accessible={true}
          accessibilityLabel="GMail login"
          onPress={handleGoogleLogin} 
          style={styles.button}>
          <Text style={styles.buttonText}>GMail 登入</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
      backgroundColor: theme.background,
    },
    title: {
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: 20,
      color: theme.text,
    },
    errorContainer: {
      padding: 10,
      backgroundColor: theme.background,
      borderRadius: 5,
      marginBottom: 15,
      width: "100%",
    },
    errorText: {
      color: "red"
    },
    button: {
      backgroundColor: "#4285F4", // Google 藍色
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 5,
      width: "50%",
      alignItems: "center"
    },
    buttonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "bold"
    },
    mentionText:{
      fontSize:24,
      color:theme.text,
      marginBottom:30,
    }
  });
}

export default LoginScreen;