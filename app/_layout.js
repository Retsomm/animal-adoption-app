// app/_layout.tsx
import { useEffect, useState, useCallback } from 'react';
import { Tabs, useRouter, usePathname } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { FavoritesProvider } from '../contexts/favorites.context.js';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, ThemeContext } from "@/contexts/ThemeContext.js";
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { app } from '../firebase/firebaseConfig';
import { UserProvider } from '../contexts/user.context'; // 添加 UserProvider

// 初始化 Firebase Auth
const auth = getAuth(app);

SplashScreen.preventAutoHideAsync(); // 確保載入畫面不會提前消失

export default function AppLayout() {
  return (
    <ThemeProvider>
      <UserProvider> {/* 添加 UserProvider 包裹 */}
        <AppContent />
      </UserProvider>
    </ThemeProvider>
  );
}

function AppContent() {
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);
  const [user, setUser] = useState(null);
  const [userChecked, setUserChecked] = useState(false); // 新增狀態以跟踪是否已檢查使用者
  const router = useRouter();
  const pathname = usePathname();

  // 監聽使用者登入狀態
  useEffect(() => {
    console.log('設置身份驗證監聽器');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setUserChecked(true); // 標記已檢查使用者狀態
      console.log('使用者狀態變更:', currentUser ? '已登入' : '未登入');
    });
    
    return () => {
      console.log('清理身份驗證監聽器');
      unsubscribe();
    };
  }, []);

  // 保持原有的使用者標籤點擊處理邏輯
  const handleUserTabPress = useCallback((e) => {
    // 防止默認導航行為
    e.preventDefault();
    
    // 直接檢查當前的用戶狀態
    console.log('處理用戶標籤點擊，當前用戶狀態:', user ? '已登入' : '未登入');
    
    // 已登入狀態直接導向到個人資料頁面
    if (user) {
      console.log('用戶已登入，直接導向個人資料頁面');
      router.navigate('/profile');
    } else {
      // 未登入狀態直接導向到登入頁面
      console.log('用戶未登入，直接導向登入頁面');
      router.navigate('/login');
    }
  }, [user, router]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <FavoritesProvider>
        <Tabs
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;
            
              if (route.name === 'index') {
                iconName = 'home';
              } else if (route.name === 'data') {
                iconName = 'list';
              } else if (route.name === 'collect') {
                iconName = focused ? 'heart' : 'heart-o';
              } else if (route.name === 'profile' || route.name === 'login' || route.name === 'user') {
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
            listeners={{
              tabPress: handleUserTabPress
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
      paddingLeft:500,
      marginHorizontal: -30,
      backgroundColor: theme?.background || '#ffffff',
      color: theme?.text || '#000000',
    },
    tabIconContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 3,
    },
    tabBarLabel: {
      fontSize: 16,
    },
    tabBarItem: {
      flexDirection: 'column',
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight:-60,
    },
  });
}