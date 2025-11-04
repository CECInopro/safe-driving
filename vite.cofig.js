import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// ⚠️ Phải đúng với tên repo của bạn trên GitHub
export default defineConfig({
    plugins: [react()],
    base: '/safe-driving/',
});