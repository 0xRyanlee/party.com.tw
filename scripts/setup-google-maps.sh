#!/bin/bash

# Google Maps API 快速設置腳本

echo "========================================="
echo "Google Maps API 快速設置"
echo "========================================="
echo ""

# 檢查 .env.local 是否存在
if [ -f ".env.local" ]; then
    echo "✅ .env.local 文件已存在"
else
    echo "📝 創建 .env.local 文件..."
    cp .env.local.example .env.local
    echo "✅ .env.local 文件已創建"
fi

echo ""
echo "請按照以下步驟設置 Google Maps API："
echo ""
echo "1️⃣  獲取 API Key"
echo "   前往: https://console.cloud.google.com/google/maps-apis/credentials"
echo "   - 創建或選擇專案"
echo "   - 啟用 Places API 和 Geocoding API"
echo "   - 創建 API Key"
echo ""
echo "2️⃣  編輯 .env.local 文件"
echo "   將您的 API Key 填入："
echo "   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=您的API_KEY"
echo ""
echo "3️⃣  重啟開發伺服器"
echo "   按 Ctrl+C 停止當前伺服器"
echo "   然後執行: npm run dev"
echo ""
echo "📚 完整指南: ./GOOGLE_MAPS_SETUP.md"
echo ""
echo "========================================="

# 詢問是否打開 .env.local
read -p "是否現在打開 .env.local 編輯？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]
then
    if command -v code &> /dev/null; then
        code .env.local
    elif command -v nano &> /dev/null; then
        nano .env.local
    else
        open .env.local
    fi
fi

echo ""
echo "設置完成後，重啟開發伺服器以生效！"
