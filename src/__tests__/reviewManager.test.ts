import { ReviewManager } from '../services/reviewManager';
import { Octokit } from '@octokit/rest';
import { Config } from '../types';

const mockConfig: Config = {
  github: {
    token: 'test-token',
    webhookSecret: 'test-secret',
    appId: 'test-app-id'
  },
  server: {
    port: 3000
  }
};

describe('ReviewManager', () => {
  let reviewManager: ReviewManager;
  let mockOctokit: jest.Mocked<Octokit>;

  beforeEach(() => {
    mockOctokit = {
      pulls: {
        get: jest.fn(),
        listFiles: jest.fn(),
        createReview: jest.fn()
      }
    } as any;

    reviewManager = new ReviewManager(mockOctokit, mockConfig);
  });

  describe('reviewPullRequest', () => {
    it('should review files in a pull request', async () => {
      // Mock PR data
      mockOctokit.pulls.get.mockResolvedValue({
        data: {
          number: 1,
          head: { sha: 'test-sha' }
        }
      });

      // Mock files data
      mockOctokit.pulls.listFiles.mockResolvedValue({
        data: [
          {
            filename: 'test.ts',
            patch: '@@ -1,3 +1,4 @@\n const x = 1;\n+const y = 2;'
          }
        ]
      });

      const results = await reviewManager.reviewPullRequest('owner', 'repo', 1);

      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({
        type: 'style',
        level: 'info',
        file: 'test.ts'
      });
    });
  });

  describe('submitReview', () => {
    it('should submit review comments', async () => {
      const results = [
        {
          type: 'style',
          level: 'error',
          message: 'Style error',
          file: 'test.ts',
          line: 1
        }
      ];

      await reviewManager.submitReview('owner', 'repo', 1, results);

      expect(mockOctokit.pulls.createReview).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        pull_number: 1,
        event: 'COMMENT',
        comments: [
          {
            path: 'test.ts',
            line: 1,
            body: '**STYLE ERROR**: Style error'
          }
        ]
      });
    });
  });
});