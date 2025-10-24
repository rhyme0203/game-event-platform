# 🚀 GitHub Pages 배포 가이드

## GitHub Pages 활성화 방법

### 1단계: GitHub 저장소 설정
1. https://github.com/rhyme0203/game-event-platform 접속
2. **Settings** 탭 클릭
3. 왼쪽 메뉴에서 **Pages** 클릭
4. **Source** 섹션에서:
   - "Deploy from a branch" 선택
   - Branch: **main** 선택
   - Folder: **/ (root)** 선택
5. **Save** 클릭

### 2단계: 배포 확인
- 몇 분 후 다음 주소로 접속 가능:
  ```
  https://rhyme0203.github.io/game-event-platform/
  ```

### 3단계: AdSense 확인
- 최상위 도메인에서 AdSense가 제대로 작동하는지 확인
- 브라우저 개발자 도구에서 광고 로딩 상태 확인

## 🔄 업데이트 방법
코드를 수정한 후:
```bash
git add .
git commit -m "업데이트 내용"
git push origin main
```
GitHub Pages가 자동으로 업데이트됩니다.

## 📝 참고사항
- GitHub Pages는 정적 사이트만 지원 (백엔드 API는 별도 필요)
- 도메인은 `https://rhyme0203.github.io/game-event-platform/` 형태
- HTTPS 자동 지원
- 무료 사용 가능
