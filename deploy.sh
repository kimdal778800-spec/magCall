#!/bin/bash

APP_DIR="/var/www/magCall"
APP_NAME="massage-call-app"

echo "===== 배포 시작 ====="

cd $APP_DIR

echo "[1/4] 최신 코드 pull..."
git pull magcall main

echo "[2/4] 의존성 설치..."
npm install --production

echo "[3/4] 빌드..."
npm run build

echo "[4/4] PM2 재시작..."
pm2 delete $APP_NAME 2>/dev/null || true
npm run serve

pm2 save

echo "===== 배포 완료 ====="
pm2 status
