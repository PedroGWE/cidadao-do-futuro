module.exports = {
  apps: [
    {
      name: 'cidadao-api',
      cwd: '/home/pedro/cidadao_do_futuro/apps/api',
      script: 'node',
      args: 'dist/main.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
    {
      name: 'cidadao-web',
      cwd: '/home/pedro/cidadao_do_futuro/apps/web',
      script: 'node',
      args: 'node_modules/.bin/next start -p 3000',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
    },
  ],
}
