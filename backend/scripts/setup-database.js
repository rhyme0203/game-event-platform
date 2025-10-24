#!/usr/bin/env node

/**
 * 데이터베이스 설정 스크립트
 * Git에서 클론한 후 이 스크립트를 실행하면 데이터베이스가 자동으로 설정됩니다.
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 데이터베이스 파일 경로
const dbPath = path.join(__dirname, '..', 'database', 'game_platform.db');
const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
const dataPath = path.join(__dirname, '..', 'database', 'initial-data.sql');

console.log('🗄️  데이터베이스 설정을 시작합니다...');

// 데이터베이스 디렉토리 생성
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
  console.log('📁 데이터베이스 디렉토리를 생성했습니다.');
}

// 기존 데이터베이스 파일이 있으면 백업
if (fs.existsSync(dbPath)) {
  const backupPath = dbPath + '.backup.' + Date.now();
  fs.copyFileSync(dbPath, backupPath);
  console.log('💾 기존 데이터베이스를 백업했습니다:', backupPath);
}

// 데이터베이스 연결
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ 데이터베이스 연결 실패:', err.message);
    process.exit(1);
  } else {
    console.log('✅ SQLite 데이터베이스에 연결되었습니다.');
  }
});

// SQL 파일 실행 함수
function executeSQLFile(filePath, description) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ${description} 파일을 찾을 수 없습니다: ${filePath}`);
      resolve();
      return;
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`📄 ${description} 실행 중...`);
    
    db.exec(sql, (err) => {
      if (err) {
        console.error(`❌ ${description} 실행 실패:`, err.message);
        reject(err);
      } else {
        console.log(`✅ ${description} 완료`);
        resolve();
      }
    });
  });
}

// 데이터베이스 설정 실행
async function setupDatabase() {
  try {
    // 스키마 생성
    await executeSQLFile(schemaPath, '데이터베이스 스키마');
    
    // 초기 데이터 삽입
    await executeSQLFile(dataPath, '초기 데이터');
    
    console.log('🎉 데이터베이스 설정이 완료되었습니다!');
    console.log(`📊 데이터베이스 파일: ${dbPath}`);
    
    // 데이터베이스 연결 종료
    db.close((err) => {
      if (err) {
        console.error('❌ 데이터베이스 연결 종료 실패:', err.message);
        process.exit(1);
      } else {
        console.log('✅ 데이터베이스 설정 완료!');
        process.exit(0);
      }
    });
    
  } catch (error) {
    console.error('❌ 데이터베이스 설정 실패:', error);
    process.exit(1);
  }
}

// 스크립트 실행
setupDatabase();
