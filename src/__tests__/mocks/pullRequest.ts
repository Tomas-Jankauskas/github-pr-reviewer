export const mockPullRequest = {
  number: 1,
  head: {
    sha: 'test-sha',
    ref: 'feature-branch'
  },
  base: {
    sha: 'base-sha',
    ref: 'main'
  },
  title: 'Test PR',
  body: 'Test PR description'
};

export const mockPullRequestFiles = [
  {
    filename: 'src/test.ts',
    status: 'modified',
    additions: 10,
    deletions: 5,
    changes: 15,
    patch: '@@ -1,5 +1,10 @@\n const x = 1;\n+const y = 2;\n+function test() {\n+  return x + y;\n+}'
  }
];