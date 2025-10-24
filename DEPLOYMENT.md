# 🚀 AWS 서버 배포 가이드

## 1단계: GitHub 저장소 생성 및 푸시

### GitHub에서 새 저장소 만들기
1. https://github.com/new 접속
2. Repository name: `game-event-platform` (또는 원하는 이름)
3. Public 또는 Private 선택
4. **"Add a README file" 체크 해제** (이미 있으므로)
5. "Create repository" 클릭

### 로컬에서 GitHub에 푸시
```bash
cd /Users/gosan/Project/game-event-platform

# GitHub 저장소 연결 (YOUR_USERNAME을 본인 GitHub 아이디로 변경)
git remote add origin https://github.com/YOUR_USERNAME/game-event-platform.git

# 푸시
git branch -M main
git push -u origin main
```

---

## 2단계: AWS 서버에 배포

### A. SSH로 AWS 서버 접속
```bash
# PEM 키가 있는 경우
ssh -i ~/your-key.pem ubuntu@your-aws-ip

# 또는 일반 SSH
ssh ubuntu@your-aws-ip
```

### B. 필요한 패키지 설치 (최초 1회만)
```bash
# 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# Git 설치 (없다면)
sudo apt install git -y

# Nginx 설치
sudo apt install nginx -y
```

### C. 프로젝트 클론 및 배포
```bash
# 홈 디렉토리에 클론
cd ~
git clone https://github.com/YOUR_USERNAME/game-event-platform.git

# Nginx 웹 루트에 복사
sudo rm -rf /var/www/html/*
sudo cp -r ~/game-event-platform/* /var/www/html/

# 권한 설정
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Nginx 재시작
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### D. 방화벽 설정 (필요시)
```bash
# UFW 사용하는 경우
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# AWS Security Group에서도 포트 80, 443 열기
```

---

## 3단계: 접속 확인

브라우저에서 접속:
```
http://your-aws-ip
```

또는 도메인이 있다면:
```
http://yourdomain.com
```

---

## 🔄 업데이트 방법 (수정사항 반영)

### 로컬에서 수정 후
```bash
cd /Users/gosan/Project/game-event-platform
git add -A
git commit -m "업데이트 내용"
git push origin main
```

### AWS 서버에서
```bash
cd ~/game-event-platform
git pull origin main
sudo cp -r ~/game-event-platform/* /var/www/html/
sudo systemctl restart nginx
```

---

## 🎯 자동 배포 스크립트

AWS 서버에 이 스크립트를 저장하면 편하게 업데이트 가능합니다.

`deploy.sh` 파일 생성:
```bash
#!/bin/bash

echo "🚀 게임 이벤트 플랫폼 배포 시작..."

# 프로젝트 디렉토리로 이동
cd ~/game-event-platform

# 최신 코드 받기
echo "📦 최신 코드 가져오는 중..."
git pull origin main

# Nginx 웹 루트에 복사
echo "📋 파일 복사 중..."
sudo cp -r ~/game-event-platform/* /var/www/html/

# 권한 설정
sudo chown -R www-data:www-data /var/www/html
sudo chmod -R 755 /var/www/html

# Nginx 재시작
echo "🔄 Nginx 재시작 중..."
sudo systemctl restart nginx

echo "✅ 배포 완료!"
echo "🌐 접속: http://$(curl -s ifconfig.me)"
```

실행 권한 부여:
```bash
chmod +x deploy.sh
```

사용:
```bash
./deploy.sh
```

---

## 🔒 HTTPS 설정 (선택사항)

도메인이 있다면 Let's Encrypt로 무료 SSL 인증서 설치:

```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx -y

# SSL 인증서 발급 및 자동 설정
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# 자동 갱신 테스트
sudo certbot renew --dry-run
```

---

## 📊 Nginx 설정 커스터마이징 (선택사항)

더 나은 성능을 위한 설정:

`/etc/nginx/sites-available/default` 수정:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/html;
    index index.html;

    # Gzip 압축
    gzip on;
    gzip_types text/css application/javascript text/html;

    # 캐싱
    location ~* \.(css|js|jpg|png|gif|ico)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML은 캐싱 안함
    location ~* \.html$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location / {
        try_files $uri $uri/ =404;
    }
}
```

설정 적용:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🐛 문제 해결

### Nginx 상태 확인
```bash
sudo systemctl status nginx
```

### Nginx 로그 확인
```bash
# 에러 로그
sudo tail -f /var/log/nginx/error.log

# 접속 로그
sudo tail -f /var/log/nginx/access.log
```

### 방화벽 상태 확인
```bash
sudo ufw status
```

### 포트 확인
```bash
sudo netstat -tulpn | grep :80
```

---

## 📝 체크리스트

- [ ] GitHub 저장소 생성
- [ ] 로컬 코드 푸시
- [ ] AWS 서버 SSH 접속
- [ ] Git & Nginx 설치
- [ ] 프로젝트 클론
- [ ] Nginx 설정
- [ ] AWS Security Group 포트 오픈
- [ ] 브라우저 접속 테스트
- [ ] (선택) SSL 인증서 설치
- [ ] (선택) 자동 배포 스크립트 설정

---

완료! 🎉

