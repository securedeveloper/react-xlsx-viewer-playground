import { readFileSync } from 'node:fs';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// `vite preview` serves the same security headers as Vercel (vercel.json),
// so the Content-Security-Policy is exercised locally before a deploy.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf8')) as {
  headers: Array<{ headers: Array<{ key: string; value: string }> }>;
};
const headers = Object.fromEntries(vercel.headers.flatMap((h) => h.headers.map(({ key, value }) => [key, value])));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  worker: { format: 'es' },
  build: { target: 'es2022' },
  preview: { headers },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    setupFiles: ['test/setup.ts'],
  },
});
