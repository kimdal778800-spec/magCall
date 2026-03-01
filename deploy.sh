#!/bin/bash

APP_DIR="/var/www/magCall"
APP_NAME="massage-call-app"

echo "===== 배포 시작 ====="

cd $APP_DIR

echo "[1/4] 최신 코드 pull..."
git pull git@github.com:kimdal778800-spec/magCall.git main

echo "[2/4] 의존성 설치..."
npm install

echo "[3/5] 이전 빌드 캐시 삭제..."
rm -rf .next

echo "[4/5] 빌드..."
npm run build

echo "[5/5] PM2 재시작..."
pm2 delete $APP_NAME 2>/dev/null || true
npm run serve

pm2 save

echo "===== 배포 완료 ====="
pm2 status
