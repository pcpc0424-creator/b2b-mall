import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

// 빌드 타임스탬프 추가 플러그인 - 캐시 버스팅용
function htmlTimestamp(): Plugin {
  return {
    name: 'html-timestamp',
    transformIndexHtml(html) {
      const timestamp = Date.now()
      return html.replace(
        '</head>',
        `  <meta name="build-timestamp" content="${timestamp}" />\n  </head>`
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), htmlTimestamp()],
  base: '/',
  build: {
    // 빌드 시 고유 해시 생성
    rollupOptions: {
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
})
