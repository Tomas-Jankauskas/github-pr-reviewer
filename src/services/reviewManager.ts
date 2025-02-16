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
      // Only analyze files that were modified or added
      if (file.status === 'removed') continue;

      // Get the patch lines
      const patchLines = new Set<number>();
      if (file.patch) {
        const hunks = file.patch.split('@@');
        for (let i = 1; i < hunks.length; i += 2) {
          const hunkHeader = hunks[i];
          const match = hunkHeader.match(/\+(\d+),?(\d+)?/);
          if (match) {
            const start = parseInt(match[1]);
            const count = match[2] ? parseInt(match[2]) : 1;
            for (let line = start; line < start + count; line++) {
              patchLines.add(line);
            }
          }
        }
      }

      // Check file length
      if (file.additions > 300) {
        const firstLine = Array.from(patchLines)[0];
        if (firstLine) {
          results.push({
            type: 'performance',
            level: 'warning',
            message: `New changes add ${file.additions} lines. Consider breaking this into smaller modules.`,
            file: file.filename,
            line: firstLine
          });
        }
      }

      // Check line length in the patch
      const patchContent = file.patch || '';
      const patchLines2 = patchContent.split('\n');
      let currentLine = 1;

      patchLines2.forEach((line) => {
        if (line.startsWith('+') && line.length > 100 && patchLines.has(currentLine)) {
          results.push({
            type: 'style',
            level: 'info',
            message: 'Line is too long. Consider breaking it into multiple lines.',
            file: file.filename,
            line: currentLine,
            suggestion: 'Try to keep lines under 100 characters for better readability.'
          });
        }
        if (line.startsWith('+')) {
          currentLine++;
        }
      });
    }

    return results;
  }

  async submitReview(owner: string, repo: string, pullNumber: number, results: ReviewResult[]) {
    if (results.length === 0) {
      // If no issues found, submit a simple approval
      await this.octokit.pulls.createReview({
        owner,
        repo,
        pull_number: pullNumber,
        event: 'APPROVE',
        body: 'Code looks good! No style or performance issues found.'
      });
      return;
    }

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