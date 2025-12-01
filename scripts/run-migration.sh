#!/bin/bash

# Migration 執行腳本
# 此腳本幫助執行資料庫 migration

echo "========================================="
echo "Party Aggregator Migration Script"
echo "========================================="
echo ""

# 檢查 Supabase CLI 是否安裝
if ! command -v supabase &> /dev/null
then
    echo "❌ Supabase CLI 未安裝"
    echo ""
    echo "請選擇以下方式執行 migration："
    echo ""
    echo "方式 1: 安裝 Supabase CLI (推薦)"
    echo "  brew install supabase/tap/supabase"
    echo "  然後再次執行此腳本"
    echo ""
    echo "方式 2: 使用 Supabase Dashboard"
    echo "  1. 前往 https://app.supabase.com"
    echo "  2. 選擇您的專案"
    echo "  3. 進入 SQL Editor"
    echo "  4. 開啟並複製 supabase/migrations/004_event_schema_form_refactor.sql"
    echo "  5. 貼上並執行"
    echo ""
    echo "方式 3: 使用 psql"
    echo "  psql [YOUR_DATABASE_URL]"
    echo "  \\i $(pwd)/supabase/migrations/004_event_schema_form_refactor.sql"
    echo ""
    exit 1
fi

echo "✅ Supabase CLI 已安裝"
echo ""

# 檢查是否在正確的目錄
if [ ! -d "supabase/migrations" ]; then
    echo "❌ 錯誤：未找到 supabase/migrations 目錄"
    echo "請確保您在專案根目錄執行此腳本"
    exit 1
fi

echo "📁 Migration 文件："
ls -1 supabase/migrations/
echo ""

# 詢問是否執行
echo "準備執行 migration..."
echo ""
echo "⚠️  注意事項："
echo "  - 這將修改資料庫結構"
echo "  - 建議先備份資料庫"
echo "  - 確保您已連接到正確的資料庫"
echo ""

read -p "是否繼續？ (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ 已取消"
    exit 1
fi

# 執行 migration
echo ""
echo "⏳ 執行 migration..."
echo ""

supabase db push

if [ $? -eq 0 ]; then
    echo ""
    echo "========================================="
    echo "✅ Migration 執行成功！"
    echo "========================================="
    echo ""
    echo "下一步："
    echo "1. 驗證資料庫變更"
    echo "2. 重啟開發伺服器（如果正在運行）"
    echo "3. 測試活動創建功能"
    echo ""
else
    echo ""
    echo "========================================="
    echo "❌ Migration 執行失敗"
    echo "========================================="
    echo ""
    echo "請檢查錯誤訊息並修正問題"
    echo "或使用 Dashboard 手動執行 migration"
    echo ""
    exit 1
fi
