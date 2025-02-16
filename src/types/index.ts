export interface Config {
  github: {
    token: string;
    webhookSecret: string;
    appId: string;
  };
  server: {
    port: number;
  };
}

export interface ReviewResult {
  type: 'style' | 'security' | 'performance' | 'coverage';
  level: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
  suggestion?: string;
}
