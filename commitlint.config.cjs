module.exports = {
  extends: ['@commitlint/config-conventional'],
  formatter: '@commitlint/format',
  rules: {
    'body-max-line-length': [2, 'always', 100],
    'footer-max-line-length': [2, 'always', 100],
    'header-max-length': [2, 'always', 72],
    'header-min-length': [2, 'always', 10],
    'scope-case': [2, 'always', 'lower-case'],
    'scope-empty': [0, 'never'],
    'scope-enum': [2, 'always', [
      'cli',
      'core',
      'deps',
      'docs',
      'infrastructure',
      'test',
      'ui',
      'none'
    ]],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'type-enum': [2, 'always', [
      'feat',
      'fix',
      'refactor',
      'docs',
      'chore',
      'perf',
      'test',
      'build',
      'ci',
      'revert'
    ]]
  }
};