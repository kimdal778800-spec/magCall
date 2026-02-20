#!/bin/bash
# ============================================
# 🚀 Next.js 자동 배포 스크립트 (캐시 최적화 포함)
# 위치: /home/myapp-client/deploy.sh
# ============================================

APP_PATH="/home/myapp-client"
APP_NAME="myapp"

echo ""
echo "==============================="
echo " 🚀  Next.js 배포 프로세스 시작 "
echo "==============================="
echo ""

cd $APP_PATH || exit

# 1️⃣ 기존 서버 중지
if pm2 list | grep -q $APP_NAME; then
  echo "🛑 기존 서버 중지 중..."
  pm2 stop $APP_NAME
else
  echo "ℹ️ 실행 중인 pm2 프로세스 없음."
fi

# 2️⃣ 캐시 및 이전 빌드 정리
echo "🧹 캐시 및 빌드 정리 중..."
rm -rf .next
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force
echo "✅ 캐시 및 빌드 정리 완료"

# 3️⃣ 패키지 재설치
echo "📦 패키지 재설치 중..."
npm install --omit=dev --no-audit --prefer-offline --no-fund
if [ $? -ne 0 ]; then
  echo "❌ npm install 실패. 로그 확인 후 재시도 필요."
  exit 1
fi
echo "✅ 패키지 설치 완료"

# 4️⃣ 빌드 실행
echo "⚙️ 빌드 중..."
npm run build
if [ $? -ne 0 ]; then
  echo "❌ 빌드 실패. 코드 확인 필요."
  exit 1
fi
echo "✅ 빌드 완료"

# 5️⃣ pm2 서버 실행
echo "🚀 서버 시작 중..."
pm2 start "npm start -- -H 0.0.0.0" --name $APP_NAME
pm2 save

# 6️⃣ 빌드 완료 후 디스크 정리
echo "🧽 npm 임시 캐시 및 로그 정리 중..."
npm cache verify > /dev/null 2>&1
find /tmp -type f -name "npm-*" -delete

echo ""
echo "==============================="
echo " ✅ 배포 완료: 서버 실행 중!"
echo "==============================="
echo ""
