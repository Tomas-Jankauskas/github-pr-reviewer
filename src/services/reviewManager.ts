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
      // Basic file size check
      const content = await this.octokit.repos.getContent({
        owner,
        repo,
        path: file.filename,
        ref: pr.head.sha
      });

      if ('content' in content.data) {
        const fileContent = Buffer.from(content.data.content, 'base64').toString();
        const lines = fileContent.split('\n');

        // Check file length
        if (lines.length > 300) {
          results.push({
            type: 'performance',
            level: 'warning',
            message: `File is quite long (${lines.length} lines). Consider breaking it into smaller modules.`,
            file: file.filename,
            line: 1
          });
        }

        // Check line length
        lines.forEach((line, index) => {
          if (line.length > 100) {
            results.push({
              type: 'style',
              level: 'info',
              message: 'Line is too long. Consider breaking it into multiple lines.',
              file: file.filename,
              line: index + 1,
              suggestion: 'Try to keep lines under 100 characters for better readability.'
            });
          }
        });
      }
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