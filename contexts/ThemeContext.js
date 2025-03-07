import { createContext, useState, useEffect } from 'react';
import { Appearance, Platform } from 'react-native';
import { Colors } from '@/constants/Colors';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // 初始化為 'light' 主題，然後在 useEffect 中更新
    // 這可以防止在 SSR 時產生不匹配
    const [colorScheme, setColorScheme] = useState('light');
    
    useEffect(() => {
        // 在客戶端運行時獲取系統主題
        const initialColorScheme = Appearance.getColorScheme() || 'light';
        setColorScheme(initialColorScheme);
        
        // Web 平台特定：監聽系統主題變化
        if (Platform.OS === 'web' && window.matchMedia) {
            const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            
            const updateColorScheme = (event) => {
                const newColorScheme = event.matches ? 'dark' : 'light';
                setColorScheme(newColorScheme);
            };
            
            // 初始檢查
            if (colorSchemeQuery.matches) {
                setColorScheme('dark');
            }
            
            // 添加變化監聽器
            if (colorSchemeQuery.addEventListener) {
                colorSchemeQuery.addEventListener('change', updateColorScheme);
            } else if (colorSchemeQuery.addListener) {
                // 舊版瀏覽器支援
                colorSchemeQuery.addListener(updateColorScheme);
            }
            
            // 清理監聽器
            return () => {
                if (colorSchemeQuery.removeEventListener) {
                    colorSchemeQuery.removeEventListener('change', updateColorScheme);
                } else if (colorSchemeQuery.removeListener) {
                    colorSchemeQuery.removeListener(updateColorScheme);
                }
            };
        } else {
            // 原生平台：使用 Appearance 監聽主題變化
            const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
                setColorScheme(newColorScheme || 'light');
            });
            
            // 清理訂閱
            return () => {
                if (subscription?.remove) {
                    subscription.remove();
                }
            };
        }
    }, []);
    
    const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
    
    return (
        <ThemeContext.Provider value={{
            colorScheme, 
            setColorScheme, 
            theme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};