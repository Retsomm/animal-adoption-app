# 動物領養平台 (Animal Adoption Web)

本專案是一個以 [Expo](https://expo.dev) + React Native Web 為基礎，串接台灣農委會動物收容所開放資料的動物領養平台。支援動物瀏覽、條件篩選、收藏、Google 登入等功能，並可部署於 Firebase Hosting。

## 功能特色

- 🔍 動物資料瀏覽與多條件篩選（地區、種類、性別等）
- ❤️ 收藏喜愛動物（需登入 Google 帳號）
- 📝 查看個人資料與收藏清單
- 🌗 支援明暗主題切換
- ⚡ 動物資料快取，提升載入速度
- 📱 RWD 響應式設計，支援桌機與行動裝置
- ☁️ Firebase Hosting 一鍵部署

## 快速開始

1. 安裝依賴

   ```sh
   npm install
   ```

2. 設定 Firebase 與環境變數

   - 複製 `.env.example` 為 `.env`，填入你的 Firebase API 金鑰等資訊
   - 參考 [app.config.js](app.config.js) 及 [firebase/firebaseConfig.js](firebase/firebaseConfig.js)

3. 啟動開發伺服器

   ```sh
   npx expo start
   ```

4. 開啟瀏覽器或模擬器預覽

## 專案結構

- `app/`：主要頁面與路由
- `components/`：共用元件
- `contexts/`：React Context 狀態管理
- `firebase/`：Firebase 設定與資料操作
- `hooks/`：自訂 Hook
- `constants/`：主題色彩等常數
- `assets/`：圖片與字型資源

## 部署到 Firebase Hosting

1. 建立 production build

   ```sh
   npm run build
   ```

2. 部署

   ```sh
   firebase deploy
   ```

## 參考資源

- [Expo 官方文件](https://docs.expo.dev/)
- [Firebase 官方文件](https://firebase.google.com/docs)
- [台灣農委會動物收容所開放資料](https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=QcbUEzN6E6DL)
