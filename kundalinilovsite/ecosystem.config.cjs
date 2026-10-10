/**
 * PM2 ecosystem — https://pm2.keymetrics.io/docs/usage/application-declaration/
 *
 * Сервер:
 *   pm2 start ecosystem.config.cjs
 *   pm2 reload ecosystem.config.cjs --update-env
 *   pm2 save
 *   pm2 startup   # один раз — выполнить выведенную sudo-команду
 *
 * После обновления PM2: npm i -g pm2@latest && pm2 update
 */
/** @type {import('pm2').StartOptions} */
module.exports = {
  apps: [
    {
      name: "kundalinilovsite",
      cwd: __dirname,
      script: "npm",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: "5004",
      },
      instances: 1,
      exec_mode: "fork",
      max_memory_restart: "512M",
      exp_backoff_restart_delay: 500,
      max_restarts: 16,
    },
  ],
};
