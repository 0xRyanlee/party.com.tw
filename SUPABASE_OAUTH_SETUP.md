# Supabase OAuth 設定指南

本文件說明如何在 Supabase Dashboard 中設定 OAuth providers（Google、Line）。

---

## 📋 前置準備

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 選擇您的專案
3. 前往 **Authentication** → **Providers**

---

## 🔵 Google OAuth 設定

### 步驟 1：在 Supabase 啟用 Google Provider

1. 在 Supabase Dashboard 中，找到 **Google** provider
2. 點擊「Enable」
3. 記下 **Callback URL**（格式如下）：

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

### 步驟 2：設定 Google Cloud Console

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 選擇或創建專案
3. 啟用 **Google+ API**（在 API Library 中搜尋）
4. 前往 **APIs & Services** → **Credentials**
5. 點擊 **Create Credentials** → **OAuth 2.0 Client IDs**
6. 選擇 **Web application**
7. 設定 **Authorized redirect URIs**：
   - 貼上 Supabase 提供的 Callback URL
   - 格式：`https://<your-project-ref>.supabase.co/auth/v1/callback`
8. 點擊 **Create**

### 步驟 3：將 Credentials 填入 Supabase

1. 複製 Google 提供的：
   - **Client ID**
   - **Client Secret**
2. 回到 Supabase Dashboard → Google Provider
3. 貼上 Client ID 和 Client Secret
4. 點擊 **Save**

### 步驟 4：本地測試（可選）

如果需要在本地測試 OAuth，需額外設定：

1. 在 Google Cloud Console 的 **Authorized redirect URIs** 中添加：

   ```
   http://localhost:54321/auth/v1/callback
   ```

2. 在 `.env.local` 中添加：

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   ```

---

## 💚 Line Login 設定

### 步驟 1：創建 Line Login Channel

1. 前往 [Line Developers Console](https://developers.line.biz/console/)
2. 登入您的 Line 帳號
3. 創建 **Provider**（如果還沒有）
4. 點擊 **Create a LINE Login channel**
5. 填寫必要資訊：
   - **Channel name**: Party Taiwan
   - **Channel description**: 活動聚合平台
   - **App types**: Web app

### 步驟 2：設定 Callback URL

1. 在 Line Channel 設定中，找到 **Callback URL**
2. 填入 Supabase 提供的 Callback URL：

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

3. 儲存設定

### 步驟 3：獲取 Credentials

1. 在 Line Channel 的 **Basic settings** 頁面
2. 複製：
   - **Channel ID**
   - **Channel Secret**

### 步驟 4：在 Supabase 啟用 Line Provider

⚠️ **注意**：Supabase 目前不直接支援 Line Login，需要使用 **Custom OAuth Provider** 或等待官方支援。

**替代方案**：

- 暫時跳過 Line Login
- 或使用 Supabase 的 Custom OAuth 功能（較複雜）
- 建議先實施 Google OAuth 和 Email/Magic Link

---

## ✉️ Email / Magic Link 設定

### Email + Password

**無需額外設定**，Supabase 預設啟用。

### Magic Link

1. 在 Supabase Dashboard → **Authentication** → **Email Auth**
2. 確認 **Enable Email Confirmations** 已啟用
3. 設定 **Email Templates**（可選）：
   - 前往 **Authentication** → **Email Templates**
   - 自訂 Magic Link 郵件內容

---

## 🔐 安全性建議

1. **限制 OAuth Redirect URIs**：
   - 只允許您的正式域名和 Supabase Callback URL
   - 避免使用萬用字元（`*`）

2. **環境變數管理**：
   - 絕對不要將 `.env.local` 提交到 Git
   - 在 Vercel 部署時，在 **Environment Variables** 中設定所有變數

3. **定期更新 Secrets**：
   - 定期輪換 Client Secrets
   - 監控 OAuth 使用情況

---

## 📝 驗證清單

- [ ] Google OAuth 已在 Supabase 啟用
- [ ] Google Client ID 和 Secret 已填入 Supabase
- [ ] Callback URL 已在 Google Cloud Console 設定
- [ ] `.env.local` 已更新（本地開發）
- [ ] Vercel 環境變數已設定（正式環境）
- [ ] Email Auth 已啟用
- [ ] Magic Link 郵件模板已確認

---

## 🆘 常見問題

### Q: OAuth 登入後顯示 "redirect_uri_mismatch"

**A**: 檢查 Google Cloud Console 中的 Authorized redirect URIs 是否與 Supabase Callback URL 完全一致。

### Q: Magic Link 郵件沒有收到

**A**:

1. 檢查垃圾郵件資料夾
2. 確認 Supabase 的 Email Auth 已啟用
3. 檢查 Supabase Dashboard → Settings → Auth → SMTP（如需自訂郵件伺服器）

### Q: 本地開發時 OAuth 無法使用

**A**: 確保在 OAuth Provider 設定中添加了 `http://localhost:54321/auth/v1/callback`。

---

## 📚 參考資源

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Line Login Docs](https://developers.line.biz/en/docs/line-login/)
