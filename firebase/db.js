// firebase/db.js
import { getDatabase, ref, set, get, push, update, remove, onValue } from 'firebase/database';
import { app } from './firebaseConfig';

// 初始化資料庫
const database = getDatabase(app);

// 儲存使用者資料
export const saveUserData = async (userId, userData) => {
  try {
    await set(ref(database, `users/${userId}`), userData);
    return { success: true, error: null };
  } catch (error) {
    console.error('儲存使用者資料錯誤:', error);
    return { success: false, error: error.message };
  }
};

// 獲取使用者資料
export const getUserData = async (userId) => {
  try {
    const snapshot = await get(ref(database, `users/${userId}`));
    if (snapshot.exists()) {
      return { data: snapshot.val(), error: null };
    } else {
      return { data: null, error: null };
    }
  } catch (error) {
    console.error('獲取使用者資料錯誤:', error);
    return { data: null, error: error.message };
  }
};

// 更新使用者資料 (只更新指定的欄位)
export const updateUserData = async (userId, updates) => {
  try {
    await update(ref(database, `users/${userId}`), updates);
    return { success: true, error: null };
  } catch (error) {
    console.error('更新使用者資料錯誤:', error);
    return { success: false, error: error.message };
  }
};

// 添加動物到收藏 (使用物件格式儲存)
export const addToCollect = async (userId, animalId) => {
  try {
    // 先獲取當前收藏
    const userDataResult = await getUserData(userId);
    
    if (userDataResult.error) {
      throw new Error(userDataResult.error);
    }
    
    const userData = userDataResult.data || {};
    const collect = userData.collect || {};
    
    // 新增到收藏物件
    if (!collect[animalId]) {
      collect[animalId] = true;
      await updateUserData(userId, { collect });
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('加入收藏錯誤:', error);
    return { success: false, error: error.message };
  }
};

// 從收藏中移除動物
export const removeFromCollect = async (userId, animalId) => {
  try {
    // 先獲取當前收藏
    const userDataResult = await getUserData(userId);
    
    if (userDataResult.error) {
      throw new Error(userDataResult.error);
    }
    
    const userData = userDataResult.data || {};
    const collect = userData.collect || {};
    
    // 移除指定的 animalId
    if (collect[animalId]) {
      delete collect[animalId];
      await updateUserData(userId, { collect });
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('移除收藏錯誤:', error);
    return { success: false, error: error.message };
  }
};

// 監聽使用者資料變化
export const subscribeToUserData = (userId, callback) => {
  const userRef = ref(database, `users/${userId}`);
  
  return onValue(userRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ data: snapshot.val(), error: null });
    } else {
      callback({ data: null, error: null });
    }
  }, (error) => {
    console.error('監聽使用者資料錯誤:', error);
    callback({ data: null, error: error.message });
  });
};