#!/bin/bash

APP_DIR="/var/www/magCall"
APP_NAME="massage-call-app"

echo "===== 배포 시작 ====="

cd $APP_DIR

echo "[1/5] 로컬 변경 정리..."
git restore public/sitemap.xml public/sitemap-0.xml 2>/dev/null || true

echo "[2/5] 최신 코드 pull..."
git pull --rebase origin main

echo "[3/5] 의존성 설치..."
npm install

echo "[4/5] 이전 빌드 캐시 삭제..."
rm -rf .next

echo "[5/5] 빌드..."
npm run build

echo "[6/5] PM2 재시작..."
pm2 delete $APP_NAME 2>/dev/null || true
pm2 start npm --name $APP_NAME -- run serve

pm2 save

echo "===== 배포 완료 ====="
pm2 status
