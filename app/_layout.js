// app/_layout.tsx
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesProvider } from '../contexts/favorites.context.js';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import React, { ErrorInfo, ReactNode } from 'react';
SplashScreen.preventAutoHideAsync(); // 確保載入畫面不會提前消失
// 創建一個錯誤邊界組件
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
            發生錯誤
          </Text>
          <Text style={{ color: 'red', marginBottom: 20 }}>
            {this.state.error && this.state.error.toString()}
          </Text>
          <TouchableOpacity
            style={{ padding: 10, backgroundColor: '#4a80f5', borderRadius: 5 }}
            onPress={() => this.setState({ hasError: false, error: null })}
          >
            <Text style={{ color: 'white' }}>重試</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}


export default function AppLayout() {
  const [loaded] = useFonts({
    // 如果您需要載入自定義字體，可以在此處添加
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <FavoritesProvider>
      <Tabs
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName = 'home';

            if (route.name === 'index') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'data') {
              iconName = focused ? 'list' : 'list-outline';
            } else if (route.name === 'collect') {
              iconName = focused ? 'heart' : 'heart-outline';
            } else if (route.name === 'profile') {
              iconName = focused ? 'person' : 'person-outline';
            }

            // 使用 View 包裹圖標，提供更好的間距控制
            return (
              <View style={styles.tabIconContainer}>
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
          tabBarStyle: styles.tabBar,
          tabBarItemStyle: styles.tabBarItem,
          tabBarLabelStyle: styles.tabBarLabel,
        })}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: '首頁',
          }}
        />
        <Tabs.Screen
          name="data"
          options={{
            title: '資料',
          }}
        />
        <Tabs.Screen
          name="collect"
          options={{
            title: '收藏',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: '會員',
          }}
        />
        
        {/* 隱藏路由，不在底部導覽列顯示 */}
        <Tabs.Screen
          name="item"
          options={{
            tabBarButton: () => null,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="+not-found"
          options={{
            tabBarButton: () => null,
            title: '頁面未找到',
          }}
        />
      </Tabs>
      </FavoritesProvider>
    </ErrorBoundary>
    
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
  tabBarItem: {
    margin: 5,  // 增加每個項目的外邊距
    paddingHorizontal: 10, // 增加水平內邊距
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  tabBarLabel: {
    fontSize: 12,
  },
});