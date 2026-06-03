import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    allowedHosts: [
      'landmine-paralysis-truffle.ngrok-free.dev',
      'localhost'
    ]
  }
})