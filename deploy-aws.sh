#!/bin/bash

# 🚀 AWS 서버 자동 배포 스크립트
# 사용법: ./deploy-aws.sh

echo "======================================"
echo "🚀 럭키빤쓰 배포 시작"
echo "======================================"
echo ""

# 프로젝트 디렉토리로 이동
cd ~/game-event-platform

# Git 최신 코드 가져오기
echo "📦 최신 코드 가져오는 중..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ Git pull 실패!"
    exit 1
fi

echo "✅ 코드 업데이트 완료"
echo ""

# Nginx 웹 루트에 복사
echo "📋 파일을 웹 서버로 복사 중..."
sudo cp -r ~/game-event-platform/* /var/www/html/

if [ $? -ne 0 ]; then
    echo "❌ 파일 복사 실패!"
    exit 1
fi

echo "✅ 파일 복사 완료"
echo ""

# 권한 설정
echo "🔐 파일 권한 설정 중..."
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

echo "✅ 권한 설정 완료"
echo ""

# Nginx 설정 테스트
echo "🔍 Nginx 설정 테스트 중..."
sudo nginx -t

if [ $? -ne 0 ]; then
    echo "❌ Nginx 설정 오류!"
    exit 1
fi

# Nginx 재시작
echo "🔄 Nginx 재시작 중..."
sudo systemctl restart nginx

if [ $? -ne 0 ]; then
    echo "❌ Nginx 재시작 실패!"
    exit 1
fi

echo "✅ Nginx 재시작 완료"
echo ""

# 서버 IP 가져오기
SERVER_IP=$(curl -s ifconfig.me)

echo "======================================"
echo "✅ 배포 완료!"
echo "======================================"
echo ""
echo "🌐 접속 주소:"
echo "   http://$SERVER_IP"
echo ""
echo "📊 Nginx 상태 확인:"
echo "   sudo systemctl status nginx"
echo ""
echo "📝 로그 확인:"
echo "   sudo tail -f /var/log/nginx/access.log"
echo "   sudo tail -f /var/log/nginx/error.log"
echo ""

