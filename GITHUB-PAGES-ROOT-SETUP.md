# 🚀 GitHub Pages 루트 도메인 설정 가이드

## 목표
`game-event-platform` 프로젝트를 `rhyme0203.github.io` 루트 도메인으로 설정

## 설정 방법

### 1단계: GitHub 저장소 이름 변경
1. https://github.com/rhyme0203/game-event-platform 접속
2. **Settings** 탭 클릭
3. **Repository name** 섹션에서:
   - 현재: `game-event-platform`
   - 변경: `rhyme0203.github.io` (정확히 이 이름으로)
4. **Rename** 버튼 클릭

### 2단계: GitHub Pages 설정
1. 변경된 저장소에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. **Source** 섹션에서:
   - "Deploy from a branch" 선택
   - Branch: **main** 선택
   - Folder: **/ (root)** 선택
4. **Save** 클릭

### 3단계: 도메인 확인
- 몇 분 후 다음 주소로 접속 가능:
  ```
  https://rhyme0203.github.io/
  ```

## 🔄 기존 Onl 프로젝트 보존
- 기존 `Onl` 프로젝트는 그대로 유지
- `rhyme0203.github.io` 루트만 `game-event-platform`으로 변경
- 기존 프로젝트는 다른 저장소나 서브도메인에서 계속 사용 가능

## 📝 참고사항
- GitHub Pages 루트 도메인은 `username.github.io` 저장소만 가능
- 저장소 이름을 정확히 `rhyme0203.github.io`로 변경해야 함
- 기존 저장소의 이슈, 위키 등은 그대로 유지됨
