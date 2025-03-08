// firebase/auth.js
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
  } from 'firebase/auth';
  import { auth } from './firebaseConfig';
  
  // Google 登入
  export const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      const result = await signInWithPopup(auth, provider);
      return { user: result.user, error: null };
    } catch (error) {
      console.error('Google 登入錯誤:', error);
      return { user: null, error: error.message };
    }
  };
  
  // 登出
  export const logoutUser = async () => {
    try {
      await signOut(auth);
      return { success: true, error: null };
    } catch (error) {
      console.error('登出錯誤:', error);
      return { success: false, error: error.message };
    }
  };
  
  // 監聽身份驗證狀態 - 確保這個函數被正確導出
  export const subscribeToAuthChanges = (callback) => {
    return onAuthStateChanged(auth, callback);
  };
  
  // 取得當前使用者
  export const getCurrentUser = () => {
    return auth.currentUser;
  };