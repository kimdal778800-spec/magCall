#!/bin/bash
set -e

APP_DIR="/var/www/magCall"
APP_NAME="massage-call-app"

echo "===== 배포 시작 ====="

cd $APP_DIR

echo "[1/5] 로컬 변경 정리..."
git restore public/sitemap.xml public/sitemap-0.xml 2>/dev/null || true

echo "[2/5] 최신 코드 pull..."
git pull --rebase origin main

echo "[3/5] 의존성 설치 (package.json 변경 시에만)..."
PREV_HASH=$(cat .pkg_hash 2>/dev/null)
CURR_HASH=$(md5sum package.json | awk '{print $1}')
if [ "$PREV_HASH" != "$CURR_HASH" ]; then
    NODE_OPTIONS="--max-old-space-size=512" npm install
    echo $CURR_HASH > .pkg_hash
    echo "  → 패키지 설치 완료"
else
    echo "  → 변경 없음, 건너뜀"
fi

echo "[4/5] 빌드..."
NODE_OPTIONS="--max-old-space-size=1400" npm run build

echo "[5/5] PM2 재시작..."
pm2 delete all 2>/dev/null || true
pm2 start npm --name $APP_NAME -- start

pm2 save

echo "===== 배포 완료 ====="
pm2 status
