import React, { useState, useContext } from "react";
import { View, Button, Text, ActivityIndicator, StyleSheet,TouchableOpacity } from "react-native";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { router } from "expo-router"; // 使用 expo-router 的 router
import { auth } from "../firebase/firebaseConfig"; // 直接從設定文件引入已初始化的 auth
import { ThemeContext } from '@/contexts/ThemeContext';

const LoginScreen = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 確保在 Web 環境中
      if (typeof window !== 'undefined') {
        // 建立 Google 授權提供者
        const provider = new GoogleAuthProvider();
        
        // 使用 Firebase 的 signInWithPopup 方法 (適用於網頁環境)
        const result = await signInWithPopup(auth, provider);
        
        // 登入成功，使用 expo-router 進行導航
        console.log("登入成功:", result.user.displayName);
        
        // 使用 expo-router 的方式進行導航
        router.replace("/profile"); // 使用 router.replace 而非 navigation.navigate
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
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
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
      color: theme.text,
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
      color: theme.text,
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
    }
  });
}

export default LoginScreen;