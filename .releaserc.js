module.exports = {
  branches: ['main'],
  plugins: [
    '@semantic-release/commit-analyzer',
    '@semantic-release/release-notes-generator',
    '@semantic-release/changelog',
    [
      '@semantic-release/npm',
      {
        npmPublish: true,
        pkgRoot: 'dist', // 👉 On publie le contenu compilé
        registry: 'https://npm.pkg.github.com'
      }
    ],
    [
      '@semantic-release/github',
      {
        assets: [
          { path: 'dist/**/*.{js,d.ts}', label: 'Distribution' },
          { path: 'CHANGELOG.md', label: 'Changelog' }
        ],
        successComment: false,
        failComment: false,
        failTitle: false
      }
    ],
    [
      '@semantic-release/git',
      {
        assets: ['CHANGELOG.md'],
        message: 'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}'
      }
    ]
  ]
};
