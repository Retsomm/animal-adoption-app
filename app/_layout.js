// app/_layout.tsx
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FavoritesProvider } from '../contexts/favorites.context.js';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
SplashScreen.preventAutoHideAsync(); // 確保載入畫面不會提前消失

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
        
      </Tabs>
      </FavoritesProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
    paddingHorizontal: 20,
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