import {defineConfig} from 'vite';

export default defineConfig({
  server: {watch: {ignored: ['**/.runtime-tmp/**', '**/test-results/**', '**/playwright-report/**']}},
});
