import { defineConfig } from 'vite';

export default defineConfig({
  // The commit a build was made from, stamped into run records (DEV-61). The
  // Pages workflow builds in Actions, where GITHUB_SHA is set; locally it's 'dev'.
  define: {
    __BUILD_SHA__: JSON.stringify((process.env.GITHUB_SHA ?? 'dev').slice(0, 7))
  },
  build: {
    chunkSizeWarningLimit: 1600,
    // The Levels game, Endless Night in 3D (night.html, DEV-66), and the
    // throwaway "find the fun" toys (toys/README.md).
    rollupOptions: {
      input: {
        main: 'index.html',
        night: 'night.html',
        toys: 'toys/index.html',
        homeRun: 'toys/home-run.html',
        terminator: 'toys/terminator.html'
      }
    }
  }
});
