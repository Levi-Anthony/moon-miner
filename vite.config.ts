import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      // Multi-page: the Phaser app (index.html) and the 3D substrate rebuild
      // (three.html) are both emitted, so the Pages deploy serves /three.html
      // alongside / during the migration.
      input: {
        main: 'index.html',
        three: 'three.html'
      }
    }
  }
});
