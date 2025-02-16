import { Octokit } from '@octokit/rest';
import { Config } from './types';
import { ReviewManager } from './services/reviewManager';

export class App {
  private octokit: Octokit;
  private reviewManager: ReviewManager;

  constructor(private config: Config) {
    this.octokit = new Octokit({
      auth: config.github.token
    });
    this.reviewManager = new ReviewManager(this.octokit, config);
  }

  async start() {
    console.log('Starting PR Reviewer...');
    // Initialize webhooks and start server
  }
}
