import { Config } from './types';
import * as dotenv from 'dotenv';

dotenv.config();

export const config: Config = {
  github: {
    token: process.env.GITHUB_TOKEN || '',
    webhookSecret: process.env.WEBHOOK_SECRET || '',
    appId: process.env.APP_ID || ''
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10)
  }
};
