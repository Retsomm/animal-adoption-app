import React, { useEffect, useState, useContext } from "react";
import { View, Text, Button, Image, StyleSheet } from "react-native";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from '@/contexts/ThemeContext';

const ProfileScreen = () => {
  const auth = getAuth();
  const navigation = useNavigation();
  const [user, setUser] = useState(null);
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        // 使用 navigate 替代 replace
        navigation.navigate("login");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    // 使用 navigate 替代 replace
    navigation.navigate("login");
  };

  if (!user) return <Text>載入中...</Text>;

  return (
    <View style={styles.profileContainer} >
      <Text style={styles.profileText}>個人資料</Text>
      {user.photoURL && <Image source={{ uri: user.photoURL }} style={{ width: 100, height: 100, borderRadius: 50, marginBottom:20}} />}
      <Text style={styles.profileText}>姓名: {user.displayName}</Text>
      <Text style={styles.profileText}>Email: {user.email}</Text>
      <Button style={styles.profileButton} title="登出" onPress={handleLogout} />
    </View>
  );
};

export default ProfileScreen;

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
    profileButton:{
      backgroundColor: colorScheme === 'dark' ? "white" : "black",
    }

  });
}