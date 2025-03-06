// app/profile.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = () => {
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
          <Text style={styles.infoText}>電子郵件: {memberInfo.email}</Text>
        </View>
        
        <View style={styles.infoItem}>
          <Ionicons name="call-outline" size={22} color="#666" />
          <Text style={styles.infoText}>電話: {memberInfo.phone}</Text>
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>帳號設定</Text>
        
        <View style={styles.settingItem}>
          <Ionicons name="log-out-outline" size={22} color="#666" />
          <Text style={styles.settingText}>登出</Text>
          <Ionicons name="chevron-forward-outline" size={18} color="#999" style={styles.arrowIcon} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#f0f0f0',
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
    backgroundColor: 'white',
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  arrowIcon: {
    marginLeft: 'auto',
  },
});

export default ProfileScreen;