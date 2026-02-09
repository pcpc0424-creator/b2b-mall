import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = join(__dirname, '..', 'dist');
const indexPath = join(distPath, 'index.html');

// index.html 읽기
let html = readFileSync(indexPath, 'utf-8');

// 빌드 타임스탬프 추가
const timestamp = Date.now();

// 스크립트 태그에 버전 쿼리 스트링 추가
html = html.replace(
  /(<script[^>]+src="[^"]+)(">)/g,
  `$1?v=${timestamp}$2`
);

// 링크 태그(CSS)에도 버전 추가
html = html.replace(
  /(<link[^>]+href="[^"]+\.css)(")/g,
  `$1?v=${timestamp}$2`
);

// 메타 태그 추가
html = html.replace(
  '</head>',
  `  <meta name="build-version" content="${timestamp}" />\n  </head>`
);

// 저장
writeFileSync(indexPath, html);

console.log(`Cache bust applied: v=${timestamp}`);
