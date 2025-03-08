// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { FavoritesProvider } from '../contexts/favorites.context.js';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, ThemeContext } from "@/contexts/ThemeContext.js";
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

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
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { colorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  const [user, setUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false);

  // 監聽使用者登入狀態
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUserChecked(true);
      console.log('使用者狀態變更:', currentUser ? '已登入' : '未登入');
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FavoritesProvider>
        <Tabs
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName = 'home';
            
              if (route.name === 'index') {
                iconName = focused ? 'home' : 'home';
              } else if (route.name === 'data') {
                iconName = focused ? 'list' : 'list';
              } else if (route.name === 'collect') {
                iconName = focused ? 'heart' : 'heart-o';
              } else if (route.name === 'profile') {
                iconName = focused ? 'user' : 'user-o';
              } else if (route.name === 'login') {
                iconName = focused ? 'user' : 'user-o';
              } else if (route.name === 'user') {
                iconName = focused ? 'user' : 'user-o';
              }
            
              return (
                <View style={styles.tabIconContainer}>
                  <FontAwesome name={iconName} size={size} color={color} />
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
            name="item"
            options={{
              tabBarButton: () => null,
              headerShown: false,
              tabBarStyle: { 
                display: 'none',
                height:0,
                position:'absolute',
                bottom: -1000, 
               }
            }}
          />
          <Tabs.Screen
            name="index"
            options={{
              title: '首頁',
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="data"
            options={{
              title: '資料',
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="collect"
            options={{
              title: '收藏',
              headerShown: false,
            }}
          />
          
          {/* 第五個位置 - 使用者標籤 */}
          <Tabs.Screen
            name="user"
            options={{
              title: userChecked ? (user ? '會員' : '登入') : '使用者',
              headerShown: false,
            }}
          />
          
          {/* 隱藏的實際路由頁面 */}
          <Tabs.Screen
            name="profile"
            options={{
              tabBarButton: () => null,
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="login"
            options={{
              tabBarButton: () => null,
              headerShown: false,
            }}
          />
        </Tabs>
      </FavoritesProvider>
    </SafeAreaView>
  );
}

function createStyles(theme, colorScheme) {
  return StyleSheet.create({
    safeArea: {
      flex: 1, // 確保 SafeAreaView 撐滿全屏
    }, 
    tabBar: {
      height: 60,
      paddingBottom: 5,
      paddingTop: 5,
      paddingHorizontal: 20,
      backgroundColor: theme?.background || '#ffffff',
      color: theme?.text || '#000000',
    },
    tabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 3,
    },
    tabBarLabel: {
      fontSize: 12,
    },
    tabBarItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
}