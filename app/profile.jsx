import React, { useEffect, useState, useContext } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { router } from "expo-router"; // 使用 expo-router 替代 useNavigation
import { ThemeContext } from '@/contexts/ThemeContext';
import { auth } from "../firebase/firebaseConfig"; // 直接從設定文件引入已初始化的 auth

const ProfileScreen = () => {
  const [user, setUser] = useState(null);
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // 使用 router.replace 導航到登入頁面
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // 使用 router.replace 導航到登入頁面
      router.replace("/login");
    } catch (error) {
      console.error("登出錯誤:", error);
    }
  };

  if (!user) return <Text style={styles.profileText}>載入中...</Text>;

  return (
    <View style={styles.profileContainer} >
      <Text style={styles.profileText}>個人資料</Text>
      {user.photoURL && <Image source={{ uri: user.photoURL }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom:20}} />}
      <Text style={styles.profileText}>姓名: {user.displayName}</Text>
      <Text style={styles.profileText}>Email: {user.email}</Text>
      <Button 
        title="登出" 
        onPress={handleLogout} 
      />
    </View>
  );
};

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    profileContainer:{
      flex: 1, 
      justifyContent: "center", 
      alignItems: "center",
      backgroundColor: theme.background,
      color: theme.text,
    },
    profileText:{
      color: theme.text,
      marginBottom:20,
    },
  });
}

export default ProfileScreen;