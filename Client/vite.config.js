import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['aws-sdk', 'mock-aws-s3', 'nock', '@mapbox/node-pre-gyp']
  },
  server: {
        proxy: {
          "/api": "http://localhost:5000", // Replace 5000 with your backend port
        },
      }
});


// export default defineConfig({
//   server: {
//     proxy: {
//       "/api": "http://localhost:5000", // Replace 5000 with your backend port
//     },
//   },
// });
