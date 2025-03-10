// contexts/user.context.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../firebase/firebaseConfig';
import { 
  saveUserData, 
  getUserData, 
  addToCollect, 
  removeFromCollect, 
  subscribeToUserData 
} from '../firebase/db';
import { onAuthStateChanged } from 'firebase/auth';

// 建立使用者上下文
export const UserContext = createContext(null);

// 使用者狀態提供者元件
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 當授權狀態變更時獲取用戶資料
  useEffect(() => {
    console.log('UserProvider 初始化，當前狀態:', { loading, user: user?.uid });
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
        console.log('身份驗證狀態變更:', currentUser?.uid);
        setUser(currentUser);
        setLoading(true);
      
        if (currentUser) {
            console.log('開始獲取用戶數據...');
            // 先檢查用戶資料是否存在，如不存在則創建
            const result = await getUserData(currentUser.uid);
            
            if (!result.data) {
            // 建立新使用者資料
            const newUserData = {
                email: currentUser.email,
                name: currentUser.displayName,
                collect: {}, // 初始化空的收藏物件
                createdAt: new Date().toISOString(),
            };
            
            await saveUserData(currentUser.uid, newUserData);
            setUserData(newUserData);
            } else {
            setUserData(result.data);
            }
            
            // 訂閱使用者資料變更
            const unsubscribeUserData = subscribeToUserData(currentUser.uid, (result) => {
            if (result.data) {
                setUserData(result.data);
            }
            if (result.error) {
                setError(result.error);
            }
            });
            
            setLoading(false);
            return () => unsubscribeUserData(); // 清理監聽
        } else {
            setUserData(null);
            setLoading(false);
        }
    });

    return () => unsubscribeAuth(); // 清理授權監聽
  }, []);

  // 添加到收藏
  const addToUserCollect = async (animalId) => {
    if (!user) {
      setError('請先登入');
      return false;
    }
    
    const result = await addToCollect(user.uid, animalId);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    
    return true;
  };

  // 從收藏移除
  const removeFromUserCollect = async (animalId) => {
    if (!user) {
      setError('請先登入');
      return false;
    }
    
    const result = await removeFromCollect(user.uid, animalId);
    if (!result.success) {
      setError(result.error);
      return false;
    }
    
    return true;
  };

  // 檢查是否已收藏
  const isCollected = (animalId) => {
    if (!userData || !userData.collect) {
      return false;
    }
    
    return !!userData.collect[animalId];
  };

  // 提供全部收藏ID列表
  const getAllCollects = () => {
    if (!userData || !userData.collect) {
      return [];
    }
    
    // 從物件轉換為陣列
    return Object.keys(userData.collect).filter(key => userData.collect[key]);
  };

  const value = {
    user,
    userData,
    loading,
    error,
    addToCollect: addToUserCollect,
    removeFromCollect: removeFromUserCollect,
    isCollected,
    getAllCollects,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// 使用該上下文的自定義 Hook
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser 必須在 UserProvider 內使用');
  }
  return context;
};