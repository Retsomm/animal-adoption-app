// app/profile.jsx
import React,{ useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '@/contexts/ThemeContext';

const ProfileScreen = () => {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  // 假會員資料
  const memberInfo = {
    name: '王小明',
    email: 'wangxiaoming@example.com',
    phone: '0912-345-678',
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} 
            style={styles.profileImage} 
          />
        </View>
        <Text style={styles.name}>{memberInfo.name}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>個人資料</Text>
        
        <View style={styles.infoItem}>
          <Ionicons name="mail-outline" size={22} color="#666" />
          <Text style={styles.infoText}>{memberInfo.email}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={22} color="#666" />
          <Text style={styles.infoText}>{memberInfo.phone}</Text>
        </View>
      </View>
        <View style={styles.logOut}>
          <Ionicons name="log-out-outline" size={22} color="#666" />
          <Text style={styles.settingText}>登出</Text>
        </View>
    </ScrollView>
  );
};
function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      alignItems: 'center',
      marginTop: 80,
      backgroundColor: theme.background,
    },
    profileImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      overflow: 'hidden',
      marginBottom: 15,
    },
    profileImage: {
      width: '100%',
      height: '100%',
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    infoSection: {
      backgroundColor: theme.background,
      marginTop:30,
      margin: 15,
      paddingHorizontal: 20,
      paddingVertical: 15,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      margin: 15,
      color: theme.text,
      
    },
    infoItem: {
      flexDirection: 'row',
      alignItems: 'center',
      margin: 15,
    },
    infoText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 10,
    },
    logOut:{
      flex: 1,
      flexDirection: 'row',
      marginTop:100,
      alignItems: 'center',
      justifyContent:'center',
    },
    settingText: {
      fontSize: 16,
      color: theme.text,
      marginLeft: 10,
    }
    
  });
}
export default ProfileScreen;