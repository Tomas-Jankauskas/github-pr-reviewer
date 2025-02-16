import { Octokit } from '@octokit/rest';
import { Config, ReviewResult } from '../types';

export class ReviewManager {
  constructor(
    private octokit: Octokit,
    private config: Config
  ) {}

  async reviewPullRequest(owner: string, repo: string, pullNumber: number): Promise<ReviewResult[]> {
    const results: ReviewResult[] = [];

    // Get PR details
    const { data: pr } = await this.octokit.pulls.get({
      owner,
      repo,
      pull_number: pullNumber
    });

    // Get changed files
    const { data: files } = await this.octokit.pulls.listFiles({
      owner,
      repo,
      pull_number: pullNumber
    });

    // Analyze each file
    for (const file of files) {
      // Add analyzers here
      results.push({
        type: 'style',
        level: 'info',
        message: `Reviewing ${file.filename}`,
        file: file.filename
      });
    }

    return results;
  }

  async submitReview(owner: string, repo: string, pullNumber: number, results: ReviewResult[]) {
    const comments = results.map(result => ({
      path: result.file || '',
      line: result.line || 1,
      body: `**${result.type.toUpperCase()} ${result.level.toUpperCase()}**: ${result.message}${result.suggestion ? `\n\nSuggestion: ${result.suggestion}` : ''}`
    }));

    await this.octokit.pulls.createReview({
      owner,
      repo,
      pull_number: pullNumber,
      event: 'COMMENT',
      comments
    });
  }
}
