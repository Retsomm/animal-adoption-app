// app/_layout.tsx
import { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome } from '@expo/vector-icons';
import { FavoritesProvider } from '../contexts/favorites.context.js';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, View } from 'react-native';
import { ThemeProvider, ThemeContext } from "@/contexts/ThemeContext.js";
import { useContext } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

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
  const { colorScheme, setColorScheme, theme } = useContext(ThemeContext);
  const styles = createStyles(theme, colorScheme);

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
              }
            
              // 使用 View 包裹圖標，提供更好的間距控制
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
          <Tabs.Screen
            name="profile"
            options={{
              title: '會員',
              headerShown: false,
            }}
          />
          <Tabs.Screen
            name="item"
            options={{
              tabBarButton: () => null,
              headerShown: false,
              tabBarStyle: { display: 'none' }
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
      paddingLeft: 65,
      backgroundColor: theme.background,
      color: theme.text,
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
}